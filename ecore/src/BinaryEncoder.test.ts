// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import id128 from "id128"
import { describe, expect, test } from "vitest"
import { BinaryEncoder } from "./BinaryEncoder.js"
import {
    BinaryOptions,
    EPackage,
    EResourceImpl,
    EResourceSetImpl,
    URI,
    uriToFilePath,
    UUIDManager,
    XMIProcessor,
    XMLOptions,
    XMLProcessor
} from "./internal.js"

function loadPackage(filename: string): EPackage {
    const xmiProcessor = new XMIProcessor()
    const uri = new URI("testdata/" + filename)
    const resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded()).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    return resource.eContents().get(0) as EPackage
}

describe("BinaryEncoder", () => {
    test("complex", () => {
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const resourceURI = new URI("testdata/library.complex.xml")
        const expectedURI = new URI("testdata/library.complex.bin")
        const xmlProcessor = new XMLProcessor([ePackage])
        const eResource = xmlProcessor.loadSync(resourceURI)
        expect(eResource.isLoaded()).toBeTruthy()
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(eResource.eContents().isEmpty()).toBeFalsy()
        const e = new BinaryEncoder(eResource)
        const r = e.encode(eResource)
        expect(r.isOk()).toBeTruthy()
        const expected = fs.readFileSync(uriToFilePath(expectedURI)).toString()
        const result = Buffer.from(r.unwrap()).toString()
        expect(result).toBe(expected)
    })

    test("complexWithID", () => {
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const resourceURI = new URI("testdata/library.complex.id.xml")
        const expectedURI = new URI("testdata/library.complex.id.bin")

        const eResource = new EResourceImpl()
        const idManager = new UUIDManager()
        eResource.setObjectIDManager(idManager)
        eResource.setURI(resourceURI)

        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getResources().add(eResource)
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        eResource.loadSync(new Map<string, any>([[XMLOptions.ID_ATTRIBUTE_NAME, "id"]]))
        expect(eResource.isLoaded()).toBeTruthy()
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(eResource.eContents().isEmpty()).toBeFalsy()

        const eDocumentRoot = eResource.eContents().get(0)
        expect(eDocumentRoot).not.toBeNull()
        expect(idManager.setID(eDocumentRoot, id128.Uuid4.fromCanonical("dc48710b-0e2e-419f-94fb-178c7fc1370b"))).toBeUndefined()

        const e = new BinaryEncoder(eResource, new Map<string, any>([[BinaryOptions.BINARY_OPTION_ID_ATTRIBUTE, true]]))
        const r = e.encode(eResource)
        expect(r.isOk()).toBeTruthy()
        const expected = fs.readFileSync(uriToFilePath(expectedURI)).toString()
        const result = Buffer.from(r.unwrap()).toString()
        expect(result).toBe(expected)
    })
})
