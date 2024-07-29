// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { getEcoreFactory } from "./index.js"

describe("EObject", () => {
    test("eContents", () => {
        const c = getEcoreFactory().createEClass()
        const a1 = getEcoreFactory().createEAttribute()
        const a2 = getEcoreFactory().createEAttribute()
        const o1 = getEcoreFactory().createEOperation()
        c.getEStructuralFeatures().add(a1)
        c.getEStructuralFeatures().add(a2)
        c.getEOperations().add(o1)
        expect(c.eContents().toArray()).toEqual([a1, a2, o1])
    })
})
