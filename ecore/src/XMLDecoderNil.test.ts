// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EClass, EOperation, EPackage, EResourceImpl, EResourceSetImpl, getEcorePackage, URI, XMICodec } from "./internal.js"

// An xsi:nil element of an object feature, as the encoder writes an unsettable feature set to nil,
// creates no object, and the elements after it are read in the object holding it: it took that
// object off the stack of the decoder, so the next element was read in its parent.
describe("XMLDecoder xsi:nil", () => {
    test("the Ecore package round-trips in XMI", () => {
        const source = getEcorePackage()
        const codec = new XMICodec()
        const bytes = codec.newEncoder(source.eResource(), null).encode(source.eResource()).unwrapOr(null)
        expect(bytes).not.toBeNull()
        const document = new TextDecoder().decode(bytes)
        expect(document).toContain('<eType xsi:nil="true"/>')

        const decoded = new EResourceImpl()
        decoded.setURI(new URI(source.getNsURI()))
        new EResourceSetImpl().getResources().add(decoded)
        const result = codec.newDecoder(decoded, null).decode(bytes)
        expect(result.isOk()).toBe(true)
        expect(
            decoded
                .getErrors()
                .toArray()
                .map((e) => e.message)
        ).toEqual([])
        const pkg = decoded.eContents().get(0) as EPackage
        const eObject = pkg.getEClassifier("EObject") as EClass
        const sourceOperations = source.getEObject().getEOperations()
        expect(eObject.getEOperations().size()).toBe(sourceOperations.size())
        for (let i = 0; i < sourceOperations.size(); i++) {
            const want = sourceOperations.get(i) as EOperation
            const got = eObject.getEOperations().get(i) as EOperation
            expect(got.getName()).toBe(want.getName())
            expect(got.getEParameters().size()).toBe(want.getEParameters().size())
        }
    })
})
