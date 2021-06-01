// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs";
import { ExtendedMetaData } from "./ExtendedMetaData";
import {
    EAttribute,
    EClass,
    EFactoryExt,
    EList,
    EPackage,
    EResource,
    XMIProcessor,
    XMLNamespaces,
    XMLProcessor,
} from "./internal";
import { OPTION_EXTENDED_META_DATA, OPTION_SUPPRESS_DOCUMENT_ROOT } from "./XMLResource";

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


class Test {
    l : EList<string>;
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

    describe("save.library.noroot", () => {
        let ePackage = loadPackage("library.noroot.ecore");
        expect(ePackage).not.toBeNull();
        let xmlProcessor = new XMLProcessor([ePackage]);
        expect(xmlProcessor).not.toBeNull();
        let originURI = new URL("file:///" + __dirname + "/../testdata/library.noroot.xml");
        let resultURI = new URL("file:///" + __dirname + "/../testdata/library.noroot.result.xml");
        let resource = xmlProcessor.loadSync(originURI);
        resource.eURI = resultURI;

        test('saveToString', () => {
            const expected = fs.readFileSync(originURI)
            .toString()
            .replace(/\r?\n|\r/g, "\n");
            const result = xmlProcessor.saveToString(resource);
            expect(result).toBe(expected);
        });

        test('saveWithOptions', () => {
            const expected = fs.readFileSync(originURI)
            .toString()
            .replace(/\r?\n|\r/g, "\n");
            const result = xmlProcessor.saveToString(resource, new Map<string,any>([[OPTION_EXTENDED_META_DATA, new ExtendedMetaData()]]));
            expect(result).toBe(expected);
        });
    });

    describe('load.library.complex', () => {
        let ePackage = loadPackage("library.complex.ecore");
        expect(ePackage).not.toBeNull();
        let xmlProcessor = new XMLProcessor([ePackage]);
        expect(xmlProcessor).not.toBeNull();
        let resourceURI = new URL("file:///" + __dirname + "/../testdata/library.complex.xml");
        let resource: EResource = null;

        afterEach(() => {
            expect(resource).not.toBeNull();
            expect(resource.isLoaded).toBeTruthy();
            expect(resource.getErrors().isEmpty()).toBeTruthy();
            expect(resource.getWarnings().isEmpty()).toBeTruthy();
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

    describe('load.library.complex.options', () => {
        let ePackage = loadPackage("library.complex.ecore");
        expect(ePackage).not.toBeNull();
        let xmlProcessor = new XMLProcessor([ePackage]);
        expect(xmlProcessor).not.toBeNull();
        let resourceURI = new URL("file:///" + __dirname + "/../testdata/library.complex.noroot.xml");
        let resource: EResource = null;
        let options = new Map<string,any>([[OPTION_EXTENDED_META_DATA,new ExtendedMetaData()],[OPTION_SUPPRESS_DOCUMENT_ROOT, true]])

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
            resource = await xmlProcessor.load(resourceURI,options);
        });

        test("loadFromStream", async () => {
            let stream = fs.createReadStream(resourceURI);
            resource = await xmlProcessor.loadFromStream(stream,options);
        });

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI,options);
        });
    });

    describe('save.library.complex', () => {
        let ePackage = loadPackage("library.complex.ecore");
        expect(ePackage).not.toBeNull();
        let xmlProcessor = new XMLProcessor([ePackage]);
        expect(xmlProcessor).not.toBeNull();
        let originURI = new URL("file:///" + __dirname + "/../testdata/library.complex.xml");
        let resource = xmlProcessor.loadSync(originURI);
        
        test('saveToString', () => {
            const expected = fs.readFileSync(originURI)
            .toString()
            .replace(/\r?\n|\r/g, "\n");
            const result = xmlProcessor.saveToString(resource);
            expect(result).toBe(expected);
        });
    });

    describe('save.library.complex.sub', () => {
        test('saveToString', () => {

            let ePackage = loadPackage("library.complex.ecore");
            expect(ePackage).not.toBeNull();
            let xmlProcessor = new XMLProcessor([ePackage]);
            expect(xmlProcessor).not.toBeNull();
            let originURI = new URL("file:///" + __dirname + "/../testdata/library.complex.xml");
            let eResource = xmlProcessor.loadSync(originURI);

            let eObject = eResource.getEObject("//@library/@employees.0");
            expect(eObject).not.toBeNull();
            let eContainer = eObject.eContainer();
            expect(eContainer).not.toBeNull();

            // create a new resource
            let subURI = new URL("file:///" + __dirname + "/../testdata/library.complex.sub.xml");
            let eNewResource = eResource.eResourceSet().createResource(subURI);
            // add object to new resource
            eNewResource.eContents().add(eObject);
            // save it
            let result = xmlProcessor.saveToString(eNewResource);
            const expected = fs.readFileSync(subURI)
            .toString()
            .replace(/\r?\n|\r/g, "\n");
            expect(result).toBe(expected);
        });
    });
});
