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
    EReference,
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
    const xmiProcessor = new XMIProcessor()
    const uri = new URI("testdata/" + filename)
    const resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded()).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    const ePackage = resource.eContents().get(0) as EPackage
    ePackage.setEFactoryInstance(new EFactoryExt())
    return ePackage
}

describe("XMLResource", () => {
    describe("load.library.noroot", () => {
        const ePackage = loadPackage("library.noroot.ecore")
        expect(ePackage).not.toBeNull()
        const xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        const resourceURI = new URI("testdata/library.noroot.xml")
        let resource: EResource = null

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            const eLibraryClass = ePackage.getEClassifier("Library") as EClass
            expect(eLibraryClass).not.toBeNull()
            const eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
            expect(eLibraryNameAttribute).not.toBeNull()

            // check library name
            const eLibrary = resource.eContents().get(0)
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")
        })

        test("load", async () => {
            resource = await xmlProcessor.load(resourceURI)
        })

        test("loadFromStream", async () => {
            const path = uriToFilePath(resourceURI)
            const stream = fs.createReadStream(path)
            resource = await xmlProcessor.loadFromStream(stream)
        })

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI)
        })
    })

    describe("save.library.noroot", () => {
        const ePackage = loadPackage("library.noroot.ecore")
        expect(ePackage).not.toBeNull()
        const xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        const originURI = new URI("testdata/library.noroot.xml")
        const resultURI = new URI("testdata/library.noroot.result.xml")
        const resource = xmlProcessor.loadSync(originURI)
        resource.setURI(resultURI)

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
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const eDocumentRootClass = ePackage.getEClassifier("DocumentRoot") as EClass
        expect(eDocumentRootClass).not.toBeNull()
        const eLibraryAttribure = eDocumentRootClass.getEStructuralFeatureFromName("library")
        expect(eLibraryAttribure).not.toBeNull()
        const eLibraryClass = ePackage.getEClassifier("Library") as EClass
        expect(eLibraryClass).not.toBeNull()
        const eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
        expect(eLibraryNameAttribute).not.toBeNull()
        const eLibraryBooksReference = eLibraryClass.getEStructuralFeatureFromName("books") as EAttribute
        expect(eLibraryBooksReference).not.toBeNull()
        const eBookClass = ePackage.getEClassifier("Book") as EClass
        expect(eBookClass).not.toBeNull()
        const eBookTitleAttribute = eBookClass.getEStructuralFeatureFromName("title") as EAttribute
        expect(eBookTitleAttribute).not.toBeNull()
        const eBookDateAttribute = eBookClass.getEStructuralFeatureFromName("publicationDate") as EAttribute
        expect(eBookDateAttribute).not.toBeNull()
        const eBookCopiesAttribute = eBookClass.getEStructuralFeatureFromName("copies") as EAttribute
        expect(eBookCopiesAttribute).not.toBeNull()

        const xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        const resourceURI = new URI("testdata/library.complex.xml")
        let resource: EResource = null

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            const eDocumentRoot = resource.eContents().get(0)

            // check library name
            const eLibrary = eDocumentRoot.eGet(eLibraryAttribure) as EClass
            expect(eLibrary).not.toBeNull()
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")

            // books
            const books = eLibrary.eGet(eLibraryBooksReference) as EList<any>
            expect(books).not.toBeNull()
            expect(books.size()).toBe(2)

            // book
            const book = books.get(0)
            expect(book.eGet(eBookTitleAttribute)).toBe("Title 0")
            expect(book.eGet(eBookCopiesAttribute)).toBe(4)
            expect(book.eGet(eBookDateAttribute)).toStrictEqual(new Date(Date.UTC(2015, 8, 6, 4, 24, 46, 0)))
        })

        test("load", async () => {
            resource = await xmlProcessor.load(resourceURI)
        })

        test("loadFromStream", async () => {
            const stream = fs.createReadStream(uriToFilePath(resourceURI))
            resource = await xmlProcessor.loadFromStream(stream)
        })

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI)
        })
    })

    describe("load.library.complex.ids", () => {
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()

        const idManager = new UUIDManager()
        const resourceSet = new EResourceSetImpl()
        resourceSet.getPackageRegistry().registerPackage(ePackage)
        const resourceURI = new URI("testdata/library.complex.id.xml")
        const resource = resourceSet.createResource(resourceURI)
        resource.setObjectIDManager(idManager)
        const options = new Map<string, any>([
            [XMLOptions.SUPPRESS_DOCUMENT_ROOT, true],
            [XMLOptions.ID_ATTRIBUTE_NAME, "id"]
        ])

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            const eLibrary = resource.eContents().get(0)
            const expectedUUID = id128.Uuid4.fromCanonical("75aa92db-b419-4259-93c4-0e542d33aa35")
            const receivedUUID = idManager.getID(eLibrary)
            expect(expectedUUID.equal(receivedUUID)).toBeTruthy()
        })

        test("load", async () => {
            await resource.load(options)
        })

        test("loadFromStream", async () => {
            const stream = fs.createReadStream(uriToFilePath(resourceURI))
            await resource.loadFromStream(stream, options)
        })

        test("loadSync", () => {
            resource.loadSync(options)
        })
    })

    describe("load.library.complex.options", () => {
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        const resourceURI = new URI("testdata/library.complex.noroot.xml")
        let resource: EResource = null
        const options = new Map<string, any>([
            [XMLOptions.EXTENDED_META_DATA, new ExtendedMetaData()],
            [XMLOptions.SUPPRESS_DOCUMENT_ROOT, true]
        ])

        afterEach(() => {
            expect(resource).not.toBeNull()
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            const eLibraryClass = ePackage.getEClassifier("Library") as EClass
            expect(eLibraryClass).not.toBeNull()
            const eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
            expect(eLibraryNameAttribute).not.toBeNull()

            // check library name
            const eLibrary = resource.eContents().get(0)
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")
        })

        test("load", async () => {
            resource = await xmlProcessor.load(resourceURI, options)
        })

        test("loadFromStream", async () => {
            const stream = fs.createReadStream(uriToFilePath(resourceURI))
            resource = await xmlProcessor.loadFromStream(stream, options)
        })

        test("loadSync", () => {
            resource = xmlProcessor.loadSync(resourceURI, options)
        })
    })

    describe("load.object", () => {
        const ePackage = loadPackage("library.simple.ecore")
        expect(ePackage).not.toBeNull()
        const eBookClass = ePackage.getEClassifier("Book") as EClass
        expect(eBookClass).not.toBeNull()
        const eBookNameAttribute = eBookClass.getEStructuralFeatureFromName("name") as EAttribute
        expect(eBookNameAttribute).not.toBeNull()

        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        const eResource = eResourceSet.createResource(new URI("file://$tmp.xml"))
        let eObject: EObject = null
        const eObjectURI = new URI("testdata/book.simple.xml")
        const decoder = new XMLDecoder(eResource, null)

        test("decodeObject", () => {
            const path = uriToFilePath(eObjectURI)
            const buffer = fs.readFileSync(path)
            const result = decoder.decodeObject(buffer)
            if (result.isOk()) eObject = result.value
        })

        test("decodeObjectAsync", async () => {
            const path = uriToFilePath(eObjectURI)
            const stream = fs.createReadStream(path)
            eObject = await decoder.decodeObjectAsync(stream)
        })

        afterEach(() => {
            expect(eObject).not.toBeNull()
            expect(eObject.eGet(eBookNameAttribute)).toBe("Book 1")
        })
    })

    describe("save.library.complex", () => {
        const ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        const xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
        const originURI = new URI("testdata/library.complex.xml")
        const resource = xmlProcessor.loadSync(originURI)

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
            const ePackage = loadPackage("library.complex.ecore")
            expect(ePackage).not.toBeNull()
            const xmlProcessor = new XMLProcessor([ePackage])
            expect(xmlProcessor).not.toBeNull()
            const originURI = new URI("testdata/library.complex.xml")
            const eResource = xmlProcessor.loadSync(originURI)

            const eObject = eResource.getEObject("//@library/@employees.0")
            expect(eObject).not.toBeNull()
            const eContainer = eObject.eContainer()
            expect(eContainer).not.toBeNull()

            // create a new resource
            const subURI = new URI("testdata/library.complex.sub.xml")
            const eNewResource = eResource.eResourceSet().createResource(subURI)
            // add object to new resource
            eNewResource.eContents().add(eObject)
            // save it
            const result = xmlProcessor.saveToString(eNewResource)
            const expected = fs
                .readFileSync(uriToFilePath(subURI))
                .toString()
                .replace(/\r?\n|\r/g, "\n")
            expect(result).toBe(expected)
        })
    })

    describe("save.object", () => {
        const ePackage = loadPackage("library.simple.ecore")
        expect(ePackage).not.toBeNull()
        const eBookClass = ePackage.getEClassifier("Book") as EClass
        expect(eBookClass).not.toBeNull()
        const resourceURI = new URI("testdata/library.simple.xml")
        const xmlProcessor = new XMLProcessor([ePackage])
        const eResource = xmlProcessor.loadSync(resourceURI)
        expect(eResource.getErrors().isEmpty()).toBeTruthy()

        // retrieve second book
        const libraryClass = ePackage.getEClassifier("Library") as EClass
        expect(libraryClass).not.toBeNull()
        const libraryBooksFeature = libraryClass.getEStructuralFeatureFromName("books")
        expect(libraryBooksFeature).not.toBeNull()

        expect(eResource.eContents().size()).toBe(1)
        const eLibrary = eResource.eContents().get(0)
        expect(eLibrary).not.toBeNull()

        const eBooks = eLibrary.eGet(libraryBooksFeature) as EList<EObject>
        expect(eBooks).not.toBeNull()
        expect(eBooks.size()).toBe(4)
        const eBook = eBooks.get(1)

        const xmlEncoder = new XMLEncoder(eResource, null)
        const expected = fs
            .readFileSync("testdata/book.simple.xml")
            .toString()
            .replace(/\r?\n|\r/g, "\n")

        test("encodeObject", () => {
            const result = xmlEncoder.encodeObject(eBook)
            if (result.isOk()) {
                expect(new TextDecoder().decode(Buffer.from(result.value))).toBe(expected)
            }
        })
    })

    describe("load.tournament", function () {
        const ePackage = loadPackage("tournament.ecore")
        const eTournamentClass = ePackage.getEClassifier("Tournament") as EClass
        const eTournamentNameAttribute = eTournamentClass.getEStructuralFeatureFromName("name") as EAttribute
        const eTournameMatchsReference = eTournamentClass.getEStructuralFeatureFromName("matches") as EReference
        const eGroupClass = ePackage.getEClassifier("Group") as EClass
        const eGroupNameAttribute = eGroupClass.getEStructuralFeatureFromName("name") as EAttribute
        const eTeamClass = ePackage.getEClassifier("Team") as EClass
        const eTeamNameAttribute = eTeamClass.getEStructuralFeatureFromName("name") as EAttribute
        const eMachClass = ePackage.getEClassifier("Match") as EClass
        const eMatchHomeTeamReference = eMachClass.getEStructuralFeatureFromName("homeTeam") as EReference
        const eMatchGuestTeamReference = eMachClass.getEStructuralFeatureFromName("guestTeam") as EReference
        const eMatchGroupReference = eMachClass.getEStructuralFeatureFromName("group") as EReference

        test("loadWithReferences", () => {
            const xmlProcessor = new XMLProcessor([ePackage])
            const resource = xmlProcessor.loadSync(new URI("testdata/tournament.xml"))
            expect(resource).not.toBeNull()
            expect(resource.isLoaded()).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()

            const tournament = resource.eContents().get(0)
            expect(tournament.eClass()).toEqual(eTournamentClass)
            expect(tournament.eGet(eTournamentNameAttribute)).toBe("Tournament")

            const matchs = tournament.eGet(eTournameMatchsReference) as EList<EObject>
            expect(matchs.size()).toBe(112)

            const match = matchs.get(0)
            const homeTeam = match.eGetResolve(eMatchHomeTeamReference, false)
            expect(homeTeam.eGet(eTeamNameAttribute)).toBe("Team0")
            const guestTeam = match.eGetResolve(eMatchGuestTeamReference, false)
            expect(guestTeam.eGet(eTeamNameAttribute)).toBe("Team4")
            const group = match.eGetResolve(eMatchGroupReference, false)
            expect(group.eGet(eGroupNameAttribute)).toBe("Group0")
        })
    })
})
