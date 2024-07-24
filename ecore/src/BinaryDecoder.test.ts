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
    let xmiProcessor = new XMIProcessor()
    let uri = new URI("testdata/" + filename)
    let resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded()).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    return resource.eContents().get(0) as EPackage
}

describe("BinaryDecoder", () => {
    describe("complex", () => {
        // package
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        let resourceURI = new URI("testdata/library.complex.bin")

        // context
        let eResource = new EResourceImpl()
        eResource.setURI(resourceURI)
        let eResourceSet = new EResourceSetImpl()
        eResourceSet.getResources().add(eResource)
        eResourceSet.getPackageRegistry().registerPackage(ePackage)

        // retrieve document root class , library class & library name attribute
        let eDocumentRootClass = ePackage.getEClassifier("DocumentRoot") as EClass
        expect(eDocumentRootClass).not.toBeNull()
        let eDocumentRootLibraryFeature = eDocumentRootClass.getEStructuralFeatureFromName("library") as EReference
        expect(eDocumentRootLibraryFeature).not.toBeNull()
        let eLibraryClass = ePackage.getEClassifier("Library") as EClass
        expect(eLibraryClass).not.toBeNull()
        let eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute
        expect(eLibraryNameAttribute).not.toBeNull()

        let decoder = new BinaryDecoder(eResource, null)
        let resource: EResource = null

        afterEach(() => {
            expect(resource).toEqual(eResource)

            // check library name
            let eDocumentRoot = resource.eContents().get(0)
            expect(eDocumentRoot).not.toBeNull()
            let eLibrary = eDocumentRoot.eGet(eDocumentRootLibraryFeature) as EObject
            expect(eLibrary).not.toBeNull()
            expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")

            // book class and attributes
            let eLibraryBooksRefeference = eLibraryClass.getEStructuralFeatureFromName("books") as EReference
            expect(eLibraryBooksRefeference).not.toBeNull()
            let eBookClass = ePackage.getEClassifier("Book") as EClass
            expect(eBookClass).not.toBeNull()
            let eBookTitleAttribute = eBookClass.getEStructuralFeatureFromName("title") as EAttribute
            expect(eBookTitleAttribute).not.toBeNull()
            let eBookDateAttribute = eBookClass.getEStructuralFeatureFromName("publicationDate") as EAttribute
            expect(eBookDateAttribute).not.toBeNull()
            let eBookCategoryAttribute = eBookClass.getEStructuralFeatureFromName("category") as EAttribute
            expect(eBookCategoryAttribute).not.toBeNull()
            let eBookAuthorReference = eBookClass.getEStructuralFeatureFromName("author") as EAttribute
            expect(eBookAuthorReference).not.toBeNull()

            // retrive book
            let eBooks = eLibrary.eGet(eLibraryBooksRefeference) as EList<EObject>
            expect(eBooks).not.toBeNull()
            let eBook = eBooks.get(0)
            expect(eBook).not.toBeNull()

            // check book name
            expect(eBook.eGet(eBookTitleAttribute)).toBe("Title 0")

            // check book date
            let date = eBook.eGet(eBookDateAttribute) as Date
            expect(date).not.toBeNull()
            expect(date).toEqual(new Date("2015-09-06 04:24:46 +0000 UTC"))

            // check book category
            let category = eBook.eGet(eBookCategoryAttribute)
            expect(category).toBe(2)

            // check author
            let author = eBook.eGet(eBookAuthorReference) as EObject
            expect(author).not.toBeNull()

            let eWriterClass = ePackage.getEClassifier("Writer") as EClass
            expect(eWriterClass).not.toBeNull()
            let eWriterNameAttribute = eWriterClass.getEStructuralFeatureFromName("firstName") as EAttribute
            expect(eWriterNameAttribute).not.toBeNull()
            expect(author.eGet(eWriterNameAttribute)).toBe("First Name 0")
        })

        test("decode", () => {
            let path = uriToFilePath(resourceURI)
            let s = fs.readFileSync(path)
            let result = decoder.decode(s)
            expect(result.isOk()).toBeTruthy()
            resource = result.unwrap()
        })

        test("decodeAsync", async () => {
            let path = uriToFilePath(resourceURI)
            let stream = fs.createReadStream(path)
            resource = await decoder.decodeAsync(stream)
        })
    })

    describe("complex.id", () => {
        let resourceURI = new URI("testdata/library.complex.id.bin")
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()

        // retrieve document root class , library class & library name attribute
        let eDocumentRootClass = ePackage.getEClassifier("DocumentRoot") as EClass
        expect(eDocumentRootClass).not.toBeNull()
        let eDocumentRootLibraryFeature = eDocumentRootClass.getEStructuralFeatureFromName("library") as EReference
        expect(eDocumentRootLibraryFeature).not.toBeNull()

        let eResource = new EResourceImpl()
        let idManager = new UUIDManager()
        eResource.setObjectIDManager(idManager)
        eResource.setURI(resourceURI)

        let eResourceSet = new EResourceSetImpl()
        eResourceSet.getResources().add(eResource)
        eResourceSet.getPackageRegistry().registerPackage(ePackage)

        let decoder = new BinaryDecoder(eResource, null)
        let resource: EResource = null

        afterEach(() => {
            expect(resource).toEqual(eResource)
            // check ids for document root and library
            let eDocumentRoot = resource.eContents().get(0)
            expect(eDocumentRoot).not.toBeNull()

            let eLibrary = eDocumentRoot.eGet(eDocumentRootLibraryFeature) as EObject
            expect(eLibrary).not.toBeNull()
            let expectedUUID = id128.Uuid4.fromCanonical("75aa92db-b419-4259-93c4-0e542d33aa35")
            let receivedUUID = idManager.getID(eLibrary)
            expect(expectedUUID.equal(receivedUUID)).toBeTruthy()
        })

        test("decode", () => {
            let path = uriToFilePath(resourceURI)
            let s = fs.readFileSync(path)
            let result = decoder.decode(s)
            expect(result.isOk()).toBeTruthy()
            resource = result.unwrap()
        })

        test("decodeAsync", async () => {
            let path = uriToFilePath(resourceURI)
            let stream = fs.createReadStream(path)
            resource = await decoder.decodeAsync(stream)
        })
    })
})
