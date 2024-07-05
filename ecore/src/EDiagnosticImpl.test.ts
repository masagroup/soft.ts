// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EDiagnosticImpl } from "./internal.js"

describe("EDiagnosticImpl", () => {
    test("accessors", () => {
        let d = new EDiagnosticImpl("message", "location", 1, 2)
        expect(d.message).toEqual("message")
        expect(d.location).toEqual("location")
        expect(d.line).toEqual(1)
        expect(d.column).toEqual(2)
    })
})
