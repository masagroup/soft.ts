// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { mock } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { BinaryCodec, EResource } from "./internal.js"

describe("BinaryCodec", () => {
    test("newEncoder", () => {
        const c = new BinaryCodec()
        const resource = mock<EResource>()
        const d = c.newDecoder(resource, null)
        expect(d).not.toBeNull()
    })

    test("newDecoder", () => {
        const c = new BinaryCodec()
        const resource = mock<EResource>()
        const d = c.newEncoder(resource, null)
        expect(d).not.toBeNull()
    })
})
