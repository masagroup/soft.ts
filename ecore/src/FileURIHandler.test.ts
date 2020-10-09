// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
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
