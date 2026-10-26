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
    EList,
    EObject,
    EPackage,
    EReference,
    EResource,
    EResourceSetImpl,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY,
    URI,
    UUIDManager,
    XMLCodec,
    XMLOptions
} from "./internal.js"

class Model {
    ePackage: EPackage
    root: EClass
    item: EClass
    items: EReference
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
        this.items = f.createEReference()
        this.items.setName("items")
        this.items.setEType(this.item)
        this.items.setContainment(true)
        this.items.setUpperBound(UNBOUNDED_MULTIPLICITY)
        this.refs = f.createEReference()
        this.refs.setName("refs")
        this.refs.setEType(this.item)
        this.refs.setUpperBound(UNBOUNDED_MULTIPLICITY)
        this.root.getEStructuralFeatures().add(this.items)
        this.root.getEStructuralFeatures().add(this.refs)
        this.ePackage.getEClassifiers().add(this.root)
        this.ePackage.getEClassifiers().add(this.item)
    }

    newResource(): EResource {
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(this.ePackage)
        return eResourceSet.createResource(new URI("robust.xml"))
    }
}

function messages(eResource: EResource): string {
    return eResource
        .getErrors()
        .toArray()
        .map((d) => d.message)
        .join("\n")
}

describe("XMLDecoder robustness", () => {
    const malformed = `<?xml version="1.0" encoding="UTF-8"?>
<robust:Root xmlns:robust="urn:robust">
  <items name="first">
</robust:Root>`

    // a malformed document is reported as an error of the resource, not thrown
    test("malformed document is a resource error", () => {
        const eResource = new Model().newResource()
        expect(() => eResource.loadFromString(malformed)).not.toThrow()
        expect(eResource.getErrors().isEmpty()).toBeFalsy()
    })

    // the decoders return the error of a malformed document instead of throwing
    test("malformed document is a decode error", async () => {
        const m = new Model()
        const bytes = new TextEncoder().encode(malformed)
        const codec = new XMLCodec()

        const decoded = codec.newDecoder(m.newResource()).decode(bytes)
        expect(decoded.isErr()).toBeTruthy()

        const decodedObject = codec.newDecoder(m.newResource()).decodeObject(bytes)
        expect(decodedObject.isErr()).toBeTruthy()

        const stream = () =>
            new ReadableStream<Uint8Array>({
                start(controller) {
                    controller.enqueue(bytes)
                    controller.close()
                }
            })
        await expect(codec.newDecoder(m.newResource()).decodeAsync(stream())).rejects.toBeTruthy()
        await expect(codec.newDecoder(m.newResource()).decodeObjectAsync(stream())).rejects.toBeTruthy()
    })

    // a list of IDREFs is split on any white space, an empty one clearing the list
    test("IDREF list white space", () => {
        const m = new Model()
        const eResource = m.newResource()
        eResource.loadFromString(`<?xml version="1.0" encoding="UTF-8"?>
<robust:Root xmlns:robust="urn:robust" refs="  #//@items.0 &#9; #//@items.1&#10;">
  <items name="first"/>
  <items name="second"/>
</robust:Root>`)
        expect(messages(eResource)).toBe("")
        const root = eResource.eContents().get(0)
        const refs = root.eGet(m.refs) as EList<EObject>
        const items = root.eGet(m.items) as EList<EObject>
        expect(refs.toArray()).toEqual(items.toArray())

        const eEmpty = m.newResource()
        eEmpty.loadFromString(`<?xml version="1.0" encoding="UTF-8"?>
<robust:Root xmlns:robust="urn:robust" refs="">
  <items name="first"/>
</robust:Root>`)
        expect(messages(eEmpty)).toBe("")
        expect((eEmpty.eContents().get(0).eGet(m.refs) as EList<EObject>).isEmpty()).toBeTruthy()
    })

    // an id the id manager refuses is reported as an error of the resource, not thrown
    test("invalid id attribute is a resource error", () => {
        const eResource = new Model().newResource()
        eResource.setObjectIDManager(new UUIDManager())
        expect(() =>
            eResource.loadFromString(
                `<?xml version="1.0" encoding="UTF-8"?>
<robust:Root xmlns:robust="urn:robust" id="not-a-uuid"/>`,
                new Map([[XMLOptions.ID_ATTRIBUTE_NAME, "id"]])
            )
        ).not.toThrow()
        expect(eResource.getErrors().isEmpty()).toBeFalsy()
    })

    // the version and encoding of the XML declaration are read with either quote
    test("single quoted XML declaration", () => {
        const decoder = new XMLCodec().newDecoder(new Model().newResource()) as any
        decoder.decode(
            new TextEncoder().encode(`<?xml version='1.1' encoding='ISO-8859-1'?>
<robust:Root xmlns:robust="urn:robust"/>`)
        )
        expect(decoder.getXMLVersion()).toBe("1.1")
        expect(decoder.getEncoding()).toBe("ISO-8859-1")
    })
})
