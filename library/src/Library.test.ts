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

    test("load.simple.default",async () => {
        let xmlProcessor = new ecore.XMLProcessor([getLibraryPackage()]);
        let fileURI = new URL("file:///" + __dirname + "/../testdata/library.simple.default.xml");
        let resource = await xmlProcessor.load(fileURI);
        expect(resource).not.toBeNull();
        expect(resource.isLoaded).toBeTruthy();
        expect(resource.getErrors().isEmpty()).toBeTruthy();
        expect(resource.getWarnings().isEmpty()).toBeTruthy();
    });

    test("save.simple.default",() => {
        let xmlProcessor = new ecore.XMLProcessor([getLibraryPackage()]);
        let fileURI = new URL("file:///" + __dirname + "/../testdata/library.simple.default.xml");
        let resource = xmlProcessor.loadSync(fileURI);
        expect(resource).not.toBeNull();

        // save it
        let result = xmlProcessor.saveToString(resource);
        const expected = fs.readFileSync(fileURI)
        .toString()
        .replace(/\r?\n|\r/g, "\n");
        expect(result).toBe(expected);
    });

    test("save.simple.prefix",() => {
        let xmlProcessor = new ecore.XMLProcessor([getLibraryPackage()]);
        let fileURI = new URL("file:///" + __dirname + "/../testdata/library.simple.prefix.xml");
        let resource = xmlProcessor.loadSync(fileURI);
        expect(resource).not.toBeNull();

        // save it
        let result = xmlProcessor.saveToString(resource);
        const expected = fs.readFileSync(fileURI)
        .toString()
        .replace(/\r?\n|\r/g, "\n");
        expect(result).toBe(expected);
    });

    test("save.complex",() => {
        let xmlProcessor = new ecore.XMLProcessor([getLibraryPackage()]);
        let fileURI = new URL("file:///" + __dirname + "/../testdata/library.complex.xml");
        let resource = xmlProcessor.loadSync(fileURI);
        expect(resource).not.toBeNull();

        // save it
        let result = xmlProcessor.saveToString(resource);
        const expected = fs.readFileSync(fileURI)
        .toString()
        .replace(/\r?\n|\r/g, "\n");
        expect(result).toBe(expected);
    });

    // test("save", () => {

    //     ecore.getPackageRegistry().registerPackage(getLibraryPackage());
    //     // create resource
    //     let fileURI = new URL("file:///" + __dirname + "/../testdata/library.xml");
    //     let resourceFactory = ecore.getResourceFactoryRegistry().getFactory(fileURI);
    //     let resource = resourceFactory.createResource(fileURI);
    //     expect(resource).not.toBeNull();
        
    //     // load file content to string
    //     let content = fs.readFileSync(resource.eURI).toString().replace(/\r?\n|\r/g, "\n");          
        
    //     // load resource
    //     resource.loadFromString( content );

    //     // check is load/save are symetric
    //     let result = resource.saveToString();
    //     expect(result).toBe( content );
    // });

});
