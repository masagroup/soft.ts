// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import { XMIResource } from "./XMIResource";

describe("XMIResource", () => {
    test("loadStream", async () => {
        let resource = new XMIResource();
        let url = new URL("file:///" + __dirname + "/../testdata/bookStore.ecore");
        let stream = fs.createReadStream(url);
        await resource.loadFromStream(stream);
        expect(resource.isLoaded).toBeTruthy();
        expect(resource.getErrors().isEmpty()).toBeTruthy();
        expect(resource.getWarnings().isEmpty()).toBeTruthy();
    });

    test("load", async () => {
        let resource = new XMIResource();
        resource.eURI = new URL("file:///" + __dirname + "/../testdata/bookStore.ecore");
        await resource.load();
        expect(resource.isLoaded).toBeTruthy();
        expect(resource.getErrors().isEmpty()).toBeTruthy();
        expect(resource.getWarnings().isEmpty()).toBeTruthy();
    });
});
