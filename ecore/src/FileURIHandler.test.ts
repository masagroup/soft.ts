// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************
import test from "ava";
import { FileURIHandler } from "./FileURIHandler";

test("canHandle", (t) => {
    let uriHandler = new FileURIHandler();

    t.true(uriHandler.canHandle(new URL("file://test")));
    t.false(uriHandler.canHandle(new URL("http://test")));
});

test("createReadStream", (t) => {
    let uriHandler = new FileURIHandler();
    let s = uriHandler.createReadStream(
        new URL("file:///" + __dirname + "/../testdata/read-stream.txt")
    );
    t.true(s != null);
});

test("createWriteStream", (t) => {
    let uriHandler = new FileURIHandler();
    let s = uriHandler.createWriteStream(
        new URL("file:///" + __dirname + "/../testdata/write-stream.txt")
    );
    t.true(s != null);
});
