// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import os from "os"
import path from "path"
import { afterEach, describe, expect, test } from "vitest"
import { createFileURI, EAnnotation, EObject, EPackage, EResource, EResourceSetImpl, isEAnnotation, URI, XMIProcessor } from "./internal.js"

// ecorePackage is an .ecore document of a package named name with the namespace urn:<name>, its root
// element carrying the attributes attrs, holding body.
function ecorePackage(name: string, attrs: string, body: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore" ${attrs}
    name="${name}" nsURI="urn:${name}" nsPrefix="${name}">
${body}
</ecore:EPackage>
`
}

const noteClass = `  <eClassifiers xsi:type="ecore:EClass" name="Note">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="text" eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
  </eClassifiers>`

const dirs: string[] = []

afterEach(() => {
    for (const dir of dirs.splice(0)) {
        fs.rmSync(dir, { recursive: true, force: true })
    }
})

// writeDocuments writes the documents by file name in a temporary directory, which it returns.
function writeDocuments(documents: Record<string, string>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "schemalocation-"))
    dirs.push(dir)
    for (const [name, document] of Object.entries(documents)) {
        fs.writeFileSync(path.join(dir, name), document)
    }
    return dir
}

// loadDocument loads the document name of dir in a new resource set.
function loadDocument(dir: string, name: string): EResource {
    return new XMIProcessor().loadSync(createFileURI(path.join(dir, name)))
}

function errorMessages(eResource: EResource): string {
    return eResource
        .getErrors()
        .toArray()
        .map((d) => d.message)
        .join("\n")
}

// annotationContent is the content i of the annotation of the package of the resource.
function annotationContent(eResource: EResource, i: number): EObject {
    expect(errorMessages(eResource)).toBe("")
    const ePackage = eResource.eContents().get(0) as EPackage
    const eAnnotation = ePackage.getEAnnotation("meta")
    expect(eAnnotation).toBeTruthy()
    return eAnnotation.getContents().get(i)
}

describe("XMIDecoder xsi:schemaLocation", () => {
    // a package named by xsi:schemaLocation loads from its location, relative to the document, when the
    // registry does not know its namespace, and is registered in the registry of the resource set
    test("loads the package of a location", () => {
        const dir = writeDocuments({
            "notes.ecore": ecorePackage("notes", "", noteClass),
            "document.ecore": ecorePackage(
                "document",
                `xmlns:notes="urn:notes" xsi:schemaLocation="urn:notes notes.ecore"`,
                `  <eAnnotations source="meta"><contents xsi:type="notes:Note" text="a note"/></eAnnotations>`
            )
        })
        const eResource = loadDocument(dir, "document.ecore")
        const note = annotationContent(eResource, 0)
        expect(note.eClass().getName()).toBe("Note")
        expect(note.eGet(note.eClass().getEStructuralFeatureFromName("text"))).toBe("a note")

        const eResourceSet = eResource.eResourceSet()
        const notes = eResourceSet.getPackageRegistry().getPackage("urn:notes")
        expect(notes).toBeTruthy()
        expect(note.eClass().getEPackage()).toBe(notes)
        expect(eResourceSet.getResources().size()).toBe(2)
    })

    // the package of a schema location loads with its own schema locations
    test("loads chained locations", () => {
        const dir = writeDocuments({
            "c.ecore": ecorePackage("c", "", noteClass),
            "b.ecore": ecorePackage(
                "b",
                `xmlns:c="urn:c" xsi:schemaLocation="urn:c c.ecore"`,
                noteClass + `\n  <eAnnotations source="meta"><contents xsi:type="c:Note" text="in b"/></eAnnotations>`
            ),
            "a.ecore": ecorePackage(
                "a",
                `xmlns:b="urn:b" xsi:schemaLocation="urn:b b.ecore"`,
                `  <eAnnotations source="meta"><contents xsi:type="b:Note" text="in a"/></eAnnotations>`
            )
        })
        const eResource = loadDocument(dir, "a.ecore")
        expect(annotationContent(eResource, 0).eClass().getEPackage().getNsURI()).toBe("urn:b")

        const b = eResource.eResourceSet().getResource(createFileURI(path.join(dir, "b.ecore")), false)
        expect(b).toBeTruthy()
        expect(annotationContent(b, 0).eClass().getEPackage().getNsURI()).toBe("urn:c")
    })

    // two packages naming each other in xsi:schemaLocation load once each: the package being loaded is
    // the one of the cycle
    test("loads a cycle of locations once", () => {
        const dir = writeDocuments({
            "a.ecore": ecorePackage(
                "a",
                `xmlns:b="urn:b" xsi:schemaLocation="urn:b b.ecore"`,
                noteClass + `\n  <eAnnotations source="meta"><contents xsi:type="b:Note" text="in a"/></eAnnotations>`
            ),
            "b.ecore": ecorePackage(
                "b",
                `xmlns:a="urn:a" xsi:schemaLocation="urn:a a.ecore"`,
                noteClass + `\n  <eAnnotations source="meta"><contents xsi:type="a:Note" text="in b"/></eAnnotations>`
            )
        })
        const eResource = loadDocument(dir, "a.ecore")
        const a = eResource.eContents().get(0) as EPackage
        expect(annotationContent(eResource, 0).eClass().getEPackage().getNsURI()).toBe("urn:b")

        const eResourceSet = eResource.eResourceSet()
        expect(eResourceSet.getResources().size()).toBe(2)
        const b = eResourceSet.getResource(createFileURI(path.join(dir, "b.ecore")), false)
        expect(b).toBeTruthy()
        expect(annotationContent(b, 0).eClass().getEPackage()).toBe(a)
    })

    // a schema location that does not load leaves the namespace unknown, the diagnostic naming the
    // location, and is not kept in the resource set
    test("reports a location that does not load", () => {
        const dir = writeDocuments({
            "document.ecore": ecorePackage(
                "document",
                `xmlns:notes="urn:notes" xsi:schemaLocation="urn:notes gone.ecore"`,
                `  <eAnnotations source="meta"><contents xsi:type="notes:Note" text="a note"/></eAnnotations>`
            )
        })
        const eResource = loadDocument(dir, "document.ecore")
        const message = errorMessages(eResource)
        expect(message).toContain("Package {'notes'='urn:notes'} not found")
        expect(message).toContain("gone.ecore")
        expect(eResource.eResourceSet().getResources().size()).toBe(1)
    })
})

describe("XMIEncoder annotation contents", () => {
    // the contents of an annotation, a feature typed EObject, are saved with their type, as EMF saves
    // them, and load back as the objects they were
    test("saves the type of the contents", () => {
        const dir = writeDocuments({
            "notes.ecore": ecorePackage("notes", "", noteClass),
            "document.ecore": ecorePackage(
                "document",
                `xmlns:notes="urn:notes" xsi:schemaLocation="urn:notes notes.ecore"`,
                `  <eAnnotations source="meta">
    <contents xsi:type="notes:Note" text="a note"/>
    <contents xsi:type="ecore:EAnnotation" source="nested"/>
  </eAnnotations>`
            )
        })
        const eResource = loadDocument(dir, "document.ecore")
        expect(errorMessages(eResource)).toBe("")

        const saved = new XMIProcessor().saveToString(eResource)
        expect(saved).toContain(`<contents xsi:type="notes:Note" text="a note"/>`)
        expect(saved).toContain(`<contents xsi:type="ecore:EAnnotation" source="nested"/>`)

        // the saved document loads with the notes package registered, without its schema location
        const notes = eResource.eResourceSet().getPackageRegistry().getPackage("urn:notes")
        expect(notes).toBeTruthy()
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(notes)
        const reloaded = eResourceSet.createResource(new URI("document.ecore"))
        reloaded.loadFromString(saved)
        const note = annotationContent(reloaded, 0)
        expect(note.eClass().getEPackage()).toBe(notes)
        expect(note.eGet(note.eClass().getEStructuralFeatureFromName("text"))).toBe("a note")
        const nested = annotationContent(reloaded, 1)
        expect(isEAnnotation(nested)).toBe(true)
        expect((nested as EAnnotation).getSource()).toBe("nested")
    })
})
