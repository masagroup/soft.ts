// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EClassifierExt, EPackageExt } from "./internal.js"

describe("EClassifierExt", () => {
    test("classifierID", () => {
        const c = new EClassifierExt()
        expect(c.getClassifierID()).toEqual(-1)

        const p = new EPackageExt()
        p.getEClassifiers().add(c)
        expect(c.getClassifierID()).toEqual(0)
    })
})
