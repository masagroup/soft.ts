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
        let c = getEcoreFactory().createEClass()
        let a1 = getEcoreFactory().createEAttribute()
        let a2 = getEcoreFactory().createEAttribute()
        let o1 = getEcoreFactory().createEOperation()
        c.eStructuralFeatures.add(a1)
        c.eStructuralFeatures.add(a2)
        c.eOperations.add(o1)
        expect(c.eContents().toArray()).toEqual([a1, a2, o1])
    })
})
