// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { NoCodec } from "./NoCodec.js"

describe("NoCoder", () => {
    test("newEncoder", () => {
        const codec = new NoCodec()
        const e = codec.newEncoder(null)
        expect(e).toBeNull()
    })

    test("newDecoder", () => {
        const codec = new NoCodec()
        const d = codec.newDecoder(null)
        expect(d).toBeNull()
    })
})
