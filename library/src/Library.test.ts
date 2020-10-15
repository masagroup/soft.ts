// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore"
import { getLibraryPackage } from "./internal";

describe("Library",() => {

    test("load",async () => {
        ecore.getPackageRegistry().registerPackage(getLibraryPackage());
        let fileURI = new URL("file:///" + __dirname + "/../testdata/library.xml");
        let resourceFactory = ecore.getResourceFactoryRegistry().getFactory(fileURI);
        let resource = resourceFactory.createResource(fileURI);
        expect(resource).not.toBeNull();
        await resource.load();
        expect(resource.isLoaded).toBeTruthy();
        expect(resource.getErrors().isEmpty()).toBeTruthy();
        expect(resource.getWarnings().isEmpty()).toBeTruthy();
    });

});
