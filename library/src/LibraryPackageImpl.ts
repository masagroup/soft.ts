// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore"
import { LibraryConstants, LibraryPackage, getLibraryFactory } from "./internal"

export class LibraryPackageImpl extends ecore.EPackageExt implements LibraryPackage {
    private static _instance: LibraryPackageImpl = null
    private _addressableClass: ecore.EClass
    private _audioVisualItemClass: ecore.EClass
    private _bookClass: ecore.EClass
    private _bookIndexClass: ecore.EClass
    private _bookOnTapeClass: ecore.EClass
    private _borrowerClass: ecore.EClass
    private _circulatingItemClass: ecore.EClass
    private _documentRootClass: ecore.EClass
    private _employeeClass: ecore.EClass
    private _itemClass: ecore.EClass
    private _lendableClass: ecore.EClass
    private _libraryClass: ecore.EClass
    private _periodicalClass: ecore.EClass
    private _personClass: ecore.EClass
    private _videoCassetteClass: ecore.EClass
    private _writerClass: ecore.EClass

    private _bookCategoryType: ecore.EEnum

    public static getInstance(): LibraryPackageImpl {
        if (!this._instance) {
            this._instance = new LibraryPackageImpl()
        }
        return this._instance
    }

    private constructor() {
        super()
        this.name = LibraryConstants.eNAME
        this.nsPrefix = LibraryConstants.eNS_PREFIX
        this.nsURI = LibraryConstants.eNS_URI
        this.eFactoryInstance = getLibraryFactory()
        this.createPackageContents()
        this.initializePackageContents()
        this.createResource()
    }

    getAddressable(): ecore.EClass {
        return this._addressableClass
    }

    getAddressable_Address(): ecore.EAttribute {
        return this._addressableClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }

    getAudioVisualItem(): ecore.EClass {
        return this._audioVisualItemClass
    }

    getAudioVisualItem_Damaged(): ecore.EAttribute {
        return this._audioVisualItemClass.eStructuralFeatures.get(2) as ecore.EAttribute
    }
    getAudioVisualItem_MinutesLength(): ecore.EAttribute {
        return this._audioVisualItemClass.eStructuralFeatures.get(1) as ecore.EAttribute
    }
    getAudioVisualItem_Title(): ecore.EAttribute {
        return this._audioVisualItemClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }

    getBook(): ecore.EClass {
        return this._bookClass
    }

    getBook_Category(): ecore.EAttribute {
        return this._bookClass.eStructuralFeatures.get(2) as ecore.EAttribute
    }
    getBook_Pages(): ecore.EAttribute {
        return this._bookClass.eStructuralFeatures.get(1) as ecore.EAttribute
    }
    getBook_TableOfContents(): ecore.EAttribute {
        return this._bookClass.eStructuralFeatures.get(4) as ecore.EAttribute
    }
    getBook_Title(): ecore.EAttribute {
        return this._bookClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }

    getBook_Author(): ecore.EReference {
        return this._bookClass.eStructuralFeatures.get(3) as ecore.EReference
    }
    getBook_Indexes(): ecore.EReference {
        return this._bookClass.eStructuralFeatures.get(5) as ecore.EReference
    }

    getBookIndex(): ecore.EClass {
        return this._bookIndexClass
    }

    getBookIndex_Key(): ecore.EAttribute {
        return this._bookIndexClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }
    getBookIndex_Value(): ecore.EAttribute {
        return this._bookIndexClass.eStructuralFeatures.get(1) as ecore.EAttribute
    }

    getBookOnTape(): ecore.EClass {
        return this._bookOnTapeClass
    }

    getBookOnTape_Author(): ecore.EReference {
        return this._bookOnTapeClass.eStructuralFeatures.get(1) as ecore.EReference
    }
    getBookOnTape_Reader(): ecore.EReference {
        return this._bookOnTapeClass.eStructuralFeatures.get(0) as ecore.EReference
    }

    getBorrower(): ecore.EClass {
        return this._borrowerClass
    }

    getBorrower_Borrowed(): ecore.EReference {
        return this._borrowerClass.eStructuralFeatures.get(0) as ecore.EReference
    }

    getCirculatingItem(): ecore.EClass {
        return this._circulatingItemClass
    }

    getDocumentRoot(): ecore.EClass {
        return this._documentRootClass
    }

