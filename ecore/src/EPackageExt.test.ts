// *****************************************************************************
// Copyright(c) 2026 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EClassExt, EPackageExt, getEcorePackage, isEPackage } from "./internal.js"

describe("EPackageExt", () => {
    test("isEPackage", () => {
        expect(isEPackage(new EPackageExt())).toBeTruthy()
        expect(isEPackage(getEcorePackage())).toBeTruthy()
        expect(isEPackage(new EClassExt())).toBeFalsy()
        expect(isEPackage(null)).toBeFalsy()
        expect(isEPackage(undefined)).toBeFalsy()
        expect(isEPackage("http://package")).toBeFalsy()
    })
})
