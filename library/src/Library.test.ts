// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore"
import * as fs from "fs";
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

    test("save", () => {

        ecore.getPackageRegistry().registerPackage(getLibraryPackage());
        // create resource
        let fileURI = new URL("file:///" + __dirname + "/../testdata/library.xml");
        let resourceFactory = ecore.getResourceFactoryRegistry().getFactory(fileURI);
        let resource = resourceFactory.createResource(fileURI);
        expect(resource).not.toBeNull();
        
        // load file content to string
        let content = fs.readFileSync(resource.eURI).toString().replace(/\r?\n|\r/g, "\n");          
        
        // load resource
        resource.loadFromString( content );

        // check is load/save are symetric
        let result = resource.saveToString();
        expect(result).toBe( content );
    });

});