    getDocumentRoot_Library(): ecore.EReference {
        return this._documentRootClass.eStructuralFeatures.get(2) as ecore.EReference
    }
    getDocumentRoot_XMLNSPrefixMap(): ecore.EReference {
        return this._documentRootClass.eStructuralFeatures.get(0) as ecore.EReference
    }
    getDocumentRoot_XSISchemaLocation(): ecore.EReference {
        return this._documentRootClass.eStructuralFeatures.get(1) as ecore.EReference
    }

    getEmployee(): ecore.EClass {
        return this._employeeClass
    }

    getEmployee_Manager(): ecore.EReference {
        return this._employeeClass.eStructuralFeatures.get(0) as ecore.EReference
    }

    getItem(): ecore.EClass {
        return this._itemClass
    }

    getItem_PublicationDate(): ecore.EAttribute {
        return this._itemClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }

    getLendable(): ecore.EClass {
        return this._lendableClass
    }

    getLendable_Copies(): ecore.EAttribute {
        return this._lendableClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }

    getLendable_Borrowers(): ecore.EReference {
        return this._lendableClass.eStructuralFeatures.get(1) as ecore.EReference
    }

    getLibrary(): ecore.EClass {
        return this._libraryClass
    }

    getLibrary_Name(): ecore.EAttribute {
        return this._libraryClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }
    getLibrary_People(): ecore.EAttribute {
        return this._libraryClass.eStructuralFeatures.get(8) as ecore.EAttribute
    }

    getLibrary_Books(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(5) as ecore.EReference
    }
    getLibrary_Borrowers(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(3) as ecore.EReference
    }
    getLibrary_Branches(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(6) as ecore.EReference
    }
    getLibrary_Employees(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(2) as ecore.EReference
    }
    getLibrary_ParentBranch(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(7) as ecore.EReference
    }
    getLibrary_Proprietary(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(9) as ecore.EReference
    }
    getLibrary_Stock(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(4) as ecore.EReference
    }
    getLibrary_Writers(): ecore.EReference {
        return this._libraryClass.eStructuralFeatures.get(1) as ecore.EReference
    }

    getPeriodical(): ecore.EClass {
        return this._periodicalClass
    }

    getPeriodical_IssuesPerYear(): ecore.EAttribute {
        return this._periodicalClass.eStructuralFeatures.get(1) as ecore.EAttribute
    }
    getPeriodical_Title(): ecore.EAttribute {
        return this._periodicalClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }

    getPerson(): ecore.EClass {
        return this._personClass
    }

    getPerson_FirstName(): ecore.EAttribute {
        return this._personClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }
    getPerson_LastName(): ecore.EAttribute {
        return this._personClass.eStructuralFeatures.get(1) as ecore.EAttribute
    }

    getVideoCassette(): ecore.EClass {
        return this._videoCassetteClass
    }

    getVideoCassette_Cast(): ecore.EReference {
        return this._videoCassetteClass.eStructuralFeatures.get(0) as ecore.EReference
    }

    getWriter(): ecore.EClass {
        return this._writerClass
    }

    getWriter_Name(): ecore.EAttribute {
        return this._writerClass.eStructuralFeatures.get(0) as ecore.EAttribute
    }

    getWriter_Books(): ecore.EReference {
        return this._writerClass.eStructuralFeatures.get(1) as ecore.EReference
    }

    getBookCategory(): ecore.EEnum {
        return this._bookCategoryType
    }

    private createPackageContents(): void {
        let factory = ecore.getEcoreFactory()

        this._addressableClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.ADDRESSABLE)
        factory.createEAttributeFromContainerAndClassID(this._addressableClass, LibraryConstants.ADDRESSABLE__ADDRESS)

        this._audioVisualItemClass = factory.createEClassFromContainerAndClassID(
            this,
            LibraryConstants.AUDIO_VISUAL_ITEM
        )
        factory.createEAttributeFromContainerAndClassID(
            this._audioVisualItemClass,
            LibraryConstants.AUDIO_VISUAL_ITEM__TITLE
        )
        factory.createEAttributeFromContainerAndClassID(
            this._audioVisualItemClass,
            LibraryConstants.AUDIO_VISUAL_ITEM__MINUTES_LENGTH
        )
        factory.createEAttributeFromContainerAndClassID(
            this._audioVisualItemClass,
            LibraryConstants.AUDIO_VISUAL_ITEM__DAMAGED
        )

