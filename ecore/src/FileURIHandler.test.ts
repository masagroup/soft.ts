// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { FileURIHandler, URI } from "./internal";
import * as url from "url";

describe("FileURIHandler", () => {
    test("canHandle", () => {
        let uriHandler = new FileURIHandler();
        expect(uriHandler.canHandle(new URI("file://test"))).toBeTruthy();
        expect(uriHandler.canHandle(new URI("http://test"))).toBeFalsy();
    });

    test("createReadStream", () => {
        let resourceURI = url.pathToFileURL("testdata/library.complex.xml");
        let t = resourceURI.toString();

        let uriHandler = new FileURIHandler();
        let uri = new URI("file:///" + __dirname + "/../testdata/read-stream.txt");
        let s = uriHandler.createReadStream(uri);
        expect(s).not.toBeNull();
    });

    test("createWriteStream", () => {
        let uriHandler = new FileURIHandler();
        let uri = new URI("file:///" + __dirname + "/../testdata/write-stream.txt");
        let s = uriHandler.createWriteStream(uri);
        expect(s).not.toBeNull();
    });
});
