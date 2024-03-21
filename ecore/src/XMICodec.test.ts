// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs"
import { EAttribute, EClass, EClassifier, EPackage, EReference, EResourceImpl, URI, uriToFilePath } from "./internal"

describe("XMICodec", () => {
    describe("load.library.simple", () => {
        let resource = new EResourceImpl()
        resource.eURI = new URI("testdata/library.simple.ecore")

        beforeEach(() => {
            resource.unload()
            expect(resource.isLoaded).toBeFalsy()
        })

        afterEach(() => {
            expect(resource.isLoaded).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            let contents = resource.eContents()
            expect(contents.size()).toBe(1)

            let ePackage = contents.get(0) as EPackage
            expect(ePackage).not.toBeNull()
            expect(ePackage.name).toBe("library")
            expect(ePackage.nsPrefix).toBe("lib")
            expect(ePackage.nsURI).toBe("http:///org/eclipse/emf/examples/library/library.simple.ecore/1.0.0")

            let eClassifiers = ePackage.eClassifiers
            expect(eClassifiers.size()).toBe(2)

            let eBookStore = eClassifiers.get(0) as EClassifier
            expect(eBookStore).not.toBeNull()
            expect(eBookStore.name).toBe("Library")

            let eBookStoreClass = eBookStore as EClass
            expect(eBookStoreClass).not.toBeNull()
            expect(eBookStoreClass.getFeatureCount()).toBe(3)

            let eOwnerAttribute = eBookStoreClass.getEStructuralFeature(0) as EAttribute
            expect(eOwnerAttribute.name).toBe("owner")
            let eOwnerAttributeType = eOwnerAttribute.eAttributeType
            expect(eOwnerAttributeType.name).toBe("EString")

            let eLocationAttribute = eBookStoreClass.getEStructuralFeature(1) as EAttribute
            expect(eLocationAttribute.name).toBe("location")
            let eLocationType = eLocationAttribute.eAttributeType
            expect(eLocationType).not.toBeNull()

            let eBooksReference = eBookStoreClass.getEStructuralFeature(2) as EReference
            expect(eBooksReference.name).toBe("books")

            let eBookClass = eClassifiers.get(1) as EClass
            expect(eBookClass.name).toBe("Book")
            expect(eBookClass.getFeatureCount()).toBe(2)

            let eNameAttribute = eBookClass.getEStructuralFeature(0) as EAttribute
            expect(eNameAttribute.name).toBe("name")

            let eISBNFeature = eBookClass.getEStructuralFeature(1) as EAttribute
            expect(eISBNFeature.name).toBe("isbn")

            // check resolved reference
            expect(eBooksReference.eReferenceType).toBe(eBookClass)
        })

        test("load", async () => {
            await resource.load()
        })

        test("loadFromStream", async () => {
            let path = uriToFilePath(resource.eURI)
            let stream = fs.createReadStream(path)
            await resource.loadFromStream(stream)
        })
    })

    describe("load.library.noroot", () => {
        let resource = new EResourceImpl()
        resource.eURI = new URI("testdata/library.noroot.ecore")

        beforeEach(() => {
            resource.unload()
            expect(resource.isLoaded).toBeFalsy()
        })

        afterEach(() => {
            expect(resource.isLoaded).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            let contents = resource.eContents()
            expect(contents.size()).toBe(1)

            let ePackage = contents.get(0) as EPackage
            expect(ePackage).not.toBeNull()

            let eClassifiers = ePackage.eClassifiers
            let eBook = eClassifiers.get(0) as EClassifier
            expect(eBook).not.toBeNull()
            expect(eBook.name).toBe("Book")

            let eBookClass = eBook as EClass
            expect(eBookClass).not.toBeNull()
            let eSuperTypes = eBookClass.eSuperTypes
            expect(eSuperTypes.size()).toBe(1)
            let eCirculatingItemClass = eSuperTypes.get(0)
            expect(eCirculatingItemClass.name).toBe("CirculatingItem")

            let eWriterClass = eClassifiers.get(2) as EClass
            expect(eWriterClass).not.toBeNull()
            expect(eWriterClass.eAnnotations.isEmpty()).toBeFalsy()
            let eAnnotation = eWriterClass.getEAnnotation("http://net.masagroup/soft/2020/GenTS")
            expect(eAnnotation).not.toBeNull()
            expect(eAnnotation.details.getValue("extension")).toBe("true")
        })

        test("load", async () => {
            await resource.load()
        })

        test("loadFromStream", async () => {
            let path = uriToFilePath(resource.eURI)
            let stream = fs.createReadStream(path)
            await resource.loadFromStream(stream)
        })
    })

    describe("load.library.complex", () => {
        let resource = new EResourceImpl()
        resource.eURI = new URI("testdata/library.complex.ecore")

        beforeEach(() => {
            resource.unload()
            expect(resource.isLoaded).toBeFalsy()
        })

        afterEach(() => {
            expect(resource.isLoaded).toBeTruthy()
            expect(resource.getErrors().isEmpty()).toBeTruthy()
            expect(resource.getWarnings().isEmpty()).toBeTruthy()

            let contents = resource.eContents()
            expect(contents.size()).toBe(1)

            let ePackage = contents.get(0) as EPackage
            let eClassifiers = ePackage.eClassifiers

            let eDocumentRootClass = eClassifiers.get(0) as EClass
            expect(eDocumentRootClass).not.toBeNull()
            expect(eDocumentRootClass.name).toBe("DocumentRoot")

            let eXMNLSPrefixFeature = eDocumentRootClass.getEStructuralFeatureFromName("xMLNSPrefixMap") as EReference
            expect(eXMNLSPrefixFeature).not.toBeNull()

            let eType = eXMNLSPrefixFeature.eType
            expect(eType).not.toBeNull()
            expect(eType.name).toBe("EStringToStringMapEntry")
            expect(eType.eIsProxy()).toBeFalsy()
        })

        test("load", async () => {
            await resource.load()
        })

        test("loadFromStream", async () => {
            let path = uriToFilePath(resource.eURI)
            let stream = fs.createReadStream(path)
            await resource.loadFromStream(stream)
        })

        test("loadFromString", () => {
            let path = uriToFilePath(resource.eURI)
            let buffer = fs.readFileSync(path)
            resource.loadFromString(buffer.toString())
        })
    })

    describe("save.library.simple", () => {
        test("saveToString", async () => {
            let resource = new EResourceImpl()
            resource.eURI = new URI("testdata/library.simple.ecore")
            await resource.load()

            let result = resource.saveToString()
            let expected = fs
                .readFileSync(uriToFilePath(resource.eURI))
                .toString()
                .replace(/\r?\n|\r/g, "\n")

            expect(result).toBe(expected)
        })
    })

    describe("save.library.complex", () => {
        test("saveToString", async () => {
            let resource = new EResourceImpl()
            resource.eURI = new URI("testdata/library.complex.ecore")
            await resource.load()

            let result = resource.saveToString()
            let expected = fs
                .readFileSync(uriToFilePath(resource.eURI))
                .toString()
                .replace(/\r?\n|\r/g, "\n")

            expect(result).toBe(expected)
        })
    })
})
