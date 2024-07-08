// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { FileURIHandler, URI } from "./internal.js"

describe("FileURIHandler", () => {
    test("canHandle", () => {
        let uriHandler = new FileURIHandler()
        expect(uriHandler.canHandle(new URI("file://test"))).toBeTruthy()
        expect(uriHandler.canHandle(new URI("http://test"))).toBeFalsy()
        expect(uriHandler.canHandle(new URI("testdata/test"))).toBeTruthy()
    })

    test("createReadStream-Absolute", () => {
        let uriHandler = new FileURIHandler()
        let uri = new URI("file:///" + __dirname + "/../testdata/read-stream.txt")
        let s = uriHandler.createReadStream(uri)
        expect(s).not.toBeNull()
    })

    test("createReadStream-Relative", () => {
        let uriHandler = new FileURIHandler()
        let uri = new URI("testdata/read-stream.txt")
        let s = uriHandler.createReadStream(uri)
        expect(s).not.toBeNull()
    })

    test("createWriteStream-Absolute", () => {
        let uriHandler = new FileURIHandler()
        let uri = new URI("file:///" + __dirname + "/../testdata/write-stream.txt")
        let s = uriHandler.createWriteStream(uri)
        expect(s).not.toBeNull()
    })

    test("createWriteStream-Relative", () => {
        let uriHandler = new FileURIHandler()
        let uri = new URI("testdata/write-stream.txt")
        let s = uriHandler.createWriteStream(uri)
        expect(s).not.toBeNull()
    })
})