        this._bookClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.BOOK)
        factory.createEAttributeFromContainerAndClassID(this._bookClass, LibraryConstants.BOOK__TITLE)
        factory.createEAttributeFromContainerAndClassID(this._bookClass, LibraryConstants.BOOK__PAGES)
        factory.createEAttributeFromContainerAndClassID(this._bookClass, LibraryConstants.BOOK__CATEGORY)
        factory.createEReferenceFromContainerAndClassID(this._bookClass, LibraryConstants.BOOK__AUTHOR)
        factory.createEAttributeFromContainerAndClassID(this._bookClass, LibraryConstants.BOOK__TABLE_OF_CONTENTS)
        factory.createEReferenceFromContainerAndClassID(this._bookClass, LibraryConstants.BOOK__INDEXES)

        this._bookIndexClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.BOOK_INDEX)
        factory.createEAttributeFromContainerAndClassID(this._bookIndexClass, LibraryConstants.BOOK_INDEX__KEY)
        factory.createEAttributeFromContainerAndClassID(this._bookIndexClass, LibraryConstants.BOOK_INDEX__VALUE)

        this._bookOnTapeClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.BOOK_ON_TAPE)
        factory.createEReferenceFromContainerAndClassID(this._bookOnTapeClass, LibraryConstants.BOOK_ON_TAPE__READER)
        factory.createEReferenceFromContainerAndClassID(this._bookOnTapeClass, LibraryConstants.BOOK_ON_TAPE__AUTHOR)

        this._borrowerClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.BORROWER)
        factory.createEReferenceFromContainerAndClassID(this._borrowerClass, LibraryConstants.BORROWER__BORROWED)

        this._circulatingItemClass = factory.createEClassFromContainerAndClassID(
            this,
            LibraryConstants.CIRCULATING_ITEM
        )

        this._documentRootClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.DOCUMENT_ROOT)
        factory.createEReferenceFromContainerAndClassID(
            this._documentRootClass,
            LibraryConstants.DOCUMENT_ROOT__XMLNS_PREFIX_MAP
        )
        factory.createEReferenceFromContainerAndClassID(
            this._documentRootClass,
            LibraryConstants.DOCUMENT_ROOT__XSI_SCHEMA_LOCATION
        )
        factory.createEReferenceFromContainerAndClassID(
            this._documentRootClass,
            LibraryConstants.DOCUMENT_ROOT__LIBRARY
        )

        this._employeeClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.EMPLOYEE)
        factory.createEReferenceFromContainerAndClassID(this._employeeClass, LibraryConstants.EMPLOYEE__MANAGER)

        this._itemClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.ITEM)
        factory.createEAttributeFromContainerAndClassID(this._itemClass, LibraryConstants.ITEM__PUBLICATION_DATE)

        this._lendableClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.LENDABLE)
        factory.createEAttributeFromContainerAndClassID(this._lendableClass, LibraryConstants.LENDABLE__COPIES)
        factory.createEReferenceFromContainerAndClassID(this._lendableClass, LibraryConstants.LENDABLE__BORROWERS)

        this._libraryClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.LIBRARY)
        factory.createEAttributeFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__NAME)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__WRITERS)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__EMPLOYEES)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__BORROWERS)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__STOCK)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__BOOKS)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__BRANCHES)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__PARENT_BRANCH)
        factory.createEAttributeFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__PEOPLE)
        factory.createEReferenceFromContainerAndClassID(this._libraryClass, LibraryConstants.LIBRARY__PROPRIETARY)

        this._periodicalClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.PERIODICAL)
        factory.createEAttributeFromContainerAndClassID(this._periodicalClass, LibraryConstants.PERIODICAL__TITLE)
        factory.createEAttributeFromContainerAndClassID(
            this._periodicalClass,
            LibraryConstants.PERIODICAL__ISSUES_PER_YEAR
        )

        this._personClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.PERSON)
        factory.createEAttributeFromContainerAndClassID(this._personClass, LibraryConstants.PERSON__FIRST_NAME)
        factory.createEAttributeFromContainerAndClassID(this._personClass, LibraryConstants.PERSON__LAST_NAME)

        this._videoCassetteClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.VIDEO_CASSETTE)
        factory.createEReferenceFromContainerAndClassID(this._videoCassetteClass, LibraryConstants.VIDEO_CASSETTE__CAST)

        this._writerClass = factory.createEClassFromContainerAndClassID(this, LibraryConstants.WRITER)
        factory.createEAttributeFromContainerAndClassID(this._writerClass, LibraryConstants.WRITER__NAME)
        factory.createEReferenceFromContainerAndClassID(this._writerClass, LibraryConstants.WRITER__BOOKS)

        this._bookCategoryType = factory.createEEnumFromContainerAndClassID(this, LibraryConstants.BOOK_CATEGORY)
    }

    private initializePackageContents(): void {
        this._audioVisualItemClass.eSuperTypes.add(this._circulatingItemClass)
        this._bookClass.eSuperTypes.add(this._circulatingItemClass)
        this._bookOnTapeClass.eSuperTypes.add(this._audioVisualItemClass)
        this._borrowerClass.eSuperTypes.add(this._personClass)
        this._circulatingItemClass.eSuperTypes.add(this._itemClass)
        this._circulatingItemClass.eSuperTypes.add(this._lendableClass)
        this._employeeClass.eSuperTypes.add(this._personClass)
        this._libraryClass.eSuperTypes.add(this._addressableClass)
        this._periodicalClass.eSuperTypes.add(this._itemClass)
        this._personClass.eSuperTypes.add(this._addressableClass)
        this._videoCassetteClass.eSuperTypes.add(this._audioVisualItemClass)
        this._writerClass.eSuperTypes.add(this._personClass)

        this.initEClass(this._addressableClass, "Addressable", "library.Addressable", true, true)
        this.initEAttribute(
            this.getAddressable_Address(),
            ecore.getEcorePackage().getEString(),
            "address",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )

        this.initEClass(this._audioVisualItemClass, "AudioVisualItem", "library.AudioVisualItem", true, false)
        this.initEAttribute(
            this.getAudioVisualItem_Title(),
            ecore.getEcorePackage().getEString(),
            "title",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getAudioVisualItem_MinutesLength(),
            ecore.getEcorePackage().getEInt(),
            "minutesLength",
            "",
            1,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getAudioVisualItem_Damaged(),
            ecore.getEcorePackage().getEBoolean(),
            "damaged",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )

        this.initEClass(this._bookClass, "Book", "library.Book", false, false)
        this.initEAttribute(
            this.getBook_Title(),
            ecore.getEcorePackage().getEString(),
            "title",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getBook_Pages(),
            ecore.getEcorePackage().getEInt(),
            "pages",
            "100",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getBook_Category(),
            this.getBookCategory(),
            "category",
            "",
            0,
            1,
            false,
            false,
            true,
            true,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getBook_TableOfContents(),
            ecore.getEcorePackage().getEString(),
            "tableOfContents",
            "",
            0,
            -1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEReference(
            this.getBook_Author(),
            this.getWriter(),
            this.getWriter_Books(),
            "author",
            "",
            1,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getBook_Indexes(),
            this.getBookIndex(),
            null,
            "indexes",
            "",
            0,
            -1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )

        this.initEClass(this._bookIndexClass, "BookIndex", "ecore.EMapEntry", false, false)
        this.initEAttribute(
            this.getBookIndex_Key(),
            ecore.getEcorePackage().getEString(),
            "key",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getBookIndex_Value(),
            ecore.getEcorePackage().getEInt(),
            "value",
            "",
            0,
            -1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )

        this.initEClass(this._bookOnTapeClass, "BookOnTape", "library.BookOnTape", false, false)
        this.initEReference(
            this.getBookOnTape_Reader(),
            this.getPerson(),
            null,
            "reader",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getBookOnTape_Author(),
            this.getWriter(),
            null,
            "author",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )

        this.initEClass(this._borrowerClass, "Borrower", "library.Borrower", false, false)
        this.initEReference(
            this.getBorrower_Borrowed(),
            this.getLendable(),
            this.getLendable_Borrowers(),
            "borrowed",
            "",
            0,
            -1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )

        this.initEClass(this._circulatingItemClass, "CirculatingItem", "library.CirculatingItem", true, false)

        this.initEClass(this._documentRootClass, "DocumentRoot", "library.DocumentRoot", false, false)
        this.initEReference(
            this.getDocumentRoot_XMLNSPrefixMap(),
            ecore.getEcorePackage().getEStringToStringMapEntry(),
            null,
            "xMLNSPrefixMap",
            "",
            0,
            -1,
            true,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getDocumentRoot_XSISchemaLocation(),
            ecore.getEcorePackage().getEStringToStringMapEntry(),
            null,
            "xSISchemaLocation",
            "",
            0,
            -1,
            true,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getDocumentRoot_Library(),
            this.getLibrary(),
            null,
            "library",
            "",
            0,
            1,
            false,
            false,
            true,
            true,
            true,
            false,
            true,
            false,
            true
        )

        this.initEClass(this._employeeClass, "Employee", "library.Employee", false, false)
        this.initEReference(
            this.getEmployee_Manager(),
            this.getEmployee(),
            null,
            "manager",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )

        this.initEClass(this._itemClass, "Item", "library.Item", true, false)
        this.initEAttribute(
            this.getItem_PublicationDate(),
            ecore.getEcorePackage().getEDate(),
            "publicationDate",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )

        this.initEClass(this._lendableClass, "Lendable", "library.Lendable", true, true)
        this.initEAttribute(
            this.getLendable_Copies(),
            ecore.getEcorePackage().getEInt(),
            "copies",
            "",
            1,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEReference(
            this.getLendable_Borrowers(),
            this.getBorrower(),
            this.getBorrower_Borrowed(),
            "borrowers",
            "",
            0,
            -1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            false
        )

        this.initEClass(this._libraryClass, "Library", "library.Library", false, false)
        this.initEAttribute(
            this.getLibrary_Name(),
            ecore.getEcorePackage().getEString(),
            "name",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getLibrary_People(),
            ecore.getEcorePackage().getEFeatureMapEntry(),
            "people",
            "",
            0,
            -1,
            true,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEReference(
            this.getLibrary_Writers(),
            this.getWriter(),
            null,
            "writers",
            "",
            0,
            -1,
            false,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getLibrary_Employees(),
            this.getEmployee(),
            null,
            "employees",
            "",
            0,
            -1,
            false,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getLibrary_Borrowers(),
            this.getBorrower(),
            null,
            "borrowers",
            "",
            0,
            -1,
            false,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getLibrary_Stock(),
            this.getItem(),
            null,
            "stock",
            "",
            0,
            -1,
            true,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            false
        )
        this.initEReference(
            this.getLibrary_Books(),
            this.getBook(),
            null,
            "books",
            "",
            0,
            -1,
            false,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            false
        )
        this.initEReference(
            this.getLibrary_Branches(),
            this.getLibrary(),
            this.getLibrary_ParentBranch(),
            "branches",
            "",
            0,
            -1,
            false,
            false,
            true,
            true,
            true,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getLibrary_ParentBranch(),
            this.getLibrary(),
            this.getLibrary_Branches(),
            "parentBranch",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )
        this.initEReference(
            this.getLibrary_Proprietary(),
            this.getPerson(),
            null,
            "proprietary",
            "",
            0,
            1,
            false,
            false,
            true,
            true,
            true,
            false,
            true,
            false,
            true
        )

        this.initEClass(this._periodicalClass, "Periodical", "library.Periodical", true, false)
        this.initEAttribute(
            this.getPeriodical_Title(),
            ecore.getEcorePackage().getEString(),
            "title",
            "",
            0,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getPeriodical_IssuesPerYear(),
            ecore.getEcorePackage().getEInt(),
            "issuesPerYear",
            "",
            1,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )

        this.initEClass(this._personClass, "Person", "library.Person", false, false)
        this.initEAttribute(
            this.getPerson_FirstName(),
            ecore.getEcorePackage().getEString(),
            "firstName",
            "",
            1,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEAttribute(
            this.getPerson_LastName(),
            ecore.getEcorePackage().getEString(),
            "lastName",
            "",
            1,
            1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false
        )

        this.initEClass(this._videoCassetteClass, "VideoCassette", "library.VideoCassette", false, false)
        this.initEReference(
            this.getVideoCassette_Cast(),
            this.getPerson(),
            null,
            "cast",
            "",
            0,
            -1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )

        this.initEClass(this._writerClass, "Writer", "library.Writer", false, false)
        this.initEAttribute(
            this.getWriter_Name(),
            ecore.getEcorePackage().getEString(),
            "name",
            "",
            0,
            1,
            true,
            true,
            true,
            false,
            true,
            false,
            true,
            false
        )
        this.initEReference(
            this.getWriter_Books(),
            this.getBook(),
            this.getBook_Author(),
            "books",
            "",
            0,
            -1,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )

        this.initEEnum(this.getBookCategory(), "BookCategory", "number")
        this.addEEnumLiteral(this.getBookCategory(), "Mystery", "Mystery", 0)
        this.addEEnumLiteral(this.getBookCategory(), "ScienceFiction", "ScienceFiction", 1)
        this.addEEnumLiteral(this.getBookCategory(), "Biography", "Biography", 2)

        this.initializeExtendedMetaDataAnnotations()
        this.initializeGenTSAnnotations()
    }

    private initializeExtendedMetaDataAnnotations(): void {
        let source = "http:///org/eclipse/emf/ecore/util/ExtendedMetaData"
        let factory = ecore.getEcoreFactory()
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getLibrary_Writers())
            eAnnotation.source = source
            eAnnotation.details.put("group", "#people")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getLibrary_Employees())
            eAnnotation.source = source
            eAnnotation.details.put("group", "#people")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getLibrary_Borrowers())
            eAnnotation.source = source
            eAnnotation.details.put("group", "#people")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getLibrary_ParentBranch())
            eAnnotation.source = source
            eAnnotation.details.put("name", "parent-branch")
            eAnnotation.details.put("kind", "element")
            eAnnotation.details.put("namespace", "##targetNamespace")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getLibrary_People())
            eAnnotation.source = source
            eAnnotation.details.put("kind", "group")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getLibrary_Proprietary())
            eAnnotation.source = source
            eAnnotation.details.put("name", "owner-pdg")
            eAnnotation.details.put("kind", "element")
            eAnnotation.details.put("namespace", "##targetNamespace")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getItem_PublicationDate())
            eAnnotation.source = source
            eAnnotation.details.put("name", "publication-date")
            eAnnotation.details.put("kind", "attribute")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getPeriodical_IssuesPerYear())
            eAnnotation.source = source
            eAnnotation.details.put("name", "issues-per-year")
            eAnnotation.details.put("kind", "attribute")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getAudioVisualItem_MinutesLength())
            eAnnotation.source = source
            eAnnotation.details.put("name", "minutes-length")
            eAnnotation.details.put("kind", "attribute")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getPerson_FirstName())
            eAnnotation.source = source
            eAnnotation.details.put("name", "first-name")
            eAnnotation.details.put("kind", "attribute")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getPerson_LastName())
            eAnnotation.source = source
            eAnnotation.details.put("name", "last-name")
            eAnnotation.details.put("kind", "attribute")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getDocumentRoot())
            eAnnotation.source = source
            eAnnotation.details.put("name", "")
            eAnnotation.details.put("kind", "mixed")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getDocumentRoot_XMLNSPrefixMap())
            eAnnotation.source = source
            eAnnotation.details.put("kind", "attribute")
            eAnnotation.details.put("name", "xmlns:prefix")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getDocumentRoot_XSISchemaLocation())
            eAnnotation.source = source
            eAnnotation.details.put("kind", "attribute")
            eAnnotation.details.put("name", "xsi:schemaLocation")
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getDocumentRoot_Library())
            eAnnotation.source = source
            eAnnotation.details.put("name", "library")
            eAnnotation.details.put("kind", "element")
            eAnnotation.details.put("namespace", "##targetNamespace")
        }
    }

    private initializeGenTSAnnotations(): void {
        let source = "http://net.masagroup/soft/2020/GenTS"
        let factory = ecore.getEcoreFactory()
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this)
            eAnnotation.source = source
            eAnnotation.details.put(
                "supressAnnotations",
                "http://www.eclipse.org/emf/2002/Ecore http://net.masagroup/soft/2018/GenCpp http://net.masagroup/soft/2019/GenGo"
            )
        }
        {
            let eAnnotation = factory.createEAnnotationFromContainer(this.getWriter())
            eAnnotation.source = source
            eAnnotation.details.put("extension", "true")
        }
    }
}
