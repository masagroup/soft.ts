// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito"
import * as ecore from "@masagroup/ecore"
import {
    Addressable,
    AudioVisualItem,
    Book,
    BookCategory,
    BookIndex,
    BookOnTape,
    Borrower,
    CirculatingItem,
    DocumentRoot,
    Employee,
    Item,
    Lendable,
    Library,
    LibraryConstants,
    LibraryFactory,
    LibraryFactoryImpl,
    Periodical,
    Person,
    VideoCassette,
    Writer,
    bookCategoryFromString,
    bookCategoryToString
} from "./internal.js"

describe("LibraryFactoryImpl", () => {
    test("createFromEClass", () => {
        let factory = LibraryFactoryImpl.getInstance()
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(-1)
            expect(() => factory.create(eClass)).toThrow(Error)
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.BOOK)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.BOOK_INDEX)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.BOOK_ON_TAPE)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.BORROWER)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.DOCUMENT_ROOT)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.EMPLOYEE)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.LIBRARY)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.PERSON)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.VIDEO_CASSETTE)
            expect(factory.create(eClass)).not.toBeNull()
        }
        {
            let mockEClass = mock<ecore.EClass>()
            let eClass = instance(mockEClass)
            when(mockEClass.classifierID).thenReturn(LibraryConstants.WRITER)
            expect(factory.create(eClass)).not.toBeNull()
        }
    })

    test("createBook", () => {
        expect(LibraryFactoryImpl.getInstance().createBook()).not.toBeNull()
    })

    test("createBookIndex", () => {
        expect(LibraryFactoryImpl.getInstance().createBookIndex()).not.toBeNull()
    })

    test("createBookOnTape", () => {
        expect(LibraryFactoryImpl.getInstance().createBookOnTape()).not.toBeNull()
    })

    test("createBorrower", () => {
        expect(LibraryFactoryImpl.getInstance().createBorrower()).not.toBeNull()
    })

    test("createDocumentRoot", () => {
        expect(LibraryFactoryImpl.getInstance().createDocumentRoot()).not.toBeNull()
    })

    test("createEmployee", () => {
        expect(LibraryFactoryImpl.getInstance().createEmployee()).not.toBeNull()
    })

    test("createLibrary", () => {
        expect(LibraryFactoryImpl.getInstance().createLibrary()).not.toBeNull()
    })

    test("createLibraryFromContainer", () => {
        let mockContainer = mock<Library>()
        let container = instance(mockContainer)
        let mockList = mock<ecore.EList<Library>>()
        let list = instance(mockList)
        when(mockList.add(anything())).thenReturn(true)
        when(mockContainer.branches).thenReturn(list)
        expect(LibraryFactoryImpl.getInstance().createLibraryFromContainer(container)).not.toBeNull()
    })

    test("createPerson", () => {
        expect(LibraryFactoryImpl.getInstance().createPerson()).not.toBeNull()
    })

    test("createVideoCassette", () => {
        expect(LibraryFactoryImpl.getInstance().createVideoCassette()).not.toBeNull()
    })

    test("createWriter", () => {
        expect(LibraryFactoryImpl.getInstance().createWriter()).not.toBeNull()
    })

    test("createFromStringInvalid", () => {
        let mockDataType = mock<ecore.EDataType>()
        let eDataType = instance(mockDataType)
        when(mockDataType.classifierID).thenReturn(-1)
        expect(() => LibraryFactoryImpl.getInstance().createFromString(eDataType, "")).toThrow(Error)
    })
    test("convertToStringInvalid", () => {
        let mockDataType = mock<ecore.EDataType>()
        let eDataType = instance(mockDataType)
        when(mockDataType.classifierID).thenReturn(-1)
        expect(() => LibraryFactoryImpl.getInstance().convertToString(eDataType, null)).toThrow(Error)
    })
    test("createBookCategoryFromString", () => {
        let factory = LibraryFactoryImpl.getInstance()
        let mockDataType = mock<ecore.EDataType>()
        let eDataType = instance(mockDataType)
        when(mockDataType.classifierID).thenReturn(LibraryConstants.BOOK_CATEGORY)
        expect(factory.createFromString(eDataType, "Biography")).toStrictEqual(BookCategory.BIOGRAPHY)
        expect(factory.createFromString(eDataType, "Mystery")).toStrictEqual(BookCategory.MYSTERY)
        expect(factory.createFromString(eDataType, "ScienceFiction")).toStrictEqual(BookCategory.SCIENCE_FICTION)
    })

    test("convertBookCategoryToString", () => {
        let factory = LibraryFactoryImpl.getInstance()
        let mockDataType = mock<ecore.EDataType>()
        let eDataType = instance(mockDataType)
        when(mockDataType.classifierID).thenReturn(LibraryConstants.BOOK_CATEGORY)
        expect(factory.convertToString(eDataType, BookCategory.BIOGRAPHY)).toStrictEqual("Biography")
        expect(factory.convertToString(eDataType, BookCategory.MYSTERY)).toStrictEqual("Mystery")
        expect(factory.convertToString(eDataType, BookCategory.SCIENCE_FICTION)).toStrictEqual("ScienceFiction")
    })
})
