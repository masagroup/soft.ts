// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { EAttribute, EClass, EClassifier, EPackage, EReference, EResourceImpl, URI, uriToFilePath } from "./internal.js"

describe("XMICodec", () => {
    describe("load.library.simple", () => {
        const resource = new EResourceImpl()
        resource.setURI(new URI("testdata/library.simple.ecore"))

        beforeEach(() => {
            resource.unload()
            expect(resource.isLoaded()).toBeFalsy()
        })

        afterEach(() => {
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            const contents = resource.eContents()
            expect(contents.size()).toBe(1)

            const ePackage = contents.get(0) as EPackage
            expect(ePackage).not.toBeNull()
            expect(ePackage.getName()).toBe("library")
            expect(ePackage.getNsPrefix()).toBe("lib")
            expect(ePackage.getNsURI()).toBe("http:///org/eclipse/emf/examples/library/library.simple.ecore/1.0.0")

            const eClassifiers = ePackage.getEClassifiers()
            expect(eClassifiers.size()).toBe(2)

            const eBookStore = eClassifiers.get(0) as EClassifier
            expect(eBookStore).not.toBeNull()
            expect(eBookStore.getName()).toBe("Library")

            const eBookStoreClass = eBookStore as EClass
            expect(eBookStoreClass).not.toBeNull()
            expect(eBookStoreClass.getFeatureCount()).toBe(3)

            const eOwnerAttribute = eBookStoreClass.getEStructuralFeature(0) as EAttribute
            expect(eOwnerAttribute.getName()).toBe("owner")
            const eOwnerAttributeType = eOwnerAttribute.getEAttributeType()
            expect(eOwnerAttributeType.getName()).toBe("EString")

            const eLocationAttribute = eBookStoreClass.getEStructuralFeature(1) as EAttribute
            expect(eLocationAttribute.getName()).toBe("location")
            const eLocationType = eLocationAttribute.getEAttributeType()
            expect(eLocationType).not.toBeNull()

            const eBooksReference = eBookStoreClass.getEStructuralFeature(2) as EReference
            expect(eBooksReference.getName()).toBe("books")

            const eBookClass = eClassifiers.get(1) as EClass
            expect(eBookClass.getName()).toBe("Book")
            expect(eBookClass.getFeatureCount()).toBe(2)

            const eNameAttribute = eBookClass.getEStructuralFeature(0) as EAttribute
            expect(eNameAttribute.getName()).toBe("name")

            const eISBNFeature = eBookClass.getEStructuralFeature(1) as EAttribute
            expect(eISBNFeature.getName()).toBe("isbn")

            // check resolved reference
            expect(eBooksReference.getEReferenceType()).toBe(eBookClass)
        })

        test("load", async () => {
            await resource.load()
        })

        test("loadFromStream", async () => {
            const path = uriToFilePath(resource.getURI())
            const stream = fs.createReadStream(path)
            await resource.loadFromStream(stream)
        })
    })

    describe("load.library.noroot", () => {
        const resource = new EResourceImpl()
        resource.setURI(new URI("testdata/library.noroot.ecore"))

        beforeEach(() => {
            resource.unload()
            expect(resource.isLoaded()).toBeFalsy()
        })

        afterEach(() => {
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            const contents = resource.eContents()
            expect(contents.size()).toBe(1)

            const ePackage = contents.get(0) as EPackage
            expect(ePackage).not.toBeNull()

            const eClassifiers = ePackage.getEClassifiers()
            const eBook = eClassifiers.get(0) as EClassifier
            expect(eBook).not.toBeNull()
            expect(eBook.getName()).toBe("Book")

            const eBookClass = eBook as EClass
            expect(eBookClass).not.toBeNull()
            const eSuperTypes = eBookClass.getESuperTypes()
            expect(eSuperTypes.size()).toBe(1)
            const eCirculatingItemClass = eSuperTypes.get(0)
            expect(eCirculatingItemClass.getName()).toBe("CirculatingItem")

            const eWriterClass = eClassifiers.get(2) as EClass
            expect(eWriterClass).not.toBeNull()
            expect(eWriterClass.getEAnnotations().isEmpty()).toBeFalsy()
            const eAnnotation = eWriterClass.getEAnnotation("http://net.masagroup/soft/2020/GenTS")
            expect(eAnnotation).not.toBeNull()
            expect(eAnnotation.getDetails().getValue("extension")).toBe("true")
        })

        test("load", async () => {
            await resource.load()
        })

        test("loadFromStream", async () => {
            const path = uriToFilePath(resource.getURI())
            const stream = fs.createReadStream(path)
            await resource.loadFromStream(stream)
        })
    })

    describe("load.library.complex", () => {
        const resource = new EResourceImpl()
        resource.setURI(new URI("testdata/library.complex.ecore"))

        beforeEach(() => {
            resource.unload()
            expect(resource.isLoaded()).toBeFalsy()
        })

        afterEach(() => {
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            const contents = resource.eContents()
            expect(contents.size()).toBe(1)

            const ePackage = contents.get(0) as EPackage
            const eClassifiers = ePackage.getEClassifiers()

            const eDocumentRootClass = eClassifiers.get(0) as EClass
            expect(eDocumentRootClass).not.toBeNull()
            expect(eDocumentRootClass.getName()).toBe("DocumentRoot")

            const eXMNLSPrefixFeature = eDocumentRootClass.getEStructuralFeatureFromName("xMLNSPrefixMap") as EReference
            expect(eXMNLSPrefixFeature).not.toBeNull()

            const eType = eXMNLSPrefixFeature.getEType()
            expect(eType).not.toBeNull()
            expect(eType.getName()).toBe("EStringToStringMapEntry")
            expect(eType.eIsProxy()).toBeFalsy()
        })

        test("load", async () => {
            await resource.load()
        })

        test("loadFromStream", async () => {
            const path = uriToFilePath(resource.getURI())
            const stream = fs.createReadStream(path)
            await resource.loadFromStream(stream)
        })

        test("loadFromString", () => {
            const path = uriToFilePath(resource.getURI())
            const buffer = fs.readFileSync(path)
            resource.loadFromString(buffer.toString())
        })
    })

    describe("save.library.simple", () => {
        test("saveToString", async () => {
            const resource = new EResourceImpl()
            resource.setURI(new URI("testdata/library.simple.ecore"))
            await resource.load()

            const result = resource.saveToString()
            const expected = fs
                .readFileSync(uriToFilePath(resource.getURI()))
                .toString()
                .replace(/\r?\n|\r/g, "\n")

            expect(result).toBe(expected)
        })
    })

    describe("save.library.complex", () => {
        test("saveToString", async () => {
            const resource = new EResourceImpl()
            resource.setURI(new URI("testdata/library.complex.ecore"))
            await resource.load()

            const result = resource.saveToString()
            const expected = fs
                .readFileSync(uriToFilePath(resource.getURI()))
                .toString()
                .replace(/\r?\n|\r/g, "\n")

            expect(result).toBe(expected)
        })
    })
})
