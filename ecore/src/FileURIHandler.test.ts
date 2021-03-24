// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { FileURIHandler } from "./internal";

describe("FileURIHandler", () => {
    test("canHandle", () => {
        let uriHandler = new FileURIHandler();

        expect(uriHandler.canHandle(new URL("file://test"))).toBeTruthy();
        expect(uriHandler.canHandle(new URL("http://test"))).toBeFalsy();
    });

    test("createReadStream", () => {
        let uriHandler = new FileURIHandler();
        let s = uriHandler.createReadStream(
            new URL("file:///" + __dirname + "/../testdata/read-stream.txt")
        );
        expect(s).not.toBeNull();
    });

    test("createWriteStream", () => {
        let uriHandler = new FileURIHandler();
        let s = uriHandler.createWriteStream(
            new URL("file:///" + __dirname + "/../testdata/write-stream.txt")
        );
        expect(s).not.toBeNull();
    });
});
