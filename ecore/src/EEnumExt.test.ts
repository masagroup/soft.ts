// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EEnumExt, isEEnum } from "./internal.js"

describe("EEnumExt", () => {
    test("isEEnum", () => {
        const eEnum = new EEnumExt()
        expect(isEEnum(eEnum)).toBe(true)

        const primitives = [42, "string", true, false, null, undefined, Symbol("sym"), 100n]
        for (const p of primitives) {
            expect(isEEnum(p as any)).toBe(false)
        }
    })
})
