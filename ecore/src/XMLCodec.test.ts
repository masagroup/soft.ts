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
import { afterEach, describe, expect, test } from "vitest"
import {
    EAttribute,
    EClass,
    EFactoryExt,
    EList,
    EObject,
    EPackage,
    EResource,
    EResourceSetImpl,
    ExtendedMetaData,
    URI,
    UUIDManager,
    XMIProcessor,
    XMLDecoder,
    XMLEncoder,
    XMLOptions,
    XMLProcessor,
    uriToFilePath
} from "./internal.js"

function loadPackage(filename: string): EPackage {
    let xmiProcessor = new XMIProcessor()
    let uri = new URI("testdata/" + filename)
    let resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    let ePackage = resource.eContents().get(0) as EPackage
    ePackage.setEFactoryInstance(new EFactoryExt())
    return ePackage
}

class Test {
    l: EList<string>
}

describe("XMLResource", () => {
    describe("load.library.noroot", () => {
        let ePackage = loadPackage("library.noroot.ecore")
        expect(ePackage).not.toBeNull()
        let xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        let resourceURI = new URI("testdata/library.noroot.xml")
        let resource: EResource = null

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            let eLibraryClass = ePackage.getEClassifier("Library") as EClass
            expect(eLibraryClass).not.toBeNull()
            let eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
            expect(eLibraryNameAttribute).not.toBeNull()

            // check library name
            let eLibrary = resource.eContents().get(0)
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")
        })

        test("load", async () => {
            resource = await xmlProcessor.load(resourceURI)
        })

        test("loadFromStream", async () => {
            let path = uriToFilePath(resourceURI)
            let stream = fs.createReadStream(path)
            resource = await xmlProcessor.loadFromStream(stream)
        })

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI)
        })
    })

    describe("save.library.noroot", () => {
        let ePackage = loadPackage("library.noroot.ecore")
        expect(ePackage).not.toBeNull()
        let xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        let originURI = new URI("testdata/library.noroot.xml")
        let resultURI = new URI("testdata/library.noroot.result.xml")
        let resource = xmlProcessor.loadSync(originURI)
        resource.eURI = resultURI

        test("saveToString", () => {
            const expected = fs
                .readFileSync(uriToFilePath(originURI))
                .toString()
                .replace(/\r?\n|\r/g, "\n")
            const result = xmlProcessor.saveToString(resource)
            expect(result).toBe(expected)
        })

        test("saveWithOptions", () => {
            const expected = fs
                .readFileSync(uriToFilePath(originURI))
                .toString()
                .replace(/\r?\n|\r/g, "\n")
            const result = xmlProcessor.saveToString(
                resource,
                new Map<string, any>([[XMLOptions.EXTENDED_META_DATA, new ExtendedMetaData()]])
            )
            expect(result).toBe(expected)
        })
    })

    describe("load.library.complex", () => {
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        let eDocumentRootClass = ePackage.getEClassifier("DocumentRoot") as EClass
        expect(eDocumentRootClass).not.toBeNull()
        let eLibraryAttribure = eDocumentRootClass.getEStructuralFeatureFromName("library")
        expect(eLibraryAttribure).not.toBeNull()
        let eLibraryClass = ePackage.getEClassifier("Library") as EClass
        expect(eLibraryClass).not.toBeNull()
        let eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
        expect(eLibraryNameAttribute).not.toBeNull()
        let eLibraryBooksReference = eLibraryClass.getEStructuralFeatureFromName("books") as EAttribute
        expect(eLibraryBooksReference).not.toBeNull()
        let eBookClass = ePackage.getEClassifier("Book") as EClass
        expect(eBookClass).not.toBeNull()
        let eBookTitleAttribute = eBookClass.getEStructuralFeatureFromName("title") as EAttribute
        expect(eBookTitleAttribute).not.toBeNull()
        let eBookDateAttribute = eBookClass.getEStructuralFeatureFromName("publicationDate") as EAttribute
        expect(eBookDateAttribute).not.toBeNull()
        let eBookCopiesAttribute = eBookClass.getEStructuralFeatureFromName("copies") as EAttribute
        expect(eBookCopiesAttribute).not.toBeNull()

        let xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        let resourceURI = new URI("testdata/library.complex.xml")
        let resource: EResource = null

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            let eDocumentRoot = resource.eContents().get(0)

            // check library name
            let eLibrary = eDocumentRoot.eGet(eLibraryAttribure) as EClass
            expect(eLibrary).not.toBeNull()
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")

            // books
            let books = eLibrary.eGet(eLibraryBooksReference) as EList<any>
            expect(books).not.toBeNull()
            expect(books.size()).toBe(2)

            // book
            let book = books.get(0)
            expect(book.eGet(eBookTitleAttribute)).toBe("Title 0")
            expect(book.eGet(eBookCopiesAttribute)).toBe(4)
            expect(book.eGet(eBookDateAttribute)).toStrictEqual(new Date(Date.UTC(2015, 8, 6, 4, 24, 46, 0)))
        })

        test("load", async () => {
            resource = await xmlProcessor.load(resourceURI)
        })

        test("loadFromStream", async () => {
            let stream = fs.createReadStream(uriToFilePath(resourceURI))
            resource = await xmlProcessor.loadFromStream(stream)
        })

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI)
        })
    })

    describe("load.library.complex.ids", () => {
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()

        let idManager = new UUIDManager()
        let resourceSet = new EResourceSetImpl()
        resourceSet.getPackageRegistry().registerPackage(ePackage)
        let resourceURI = new URI("testdata/library.complex.id.xml")
        let resource = resourceSet.createResource(resourceURI)
        resource.eObjectIDManager = idManager
        let options = new Map<string, any>([
            [XMLOptions.SUPPRESS_DOCUMENT_ROOT, true],
            [XMLOptions.ID_ATTRIBUTE_NAME, "id"]
        ])

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            let eLibrary = resource.eContents().get(0)
            let expectedUUID = id128.Uuid4.fromCanonical("75aa92db-b419-4259-93c4-0e542d33aa35")
            let receivedUUID = idManager.getID(eLibrary)
            expect(expectedUUID.equal(receivedUUID)).toBeTruthy()
        })

        test("load", async () => {
            await resource.load(options)
        })

        test("loadFromStream", async () => {
            let stream = fs.createReadStream(uriToFilePath(resourceURI))
            await resource.loadFromStream(stream, options)
        })

        test("loadSync", () => {
            resource.loadSync(options)
        })
    })

    describe("load.library.complex.options", () => {
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        let xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        let resourceURI = new URI("testdata/library.complex.noroot.xml")
        let resource: EResource = null
        let options = new Map<string, any>([
            [XMLOptions.EXTENDED_META_DATA, new ExtendedMetaData()],
            [XMLOptions.SUPPRESS_DOCUMENT_ROOT, true]
        ])

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            let eLibraryClass = ePackage.getEClassifier("Library") as EClass
            expect(eLibraryClass).not.toBeNull()
            let eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
            expect(eLibraryNameAttribute).not.toBeNull()

            // check library name
            let eLibrary = resource.eContents().get(0)
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")
        })

        test("load", async () => {
            resource = await xmlProcessor.load(resourceURI, options)
        })

        test("loadFromStream", async () => {
            let stream = fs.createReadStream(uriToFilePath(resourceURI))
            resource = await xmlProcessor.loadFromStream(stream, options)
        })

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI, options)
        })
    })

    describe("load.object", () => {
        let ePackage = loadPackage("library.simple.ecore")
        expect(ePackage).not.toBeNull()
        let eBookClass = ePackage.getEClassifier("Book") as EClass
        expect(eBookClass).not.toBeNull()
        let eBookNameAttribute = eBookClass.getEStructuralFeatureFromName("name") as EAttribute
        expect(eBookNameAttribute).not.toBeNull()

        let eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        let eResource = eResourceSet.createResource(new URI("file://$tmp.xml"))
        let eObject: EObject = null

        let eObjectURI = new URI("testdata/book.simple.xml")
        let decoder = new XMLDecoder(eResource, null)

        test("decodeObject", () => {
            let path = uriToFilePath(eObjectURI)
            let buffer = fs.readFileSync(path)
            let result = decoder.decodeObject(buffer)
            if (result.isOk()) eObject = result.value
        })

        test("decodeObjectAsync", async () => {
            let path = uriToFilePath(eObjectURI)
            let stream = fs.createReadStream(path)
            eObject = await decoder.decodeObjectAsync(stream)
        })

        afterEach(() => {
            expect(eObject).not.toBeNull()
            expect(eObject.eGet(eBookNameAttribute)).toBe("Book 1")
        })
    })

    describe("save.library.complex", () => {
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        let xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        let originURI = new URI("testdata/library.complex.xml")
        let resource = xmlProcessor.loadSync(originURI)

        test("saveToString", () => {
            const expected = fs
                .readFileSync(uriToFilePath(originURI))
                .toString()
                .replace(/\r?\n|\r/g, "\n")
            const result = xmlProcessor.saveToString(resource)
            expect(result).toBe(expected)
        })
    })

    describe("save.library.complex.sub", () => {
        test("saveToString", () => {
            let ePackage = loadPackage("library.complex.ecore")
            expect(ePackage).not.toBeNull()
            let xmlProcessor = new XMLProcessor([ePackage])
            expect(xmlProcessor).not.toBeNull()
            let originURI = new URI("testdata/library.complex.xml")
            let eResource = xmlProcessor.loadSync(originURI)

            let eObject = eResource.getEObject("//@library/@employees.0")
            expect(eObject).not.toBeNull()
            let eContainer = eObject.eContainer()
            expect(eContainer).not.toBeNull()

            // create a new resource
            let subURI = new URI("testdata/library.complex.sub.xml")
            let eNewResource = eResource.eResourceSet().createResource(subURI)
            // add object to new resource
            eNewResource.eContents().add(eObject)
            // save it
            let result = xmlProcessor.saveToString(eNewResource)
            const expected = fs
                .readFileSync(uriToFilePath(subURI))
                .toString()
                .replace(/\r?\n|\r/g, "\n")
            expect(result).toBe(expected)
        })
    })

    describe("save.object", () => {
        let ePackage = loadPackage("library.simple.ecore")
        expect(ePackage).not.toBeNull()
        let eBookClass = ePackage.getEClassifier("Book") as EClass
        expect(eBookClass).not.toBeNull()
        let resourceURI = new URI("testdata/library.simple.xml")
        let xmlProcessor = new XMLProcessor([ePackage])
        let eResource = xmlProcessor.loadSync(resourceURI)
        expect(eResource.getErrors().isEmpty()).toBeTruthy()

        // retrieve second book
        let libraryClass = ePackage.getEClassifier("Library") as EClass
        expect(libraryClass).not.toBeNull()
        let libraryBooksFeature = libraryClass.getEStructuralFeatureFromName("books")
        expect(libraryBooksFeature).not.toBeNull()

        expect(eResource.eContents().size()).toBe(1)
        let eLibrary = eResource.eContents().get(0)
        expect(eLibrary).not.toBeNull()

        let eBooks = eLibrary.eGet(libraryBooksFeature) as EList<EObject>
        expect(eBooks).not.toBeNull()
        expect(eBooks.size()).toBe(4)
        let eBook = eBooks.get(1)

        let xmlEncoder = new XMLEncoder(eResource, null)
        let expected = fs
            .readFileSync("testdata/book.simple.xml")
            .toString()
            .replace(/\r?\n|\r/g, "\n")

        test("encodeObject", () => {
            let result = xmlEncoder.encodeObject(eBook)
            if (result.isOk()) {
                expect(new TextDecoder().decode(Buffer.from(result.value))).toBe(expected)
            }
        })
    })
})
