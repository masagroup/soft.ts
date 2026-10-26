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
    EClass,
    EDiagnosticImpl,
    EObject,
    EPackage,
    EReference,
    EResource,
    EResourceSetImpl,
    ExtendedMetaData,
    getEcoreFactory,
    getEcorePackage,
    EList,
    IncrementalIDManager,
    UNBOUNDED_MULTIPLICITY,
    URI,
    XMICodec,
    XMLCodec,
    XMLOptions,
    XMLString
} from "./internal.js"

class Model {
    ePackage: EPackage
    root: EClass
    item: EClass
    ref: EReference
    refs: EReference

    constructor() {
        const f = getEcoreFactory()
        this.ePackage = f.createEPackage()
        this.ePackage.setName("robust")
        this.ePackage.setNsPrefix("robust")
        this.ePackage.setNsURI("urn:robust")
        this.root = f.createEClass()
        this.root.setName("Root")
        this.item = f.createEClass()
        this.item.setName("Item")
        const name = f.createEAttribute()
        name.setName("name")
        name.setEType(getEcorePackage().getEString())
        this.item.getEStructuralFeatures().add(name)
        this.ref = f.createEReference()
        this.ref.setName("ref")
        this.ref.setEType(this.item)
        this.root.getEStructuralFeatures().add(this.ref)
        this.refs = f.createEReference()
        this.refs.setName("refs")
        this.refs.setEType(this.item)
        this.refs.setUpperBound(UNBOUNDED_MULTIPLICITY)
        this.root.getEStructuralFeatures().add(this.refs)
        this.ePackage.getEClassifiers().add(this.root)
        this.ePackage.getEClassifiers().add(this.item)
    }

    newResource(): EResource {
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(this.ePackage)
        return eResourceSet.createResource(new URI("robust.xml"))
    }

    create(eClass: EClass): EObject {
        return this.ePackage.getEFactoryInstance().create(eClass)
    }
}

function encode(eResource: EResource, options?: Map<string, any>) {
    return new XMLCodec().newEncoder(eResource, options).encode(eResource)
}

describe("XMLEncoder robustness", () => {
    // a carriage return of a text content is kept as a reference, a parser normalizing it
    test("carriage return in text content", () => {
        const xml = new XMLString()
        xml.startElement("test")
        xml.addContent("content", "a\r\nb")
        xml.endElement()
        expect(xml.toString()).toContain("<content>a&#13;\nb</content>")
    })

    // the errors a resource has before it is encoded, as the ones of its loading, do not fail the encoding
    test("errors of the resource before encoding", () => {
        const m = new Model()
        const eResource = m.newResource()
        eResource.eContents().add(m.create(m.root))
        eResource.getErrors().add(new EDiagnosticImpl("an error of the loading", "robust.xml", 0, 0))
        const result = encode(eResource)
        expect(result.isOk()).toBeTruthy()
    })

    // an id is saved whatever its value, 0 included
    test("id 0 is saved", () => {
        const m = new Model()
        const eResource = m.newResource()
        eResource.setObjectIDManager(new IncrementalIDManager())
        eResource.eContents().add(m.create(m.root))
        const result = encode(eResource, new Map([[XMLOptions.ID_ATTRIBUTE_NAME, "id"]]))
        expect(result.isOk()).toBeTruthy()
        expect(new TextDecoder().decode(result.unwrap())).toContain('<robust:Root xmlns:robust="urn:robust" id="0"/>')
    })

    // an object in no resource that the id manager gave no id, in a list of cross references, is a
    // dangling reference
    test("reference to an object without id", () => {
        const m = new Model()
        const eResource = m.newResource()
        eResource.setObjectIDManager(new IncrementalIDManager())
        const root = m.create(m.root)
        eResource.eContents().add(root)
        const other = m.newResource()
        const crossed = m.create(m.item)
        other.eContents().add(crossed)
        const refs = root.eGet(m.refs) as EList<EObject>
        refs.add(crossed)
        refs.add(m.create(m.item))
        const result = encode(eResource)
        expect(result.isErr()).toBeTruthy()
        expect(result.isErr() && result.error.message).toContain("not contained in a resource")
    })
})

describe("XMI ExtendedMetaData", () => {
    // an XMI document uses the ExtendedMetaData names only when the options give an ExtendedMetaData
    test("names of the features", () => {
        const m = new Model()
        const f = getEcoreFactory()
        const label = f.createEAttribute()
        label.setName("label")
        label.setEType(getEcorePackage().getEString())
        const annotation = f.createEAnnotation()
        annotation.setSource("http:///org/eclipse/emf/ecore/util/ExtendedMetaData")
        annotation.getDetails().put("name", "the-label")
        label.getEAnnotations().add(annotation)
        m.root.getEStructuralFeatures().add(label)
        const eResource = m.newResource()
        const root = m.create(m.root)
        root.eSet(label, "a label")
        eResource.eContents().add(root)

        const codec = new XMICodec()
        const plain = new TextDecoder().decode(codec.newEncoder(eResource).encode(eResource).unwrap())
        expect(plain).toContain(' label="a label"')
        const named = new TextDecoder().decode(
            codec
                .newEncoder(eResource, new Map([[XMLOptions.EXTENDED_META_DATA, new ExtendedMetaData()]]))
                .encode(eResource)
                .unwrap()
        )
        expect(named).toContain(' the-label="a label"')

        const eReloaded = m.newResource()
        expect(codec.newDecoder(eReloaded).decode(new TextEncoder().encode(plain)).isOk()).toBeTruthy()
        expect(eReloaded.eContents().get(0).eGet(label)).toBe("a label")
    })
})
