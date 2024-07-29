// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import id128 from "id128"
import { afterEach, describe, expect, test } from "vitest"
import { BinaryDecoder } from "./BinaryDecoder.js"
import {
    EAttribute,
    EClass,
    EList,
    EObject,
    EPackage,
    EReference,
    EResource,
    EResourceImpl,
    EResourceSetImpl,
    URI,
    UUIDManager,
    XMIProcessor,
    uriToFilePath
} from "./internal.js"

import fs from "fs"

function loadPackage(filename: string): EPackage {
    const xmiProcessor = new XMIProcessor()
    const uri = new URI("testdata/" + filename)
    const resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded()).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    return resource.eContents().get(0) as EPackage
}

describe("BinaryDecoder", () => {
    describe("complex", () => {
        // package
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const resourceURI = new URI("testdata/library.complex.bin")

        // context
        const eResource = new EResourceImpl()
        eResource.setURI(resourceURI)
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getResources().add(eResource)
        eResourceSet.getPackageRegistry().registerPackage(ePackage)

        // retrieve document root class , library class & library name attribute
        const eDocumentRootClass = ePackage.getEClassifier("DocumentRoot") as EClass
        expect(eDocumentRootClass).not.toBeNull()
        const eDocumentRootLibraryFeature = eDocumentRootClass.getEStructuralFeatureFromName("library") as EReference
        expect(eDocumentRootLibraryFeature).not.toBeNull()
        const eLibraryClass = ePackage.getEClassifier("Library") as EClass
        expect(eLibraryClass).not.toBeNull()
        const eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
        expect(eLibraryNameAttribute).not.toBeNull()

        const decoder = new BinaryDecoder(eResource, null)
        let resource: EResource = null

        afterEach(() => {
            expect(resource).toEqual(eResource)

            // check library name
            const eDocumentRoot = resource.eContents().get(0)
            expect(eDocumentRoot).not.toBeNull()
            const eLibrary = eDocumentRoot.eGet(eDocumentRootLibraryFeature) as EObject
            expect(eLibrary).not.toBeNull()
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")

            // book class and attributes
            const eLibraryBooksRefeference = eLibraryClass.getEStructuralFeatureFromName("books") as EReference
            expect(eLibraryBooksRefeference).not.toBeNull()
            const eBookClass = ePackage.getEClassifier("Book") as EClass
            expect(eBookClass).not.toBeNull()
            const eBookTitleAttribute = eBookClass.getEStructuralFeatureFromName("title") as EAttribute
            expect(eBookTitleAttribute).not.toBeNull()
            const eBookDateAttribute = eBookClass.getEStructuralFeatureFromName("publicationDate") as EAttribute
            expect(eBookDateAttribute).not.toBeNull()
            const eBookCategoryAttribute = eBookClass.getEStructuralFeatureFromName("category") as EAttribute
            expect(eBookCategoryAttribute).not.toBeNull()
            const eBookAuthorReference = eBookClass.getEStructuralFeatureFromName("author") as EAttribute
            expect(eBookAuthorReference).not.toBeNull()

            // retrive book
            const eBooks = eLibrary.eGet(eLibraryBooksRefeference) as EList<EObject>
            expect(eBooks).not.toBeNull()
            const eBook = eBooks.get(0)
            expect(eBook).not.toBeNull()

            // check book name
            expect(eBook.eGet(eBookTitleAttribute)).toBe("Title 0")

            // check book date
            const date = eBook.eGet(eBookDateAttribute) as Date
            expect(date).not.toBeNull()
            expect(date).toEqual(new Date("2015-09-06 04:24:46 +0000 UTC"))

            // check book category
            const category = eBook.eGet(eBookCategoryAttribute)
            expect(category).toBe(2)

            // check author
            const author = eBook.eGet(eBookAuthorReference) as EObject
            expect(author).not.toBeNull()

            const eWriterClass = ePackage.getEClassifier("Writer") as EClass
            expect(eWriterClass).not.toBeNull()
            const eWriterNameAttribute = eWriterClass.getEStructuralFeatureFromName("firstName") as EAttribute
            expect(eWriterNameAttribute).not.toBeNull()
            expect(author.eGet(eWriterNameAttribute)).toBe("First Name 0")
        })

        test("decode", () => {
            const path = uriToFilePath(resourceURI)
            const s = fs.readFileSync(path)
            const result = decoder.decode(s)
            expect(result.isOk()).toBeTruthy()
            resource = result.unwrap()
        })

        test("decodeAsync", async () => {
            const path = uriToFilePath(resourceURI)
            const stream = fs.createReadStream(path)
            resource = await decoder.decodeAsync(stream)
        })
    })

    describe("complex.id", () => {
        const resourceURI = new URI("testdata/library.complex.id.bin")
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()

        // retrieve document root class , library class & library name attribute
        const eDocumentRootClass = ePackage.getEClassifier("DocumentRoot") as EClass
        expect(eDocumentRootClass).not.toBeNull()
        const eDocumentRootLibraryFeature = eDocumentRootClass.getEStructuralFeatureFromName("library") as EReference
        expect(eDocumentRootLibraryFeature).not.toBeNull()

        const eResource = new EResourceImpl()
        const idManager = new UUIDManager()
        eResource.setObjectIDManager(idManager)
        eResource.setURI(resourceURI)

        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getResources().add(eResource)
        eResourceSet.getPackageRegistry().registerPackage(ePackage)

        const decoder = new BinaryDecoder(eResource, null)
        let resource: EResource = null

        afterEach(() => {
            expect(resource).toEqual(eResource)
            // check ids for document root and library
            const eDocumentRoot = resource.eContents().get(0)
            expect(eDocumentRoot).not.toBeNull()

            const eLibrary = eDocumentRoot.eGet(eDocumentRootLibraryFeature) as EObject
            expect(eLibrary).not.toBeNull()
            const expectedUUID = id128.Uuid4.fromCanonical("75aa92db-b419-4259-93c4-0e542d33aa35")
            const receivedUUID = idManager.getID(eLibrary)
            expect(expectedUUID.equal(receivedUUID)).toBeTruthy()
        })

        test("decode", () => {
            const path = uriToFilePath(resourceURI)
            const s = fs.readFileSync(path)
            const result = decoder.decode(s)
            expect(result.isOk()).toBeTruthy()
            resource = result.unwrap()
        })

        test("decodeAsync", async () => {
            const path = uriToFilePath(resourceURI)
            const stream = fs.createReadStream(path)
            resource = await decoder.decodeAsync(stream)
        })
    })
})
