// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import {
    EAttribute,
    EClass,
    EList,
    ENamedElement,
    EObject,
    EObjectInternal,
    EPackage,
    EReference,
    EResourceSetImpl,
    ExtendedMetaData,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY,
    URI,
    XMLOptions
} from "./internal.js"

function withKind(element: ENamedElement, kind: string, name?: string) {
    const annotation = getEcoreFactory().createEAnnotation()
    annotation.setSource("http:///org/eclipse/emf/ecore/util/ExtendedMetaData")
    annotation.getDetails().put("kind", kind)
    if (name) {
        annotation.getDetails().put("name", name)
    }
    element.getEAnnotations().add(annotation)
}

class KindsModel {
    ePackage: EPackage
    root: EClass
    target: EClass
    note: EClass
    ref: EReference
    refs: EReference
    children: EReference
    notes: EReference
    targetName: EAttribute
    noteText: EAttribute
    category: EAttribute

    constructor() {
        const f = getEcoreFactory()
        this.ePackage = f.createEPackage()
        this.ePackage.setName("kinds")
        this.ePackage.setNsPrefix("kinds")
        this.ePackage.setNsURI("urn:kinds")
        const newClass = (name: string): EClass => {
            const c = f.createEClass()
            c.setName(name)
            this.ePackage.getEClassifiers().add(c)
            return c
        }
        const newAttribute = (owner: EClass, name: string): EAttribute => {
            const a = f.createEAttribute()
            a.setName(name)
            a.setEType(getEcorePackage().getEString())
            owner.getEStructuralFeatures().add(a)
            return a
        }
        const newReference = (owner: EClass, name: string, target: EClass, containment: boolean, many: boolean): EReference => {
            const r = f.createEReference()
            r.setName(name)
            r.setEType(target)
            r.setContainment(containment)
            if (many) {
                r.setUpperBound(UNBOUNDED_MULTIPLICITY)
            }
            owner.getEStructuralFeatures().add(r)
            return r
        }
        this.root = newClass("Root")
        this.target = newClass("Target")
        this.note = newClass("Note")
        this.targetName = newAttribute(this.target, "name")
        this.noteText = newAttribute(this.note, "text")
        withKind(this.noteText, "simple", ":0")
        this.category = newAttribute(this.root, "category")
        withKind(this.category, "element")
        this.ref = newReference(this.root, "ref", this.target, false, false)
        withKind(this.ref, "attribute")
        this.refs = newReference(this.root, "refs", this.target, false, true)
        withKind(this.refs, "attribute")
        this.children = newReference(this.root, "children", this.target, true, true)
        this.notes = newReference(this.root, "notes", this.note, true, true)
    }

    create(eClass: EClass): EObject {
        return this.ePackage.getEFactoryInstance().create(eClass)
    }

    save(root: EObject): string {
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(this.ePackage)
        const eResource = eResourceSet.createResource(new URI("root.xml"))
        eResource.eContents().add(root)
        const encoded = eResource.saveToString(new Map([[XMLOptions.EXTENDED_META_DATA, new ExtendedMetaData()]]))
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        return encoded
    }

    roundTrip(root: EObject): [string, EObject] {
        const encoded = this.save(root)
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(this.ePackage)
        const eReloaded = eResourceSet.createResource(new URI("reloaded.xml"))
        eReloaded.loadFromString(encoded, new Map([[XMLOptions.EXTENDED_META_DATA, new ExtendedMetaData()]]))
        expect(eReloaded.getErrors().isEmpty()).toBeTruthy()
        expect(eReloaded.eContents().size()).toBe(1)
        return [encoded, eReloaded.eContents().get(0)]
    }
}

describe("XMLEncoder ExtendedMetaData kinds", () => {
    // a reference declared kind="attribute" is written as an attribute and read back as one
    test("attribute reference to another resource", () => {
        const m = new KindsModel()
        const proxy = (uri: string): EObject => {
            const o = m.create(m.target) as EObjectInternal
            o.eSetProxyURI(new URI(uri))
            return o
        }
        const root = m.create(m.root)
        root.eSet(m.ref, proxy("other.xml#//first"))
        const refs = root.eGet(m.refs) as EList<EObject>
        refs.add(proxy("other.xml#//first"))
        refs.add(proxy("other.xml#//second"))

        const [encoded, reloaded] = m.roundTrip(root)
        expect(encoded).toContain(' ref="other.xml#//first"')
        expect(encoded).toContain(' refs="other.xml#//first other.xml#//second"')
        expect(encoded).not.toContain("href=")
        expect((reloaded.eGetResolve(m.ref, false) as EObjectInternal).eProxyURI().toString()).toBe("other.xml#//first")
        expect((reloaded.eGetResolve(m.refs, false) as EList<EObject>).size()).toBe(2)
    })

    // a kind="attribute" reference to an object in no resource is saved as an IDREF, not an error
    test("attribute reference to a detached object", () => {
        const m = new KindsModel()
        const root = m.create(m.root)
        root.eSet(m.ref, m.create(m.target))
        const encoded = m.save(root)
        expect(encoded).toContain(' ref="#')
        expect(encoded).not.toContain("href=")
    })

    // a kind="simple" attribute is the text of the element
    test("simple content is element text", () => {
        const m = new KindsModel()
        const root = m.create(m.root)
        const note = m.create(m.note)
        note.eSet(m.noteText, "en g/m3 & more")
        ;(root.eGet(m.notes) as EList<EObject>).add(note)

        const [encoded, reloaded] = m.roundTrip(root)
        expect(encoded).toContain(">en g/m3 &amp; more</notes>")
        expect((reloaded.eGet(m.notes) as EList<EObject>).get(0).eGet(m.noteText)).toBe("en g/m3 & more")
    })

    // a single attribute declared kind="element" is written as a child element
    test("element attribute is a child element", () => {
        const m = new KindsModel()
        const root = m.create(m.root)
        root.eSet(m.category, "ANT & co")

        const [encoded, reloaded] = m.roundTrip(root)
        expect(encoded).toContain("<category>ANT &amp; co</category>")
        expect(encoded).not.toContain(' category="')
        expect(reloaded.eGet(m.category)).toBe("ANT & co")
    })
})
