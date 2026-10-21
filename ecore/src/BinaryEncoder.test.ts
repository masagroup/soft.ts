// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import id128 from "id128"
import { describe, expect, test } from "vitest"
import { BinaryDecoder } from "./BinaryDecoder.js"
import { BinaryEncoder } from "./BinaryEncoder.js"
import {
    BinaryOptions,
    EAttribute,
    EClass,
    EPackage,
    EPackageRegistryImpl,
    EResource,
    EResourceImpl,
    EResourceSetImpl,
    getEcoreFactory,
    getEcorePackage,
    URI,
    uriToFilePath,
    UUIDManager,
    XMIProcessor,
    XMLOptions,
    XMLProcessor
} from "./internal.js"

function loadPackage(filename: string): EPackage {
    const xmiProcessor = new XMIProcessor()
    const uri = new URI("testdata/" + filename)
    const resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded()).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    return resource.eContents().get(0) as EPackage
}

describe("BinaryEncoder", () => {
    test("complex", () => {
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const resourceURI = new URI("testdata/library.complex.xml")
        const expectedURI = new URI("testdata/library.complex.bin")
        const xmlProcessor = new XMLProcessor([ePackage])
        const eResource = xmlProcessor.loadSync(resourceURI)
        expect(eResource.isLoaded()).toBeTruthy()
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(eResource.eContents().isEmpty()).toBeFalsy()
        const e = new BinaryEncoder(eResource)
        const r = e.encode(eResource)
        expect(r.isOk()).toBeTruthy()
        const expected = fs.readFileSync(uriToFilePath(expectedURI)).toString()
        const result = Buffer.from(r.unwrap()).toString()
        expect(result).toBe(expected)
    })

    test("complexWithID", () => {
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const resourceURI = new URI("testdata/library.complex.id.xml")
        const expectedURI = new URI("testdata/library.complex.id.bin")

        const eResource = new EResourceImpl()
        const idManager = new UUIDManager()
        eResource.setObjectIDManager(idManager)
        eResource.setURI(resourceURI)

        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getResources().add(eResource)
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        eResource.loadSync(new Map<string, any>([[XMLOptions.ID_ATTRIBUTE_NAME, "id"]]))
        expect(eResource.isLoaded()).toBeTruthy()
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(eResource.eContents().isEmpty()).toBeFalsy()

        const eDocumentRoot = eResource.eContents().get(0)
        expect(eDocumentRoot).not.toBeNull()
        expect(idManager.setID(eDocumentRoot, id128.Uuid4.fromCanonical("dc48710b-0e2e-419f-94fb-178c7fc1370b"))).toBeUndefined()

        const e = new BinaryEncoder(
            eResource,
            new Map<string, any>([
                [BinaryOptions.BINARY_OPTION_ID_ATTRIBUTE, true],
                [BinaryOptions.BINARY_OPTION_NAMESPACE_ATTRIBUTE, false]
            ])
        )
        const r = e.encode(eResource)
        expect(r.isOk()).toBeTruthy()
        const expected = fs.readFileSync(uriToFilePath(expectedURI)).toString()
        const result = Buffer.from(r.unwrap()).toString()
        expect(result).toBe(expected)
    })

    // The objects of another resource, or contained by an object of another resource, are encoded
    // as proxies, with the URI of their resource: a package referencing the data types of Ecore, or
    // a class of another package, decodes back to them.
    test("referencesToOtherResources", () => {
        const factory = getEcoreFactory()
        const base = factory.createEPackage()
        base.setName("base")
        base.setNsURI("http://example.com/base")
        const named = factory.createEClass()
        named.setName("Named")
        base.getEClassifiers().add(named)
        const baseResource = new EResourceImpl()
        baseResource.setURI(new URI(base.getNsURI()))
        baseResource.eContents().add(base)

        const derived = factory.createEPackage()
        derived.setName("derived")
        derived.setNsURI("http://example.com/derived")
        const item = factory.createEClass()
        item.setName("Item")
        item.getESuperTypes().add(named)
        const name = factory.createEAttribute()
        name.setName("name")
        name.setEType(getEcorePackage().getEString())
        item.getEStructuralFeatures().add(name)
        derived.getEClassifiers().add(item)
        const derivedResource = new EResourceImpl()
        derivedResource.setURI(new URI(derived.getNsURI()))

        const decode = (bytes: Uint8Array, alone: boolean): EPackage => {
            const rs = new EResourceSetImpl()
            const registry = new EPackageRegistryImpl()
            registry.registerPackage(getEcorePackage())
            registry.registerPackage(base)
            rs.setPackageRegistry(registry)
            const resource: EResource = rs.createResource(new URI(derived.getNsURI()))
            const decoder = new BinaryDecoder(resource)
            if (alone) {
                const r = decoder.decodeObject(bytes)
                expect(r.isOk()).toBeTruthy()
                resource.eContents().add(r.unwrap())
            } else {
                expect(decoder.decode(bytes).isOk()).toBeTruthy()
            }
            return resource.eContents().get(0) as EPackage
        }
        const check = (decoded: EPackage) => {
            const decodedItem = decoded.getEClassifier("Item") as EClass
            expect(decodedItem.getESuperTypes().get(0)).toBe(named)
            const decodedName = decodedItem.getEStructuralFeatureFromName("name") as EAttribute
            expect(decodedName.getEType()).toBe(getEcorePackage().getEString())
        }

        // The package alone, outside of its resource.
        const alone = new BinaryEncoder(derivedResource).encodeObject(derived)
        expect(alone.isOk()).toBeTruthy()
        check(decode(alone.unwrap(), true))

        // The resource of the package.
        derivedResource.eContents().add(derived)
        const whole = new BinaryEncoder(derivedResource).encode(derivedResource)
        expect(whole.isOk()).toBeTruthy()
        check(decode(whole.unwrap(), false))
    })
})
