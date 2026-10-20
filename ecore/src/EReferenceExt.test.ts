// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EReferenceExt, getEcoreFactory, getEcorePackage } from "./internal.js"

describe("EReferenceExt", () => {
    test("getEReferenceType", () => {
        const r = new EReferenceExt()
        expect(r.getEReferenceType()).toBeNull()

        const c1 = getEcoreFactory().createEClass()
        r.setEType(c1)
        expect(r.getEReferenceType()).toBe(c1)

        // follows a later change of the type
        const c2 = getEcoreFactory().createEClass()
        r.setEType(c2)
        expect(r.getEReferenceType()).toBe(c2)

        // a data type is not a reference type
        r.setEType(getEcorePackage().getEString())
        expect(r.getEReferenceType()).toBeNull()
    })

    test("basicGetEReferenceType", () => {
        const r = new EReferenceExt()
        expect(r.basicGetEReferenceType()).toBeNull()

        const c1 = getEcoreFactory().createEClass()
        r.setEType(c1)
        expect(r.basicGetEReferenceType()).toBe(c1)

        const c2 = getEcoreFactory().createEClass()
        r.setEType(c2)
        expect(r.basicGetEReferenceType()).toBe(c2)
    })
})
