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
import { BinaryEncoder } from "./BinaryEncoder.js"
import { EClass, EDiagnostic, EPackage, EResourceSetImpl, getEcoreFactory, getEcorePackage, URI } from "./internal.js"

// a package found by fuzzing soft.sync.go: its class Item is among its own super types
const superTypesCycleInput = Uint8Array.from(
    Buffer.from(
        "\xc4\b\x89emf\n\r\x1a\n\x00\x00\x00\xd9%http://www.eclipse.org/emf/2002/Ecore\x00\xd9%http://www.eclipse.org/emf/2002/Ecore\xa1/\x00\xa8EPackage\x02\xa4name\xa7derived\x03\xa5nsURI\xbahttp://example.com/derived\x04\xa8nsPrefix\xa7derived\x06\xaceClassifiers\x01\x01\x00\x01\xa6EClass\x02\xa4name\xa4Item\x0e\xabeSuperTypes\x01\x01\x00\x00\x10\x00e\xa7//Named\xe6\x00\x07\xaceSubPackages\x01\x00\x00\x02\xa3sub\x03\xbehttp://example.com/derived/sub\x06\x01\x04\x00\x01\x02\xa4Part\x00\x00\xf4",
        "latin1"
    )
)

// encodeSuperTypes encodes a package of the classes a, b and c, with the super types given by their
// indices: its resource, and the package alone
function encodeSuperTypes(superTypes: Map<number, number[]>): [Uint8Array, Uint8Array] {
    const f = getEcoreFactory()
    const ePackage = f.createEPackage()
    ePackage.setName("cycle")
    ePackage.setNsURI("http://example.com/cycle")
    const classes: EClass[] = []
    for (const name of ["a", "b", "c"]) {
        const eClass = f.createEClass()
        eClass.setName(name)
        const eAttribute = f.createEAttribute()
        eAttribute.setName(name + "Attribute")
        eAttribute.setEType(getEcorePackage().getEString())
        eClass.getEStructuralFeatures().add(eAttribute)
        ePackage.getEClassifiers().add(eClass)
        classes.push(eClass)
    }
    for (const [i, supers] of superTypes) {
        for (const j of supers) {
            classes[i].getESuperTypes().add(classes[j])
        }
    }
    const eResource = new EResourceSetImpl().createResource(new URI("file:///cycle.ecore"))
    eResource.eContents().add(ePackage)
    const result = new BinaryEncoder(eResource).encode(eResource)
    expect(result.isOk(), result.isErr() ? result.error.message : "").toBeTruthy()
    const objectResult = new BinaryEncoder(eResource).encodeObject(ePackage)
    expect(objectResult.isOk(), objectResult.isErr() ? objectResult.error.message : "").toBeTruthy()
    return [result.unwrap(), objectResult.unwrap()]
}

async function* stream(data: Uint8Array): AsyncIterable<Uint8Array> {
    yield data
}

function errors(eResource: { getErrors(): { toArray(): EDiagnostic[] } }): string[] {
    return eResource
        .getErrors()
        .toArray()
        .map((d) => d.message)
}

describe("BinaryDecoder super types cycle", () => {
    test("fuzzed", () => {
        const eResource = new EResourceSetImpl().createResource(new URI("file:///cycle.bin"))
        const result = new BinaryDecoder(eResource).decodeObject(superTypesCycleInput)
        expect(result.isErr()).toBeTruthy()
        expect(result.isErr() && result.error.message).toContain("cycle of super types")
    })

    // a package whose super types close a cycle is refused, by decode and decodeObject
    test.each([
        ["self", new Map([[0, [0]]])],
        [
            "two classes",
            new Map([
                [0, [1]],
                [1, [0]]
            ])
        ],
        [
            "three classes",
            new Map([
                [0, [1]],
                [1, [2]],
                [2, [0]]
            ])
        ],
        [
            "above a cycle",
            new Map([
                [2, [0]],
                [0, [1]],
                [1, [0]]
            ])
        ]
    ])("%s", (_, superTypes) => {
        const [data, objectData] = encodeSuperTypes(superTypes)

        const eResource = new EResourceSetImpl().createResource(new URI("file:///cycle.bin"))
        const result = new BinaryDecoder(eResource).decode(data)
        expect(result.isErr()).toBeTruthy()
        const messages = errors(eResource)
        expect(messages.length).toBe(1)
        expect(messages[0]).toContain("cycle of super types")
        expect(eResource.eContents().isEmpty()).toBeTruthy()

        const eObjectResource = new EResourceSetImpl().createResource(new URI("file:///cycle.bin"))
        const objectResult = new BinaryDecoder(eObjectResource).decodeObject(objectData)
        expect(objectResult.isErr() && objectResult.error.message).toContain("cycle of super types")
    })

    test("async", async () => {
        const [data, objectData] = encodeSuperTypes(new Map([[0, [0]]]))
        const eResource = new EResourceSetImpl().createResource(new URI("file:///cycle.bin"))
        await expect(new BinaryDecoder(eResource).decodeAsync(stream(data))).rejects.toThrow("cycle of super types")
        expect(errors(eResource).length).toBe(1)
        expect(eResource.eContents().isEmpty()).toBeTruthy()
        const eObjectResource = new EResourceSetImpl().createResource(new URI("file:///cycle.bin"))
        await expect(new BinaryDecoder(eObjectResource).decodeObjectAsync(stream(objectData))).rejects.toThrow("cycle of super types")
    })

    // a hierarchy without cycle, diamond included, is decoded
    test("diamond", () => {
        const [data] = encodeSuperTypes(
            new Map([
                [1, [0]],
                [2, [0, 1]]
            ])
        )
        const eResource = new EResourceSetImpl().createResource(new URI("file:///diamond.bin"))
        new BinaryDecoder(eResource).decode(data)
        expect(errors(eResource)).toEqual([])
        const ePackage = eResource.eContents().get(0) as EPackage
        const c = ePackage.getEClassifier("c") as EClass
        expect(c.getEAllAttributes().size()).toBe(3)
    })
})
