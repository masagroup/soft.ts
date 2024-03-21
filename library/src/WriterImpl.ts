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
import { Book, LibraryConstants, Person, PersonImpl, Writer, getLibraryPackage } from "./internal"

export class WriterImpl extends PersonImpl implements Writer {
    protected _books: ecore.EList<Book>

    constructor() {
        super()
        this._books = null
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getWriter()
    }

    // get the value of books
    get books(): ecore.EList<Book> {
        if (this._books == null) {
            this._books = new ecore.BasicEObjectList<Book>(
                this,
                LibraryConstants.WRITER__BOOKS,
                LibraryConstants.BOOK__AUTHOR,
                false,
                true,
                true,
                true,
                false
            )
        }
        return this._books
    }

    // get the value of name
    get name(): string {
        throw new Error("get name not implemented")
    }

    // set the value of name
    set name(newName: string) {
        throw new Error("set name not implemented")
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.WRITER__BOOKS: {
                return !resolve && ecore.isEObjectList(this.books) ? this.books.getUnResolvedList() : this.books
            }
            case LibraryConstants.WRITER__NAME: {
                return this.name
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case LibraryConstants.WRITER__BOOKS: {
                this.books.clear()
                this.books.addAll(newValue as ecore.EList<Book>)
                break
            }
            case LibraryConstants.WRITER__NAME: {
                this.name = newValue as string
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.WRITER__BOOKS: {
                this.books.clear()
                break
            }
            case LibraryConstants.WRITER__NAME: {
                this.name = ""
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.WRITER__BOOKS: {
                return this.books != null && this.books.size() != 0
            }
            case LibraryConstants.WRITER__NAME: {
                return this.name != ""
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }

    eBasicInverseAdd(
        otherEnd: ecore.EObject,
        featureID: number,
        notifications: ecore.ENotificationChain
    ): ecore.ENotificationChain {
        switch (featureID) {
            case LibraryConstants.WRITER__BOOKS: {
                let list = this.books as ecore.ENotifyingList<Book>
                let end = otherEnd as Book
                return list.addWithNotification(end, notifications)
            }
            default: {
                return super.eBasicInverseAdd(otherEnd, featureID, notifications)
            }
        }
    }

    eBasicInverseRemove(
        otherEnd: ecore.EObject,
        featureID: number,
        notifications: ecore.ENotificationChain
    ): ecore.ENotificationChain {
        switch (featureID) {
            case LibraryConstants.WRITER__BOOKS: {
                let list = this.books as ecore.ENotifyingList<Book>
                let end = otherEnd as Book
                return list.removeWithNotification(end, notifications)
            }
            default: {
                return super.eBasicInverseRemove(otherEnd, featureID, notifications)
            }
        }
    }
}
