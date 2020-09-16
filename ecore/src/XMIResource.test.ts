// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import test from "ava";
import { XMIResource } from "./XMIResource";

test("loadSimple", async (t) => {
    let resource = new XMIResource();
    let url = new URL("file:///" + __dirname + "/../testdata/bookStore.ecore");
    let stream = fs.createReadStream(url);
    await resource.loadFromStream(stream);
    t.true(resource.isLoaded);
    t.true(resource.getErrors().isEmpty());
    t.true(resource.getWarnings().isEmpty());
});
