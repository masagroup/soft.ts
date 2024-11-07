// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { getURIConverterRegistry, URI } from "./internal.js"

describe("FileURIHandler", () => {
    const uriHandler = getURIConverterRegistry().getURIHandler(new URI({ scheme: "file" }))
    expect(uriHandler).toBeDefined()

    test("canHandle", () => {
        expect(uriHandler.canHandle(new URI("file://test"))).toBeTruthy()
        expect(uriHandler.canHandle(new URI("http://test"))).toBeFalsy()
        expect(uriHandler.canHandle(new URI("testdata/test"))).toBeTruthy()
    })

    test("createReadStream-Absolute", () => {
        const uri = new URI("file:///" + __dirname + "/../testdata/read-stream.txt")
        const s = uriHandler.createReadStream(uri)
        expect(s).not.toBeNull()
    })

    test("createReadStream-Relative", () => {
        const uri = new URI("testdata/read-stream.txt")
        const s = uriHandler.createReadStream(uri)
        expect(s).not.toBeNull()
    })

    test("createWriteStream-Absolute", () => {
        const uri = new URI("file:///" + __dirname + "/../testdata/write-stream.txt")
        const s = uriHandler.createWriteStream(uri)
        expect(s).not.toBeNull()
    })

    test("createWriteStream-Relative", () => {
        const uri = new URI("testdata/write-stream.txt")
        const s = uriHandler.createWriteStream(uri)
        expect(s).not.toBeNull()
    })
})
