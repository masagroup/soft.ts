// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { BinaryDecoder } from "./BinaryDecoder.js"
import { BinaryOptions, EDiagnostic, EResourceSetImpl, getEcoreFactory, URI } from "./internal.js"
import { Decoder } from "./msgpack/Decoder.js"
import { Encoder } from "./msgpack/Encoder.js"
import { decodeULIDExtension } from "./msgpack/ULID.js"
import { decodeUUIDExtension } from "./msgpack/UUID.js"
import * as Types from "./msgpack/Types.js"

const binarySignature = Uint8Array.from([137, 101, 109, 102, 10, 13, 26, 10])

// encode returns the signature and the version of a binary resource followed by the given values
function encode(values: unknown[]): Uint8Array {
    const e = new Encoder()
    e.encodeBinary(binarySignature)
    e.encodeNumber(0)
    for (const value of values) {
        e.encode(value)
    }
    return e.bytes()
}

// a resource set whose package registry has the chain package: a Node contains its child Node
function newChainResourceSet(): EResourceSetImpl {
    const f = getEcoreFactory()
    const ePackage = f.createEPackage()
    ePackage.setName("chain")
    ePackage.setNsURI("http://chain")
    ePackage.setEFactoryInstance(f.createEFactory())
    const eClass = f.createEClass()
    eClass.setName("Node")
    ePackage.getEClassifiers().add(eClass)
    const eReference = f.createEReference()
    eReference.setName("child")
    eReference.setContainment(true)
    eReference.setEType(eClass)
    eClass.getEStructuralFeatures().add(eReference)
    const eResourceSet = new EResourceSetImpl()
    eResourceSet.getPackageRegistry().registerPackage(ePackage)
    return eResourceSet
}

// the bytes the encoder writes for a chain of depth nodes, each one containing the next
function newChain(depth: number): Uint8Array {
    // the first object: id, package (id, ns uri, uri id, uri, fragment), class (id, name)
    const values: unknown[] = [1, 0, 0, "http://chain", 0, "", "//", 0, "Node"]
    for (let i = 1; i < depth; i++) {
        // the child feature (id + 1, name the first time), then the child: id, package id, class id
        values.push(1)
        if (i == 1) {
            values.push("child")
        }
        values.push(i, 0, 0)
    }
    // the end of the features of every object
    for (let i = 0; i < depth; i++) {
        values.push(0)
    }
    return encode(values)
}

// decodeErrors decodes data in a new resource and returns the messages of its errors
function decodeErrors(data: Uint8Array, options?: Map<string, any>, eResourceSet = new EResourceSetImpl()): string[] {
    const eResource = eResourceSet.createResource(new URI("file:///bounds.bin"))
    new BinaryDecoder(eResource, options).decode(data)
    return eResource
        .getErrors()
        .toArray()
        .map((d: EDiagnostic) => d.message)
}

describe("BinaryDecoder bounds", () => {
    // a few bytes announcing 2^31 objects are refused before reading them
    test("hugeSize", () => {
        const errors = decodeErrors(encode([2 ** 31]))
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain(`invalid size ${2 ** 31}`)
    })

    test("negativeSize", () => {
        const errors = decodeErrors(encode([-5]))
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain("invalid size -5")
    })

    test("fractionalSize", () => {
        const errors = decodeErrors(encode([1.5]))
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain("invalid size 1.5")
    })

    // a string longer than the input is refused instead of being cut at its end
    test("stringLength", () => {
        // str8 announcing 255 bytes, followed by 2
        const data = Uint8Array.from([Types.Str8, 0xff, 0x61, 0x62])
        expect(() => new Decoder(data).decodeString()).toThrow(/only 2 bytes left/)
    })

    test("bytesLength", () => {
        const data = Uint8Array.from([Types.Bin32, 0x7f, 0xff, 0xff, 0xff, 1, 2])
        expect(() => new Decoder(data).decodeBinary()).toThrow(/only 2 bytes left/)
    })

    test("extensionLength", () => {
        const data = Uint8Array.from([Types.Ext32, 0xff, 0xff, 0xff, 0xf0, 1, 2, 3])
        expect(() => new Decoder(data).decode()).toThrow(/only 2 bytes left/)
    })

    // an object id is a scalar or an extension: an array is refused
    test("objectIDArray", () => {
        const data = Uint8Array.from([Types.Array32, 0x7f, 0xff, 0xff, 0xff])
        expect(() => new Decoder(data).decode()).toThrow()
    })

    // the uuid and ulid extensions have 16 bytes
    test("uuidAndUlidLength", () => {
        expect(() => decodeUUIDExtension(new Uint8Array(8))).toThrow("invalid uuid length 8")
        expect(() => decodeULIDExtension(new Uint8Array(17))).toThrow("invalid ulid length 17")
    })

    test("chain", () => {
        const eResourceSet = newChainResourceSet()
        const eResource = eResourceSet.createResource(new URI("file:///chain.bin"))
        new BinaryDecoder(eResource).decode(newChain(3))
        expect(eResource.getErrors().size()).toBe(0)
        const root = eResource.eContents().get(0)
        const child = root.eGet(root.eClass().getEStructuralFeatureFromName("child"))
        expect(child).not.toBeNull()
        expect(child.eGet(root.eClass().getEStructuralFeatureFromName("child"))).not.toBeNull()
    })

    test("maxDepthOption", () => {
        const data = newChain(10)
        const options = (maxDepth: number) => new Map<string, any>([[BinaryOptions.BINARY_OPTION_MAX_DEPTH, maxDepth]])
        expect(decodeErrors(data, options(10), newChainResourceSet())).toHaveLength(0)
        const errors = decodeErrors(data, options(9), newChainResourceSet())
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain("nested deeper than 9 objects")
    })

    // a nesting deeper than the default maximum, or than the stack, is an error of the resource
    test("defaultMaxDepth", () => {
        const errors = decodeErrors(newChain(BinaryOptions.BINARY_DEFAULT_MAX_DEPTH + 1), undefined, newChainResourceSet())
        expect(errors).toHaveLength(1)
    })
})
