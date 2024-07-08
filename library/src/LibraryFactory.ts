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
import {
    Addressable,
    AudioVisualItem,
    Book,
    BookIndex,
    BookOnTape,
    Borrower,
    CirculatingItem,
    DocumentRoot,
    Employee,
    Item,
    Lendable,
    Library,
    LibraryFactoryImpl,
    Periodical,
    Person,
    VideoCassette,
    Writer
} from "./internal.js"

export interface LibraryFactory extends ecore.EFactory {
    createBook(): Book

    createBookIndex(): BookIndex

    createBookOnTape(): BookOnTape

    createBorrower(): Borrower

    createDocumentRoot(): DocumentRoot

    createEmployee(): Employee

    createLibrary(): Library
    createLibraryFromContainer(eContainer: Library): Library

    createPerson(): Person

    createVideoCassette(): VideoCassette

    createWriter(): Writer
}

export function getLibraryFactory(): LibraryFactory {
    return LibraryFactoryImpl.getInstance()
}
