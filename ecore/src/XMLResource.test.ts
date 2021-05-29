// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs";
import {
    EAttribute,
    EClass,
    EFactoryExt,
    EPackage,
    EResource,
    XMIProcessor,
    XMLNamespaces,
    XMLProcessor,
} from "./internal";

describe("XMLNamespaces", () => {
    test("constructor", () => {
        let n = new XMLNamespaces();
        expect(n.getPrefix("uri")).toBeNull();
        expect(n.getURI("prefix")).toBeNull();
    });

    test("empty", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.getPrefix("uri")).toBeNull();
        expect(n.getURI("prefix")).toBeNull();
        let c = n.popContext();
        expect(c.length).toBe(0);
    });

    test("context ", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        n.pushContext();
        expect(n.declarePrefix("prefix", "uri2")).toBeFalsy();
        expect(n.getPrefix("uri2")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri2");

        n.popContext();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        n.popContext();
        expect(n.getPrefix("uri")).toBeNull();
        expect(n.getURI("prefix")).toBeNull();
    });

    test("contextRemap", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        expect(n.declarePrefix("prefix", "uri2")).toBeTruthy();
        expect(n.getPrefix("uri2")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri2");
    });

    test("contextNoRemap ", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        n.pushContext();
        expect(n.declarePrefix("prefix", "uri2")).toBeFalsy();
        expect(n.getPrefix("uri2")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri2");
    });
});

function loadPackage(filename: string): EPackage {
    let xmiProcessor = new XMIProcessor();
    let uri = new URL("file:///" + __dirname + "/../testdata/" + filename);
    let resource = xmiProcessor.loadSync(uri);
    expect(resource.isLoaded).toBeTruthy();
    expect(resource.getErrors().isEmpty()).toBeTruthy();
    expect(resource.eContents().isEmpty()).toBeFalsy();
    let ePackage = resource.eContents().get(0) as EPackage;
    ePackage.eFactoryInstance = new EFactoryExt();
    return ePackage;
}

describe("XMLResource", () => {
    describe("load.library.noroot", () => {
        let ePackage = loadPackage("library.noroot.ecore");
        expect(ePackage).not.toBeNull();
        let xmlProcessor = new XMLProcessor([ePackage]);
        expect(xmlProcessor).not.toBeNull();
        let resourceURI = new URL("file:///" + __dirname + "/../testdata/library.noroot.xml");
        let resource: EResource = null;

        afterEach(() => {
            expect(resource).not.toBeNull();
            expect(resource.isLoaded).toBeTruthy();
            expect(resource.getErrors().isEmpty()).toBeTruthy();
            expect(resource.getWarnings().isEmpty()).toBeTruthy();

            let eLibraryClass = ePackage.getEClassifier("Library") as EClass;
            expect(eLibraryClass).not.toBeNull();
            let eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName(
                "name"
            ) as EAttribute;
            expect(eLibraryNameAttribute).not.toBeNull();

            // check library name
            let eLibrary = resource.eContents().get(0);
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library");
        });

        test("load", async () => {
            resource = await xmlProcessor.load(resourceURI);
        });

        test("loadFromStream", async () => {
            let stream = fs.createReadStream(resourceURI);
            resource = await xmlProcessor.loadFromStream(stream);
        });

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI);
        });
    });
});
