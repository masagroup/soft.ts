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
    Book,
    BookCategory,
    CirculatingItem,
    CirculatingItemImpl,
    LibraryConstants,
    Writer,
    getLibraryPackage
} from "./internal.js"

export class BookImpl extends CirculatingItemImpl implements Book {
    protected _indexes: ecore.EMap<string, number>
    protected _category: BookCategory
    protected _author: Writer
    protected _title: string
    protected _pages: number
    protected _tableOfContents: ecore.EList<string>

    constructor() {
        super()
        this._author = null
        this._category = BookCategory.MYSTERY
        this._indexes = null
        this._pages = 100
        this._title = ""
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getBook()
    }

    // get the value of author
    get author(): Writer {
        if (this._author != null && this._author.eIsProxy()) {
            let oldAuthor = this._author
            let newAuthor = this.eResolveProxy(oldAuthor) as Writer
            this._author = newAuthor
            if (newAuthor != oldAuthor) {
                if (this.eNotificationRequired()) {
                    this.eNotify(
                        new ecore.Notification(
                            this,
                            ecore.EventType.RESOLVE,
                            LibraryConstants.BOOK__AUTHOR,
                            oldAuthor,
                            newAuthor
                        )
                    )
                }
            }
        }
        return this._author
    }

    // set the value of author
    set author(newAuthor: Writer) {
        let oldAuthor = this._author
        if (newAuthor != oldAuthor) {
            let notifications: ecore.ENotificationChain = null
            if (ecore.isEObjectInternal(oldAuthor)) {
                notifications = oldAuthor.eInverseRemove(this, LibraryConstants.WRITER__BOOKS, notifications)
            }
            if (ecore.isEObjectInternal(newAuthor)) {
                notifications = newAuthor.eInverseAdd(this, LibraryConstants.WRITER__BOOKS, notifications)
            }
            notifications = this.basicSetAuthor(newAuthor, notifications)
            if (notifications != null) {
                notifications.dispatch()
            }
        }
    }

    // get the basic value of author with no proxy resolution
    basicGetAuthor(): Writer {
        return this._author
    }

    basicSetAuthor(newAuthor: Writer, msgs: ecore.ENotificationChain): ecore.ENotificationChain {
        let oldAuthor = this._author
        this._author = newAuthor
        let notifications = msgs
        if (this.eNotificationRequired()) {
            let notification = new ecore.Notification(
                this,
                ecore.EventType.SET,
                LibraryConstants.BOOK__AUTHOR,
                oldAuthor,
                newAuthor
            )
            if (notifications != null) {
                notifications.add(notification)
            } else {
                notifications = notification
            }
        }
        return notifications
    }

    // get the value of category
    get category(): BookCategory {
        return this._category
    }

    // set the value of category
    set category(newCategory: BookCategory) {
        let oldCategory = this._category
        this._category = newCategory
        if (this.eNotificationRequired()) {
            this.eNotify(
                new ecore.Notification(
                    this,
                    ecore.EventType.SET,
                    LibraryConstants.BOOK__CATEGORY,
                    oldCategory,
                    newCategory
                )
            )
        }
    }

    // get the value of indexes
    get indexes(): ecore.EMap<string, number> {
        if (this._indexes == null) {
            this._indexes = new ecore.BasicEObjectMap<string, number>(getLibraryPackage().getBookIndex())
        }
        return this._indexes
    }

    // set the value of indexes
    set indexes(newIndexes: ecore.EMap<string, number>) {
        const l = this.indexes
        l.clear()
        l.addAll(newIndexes)
    }

    // get the value of pages
    get pages(): number {
        return this._pages
    }

    // set the value of pages
    set pages(newPages: number) {
        let oldPages = this._pages
        this._pages = newPages
        if (this.eNotificationRequired()) {
            this.eNotify(
                new ecore.Notification(this, ecore.EventType.SET, LibraryConstants.BOOK__PAGES, oldPages, newPages)
            )
        }
    }

    // get the value of tableOfContents
    get tableOfContents(): ecore.EList<string> {
        if (this._tableOfContents == null) {
            this._tableOfContents = new ecore.BasicEDataTypeList<string>(this, LibraryConstants.BOOK__TABLE_OF_CONTENTS)
        }
        return this._tableOfContents
    }

    // set the value of tableOfContents
    set tableOfContents(newTableOfContents: ecore.EList<string>) {
        const l = this.tableOfContents
        l.clear()
        l.addAll(newTableOfContents)
    }

    // get the value of title
    get title(): string {
        return this._title
    }

    // set the value of title
    set title(newTitle: string) {
        let oldTitle = this._title
        this._title = newTitle
        if (this.eNotificationRequired()) {
            this.eNotify(
                new ecore.Notification(this, ecore.EventType.SET, LibraryConstants.BOOK__TITLE, oldTitle, newTitle)
            )
        }
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.BOOK__AUTHOR: {
                return resolve ? this.author : this.basicGetAuthor()
            }
            case LibraryConstants.BOOK__CATEGORY: {
                return this.category
            }
            case LibraryConstants.BOOK__INDEXES: {
                const list = this.indexes
                return !resolve && ecore.isEObjectList(list) ? list.getUnResolvedList() : list
            }
            case LibraryConstants.BOOK__PAGES: {
                return this.pages
            }
            case LibraryConstants.BOOK__TABLE_OF_CONTENTS: {
                return this.tableOfContents
            }
            case LibraryConstants.BOOK__TITLE: {
                return this.title
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case LibraryConstants.BOOK__AUTHOR: {
                this.author = newValue as Writer
                break
            }
            case LibraryConstants.BOOK__CATEGORY: {
                this.category = newValue as BookCategory
                break
            }
            case LibraryConstants.BOOK__INDEXES: {
                const list = this.indexes
                list.clear()
                list.addAll(newValue as ecore.EList<ecore.EMapEntry<string, number>>)
                break
            }
            case LibraryConstants.BOOK__PAGES: {
                this.pages = newValue as number
                break
            }
            case LibraryConstants.BOOK__TABLE_OF_CONTENTS: {
                const list = this.tableOfContents
                list.clear()
                list.addAll(newValue as ecore.EList<string>)
                break
            }
            case LibraryConstants.BOOK__TITLE: {
                this.title = newValue as string
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.BOOK__AUTHOR: {
                this.author = null
                break
            }
            case LibraryConstants.BOOK__CATEGORY: {
                this.category = BookCategory.MYSTERY
                break
            }
            case LibraryConstants.BOOK__INDEXES: {
                this.indexes.clear()
                break
            }
            case LibraryConstants.BOOK__PAGES: {
                this.pages = 100
                break
            }
            case LibraryConstants.BOOK__TABLE_OF_CONTENTS: {
                this.tableOfContents.clear()
                break
            }
            case LibraryConstants.BOOK__TITLE: {
                this.title = ""
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.BOOK__AUTHOR: {
                return this._author != null
            }
            case LibraryConstants.BOOK__CATEGORY: {
                return this._category != BookCategory.MYSTERY
            }
            case LibraryConstants.BOOK__INDEXES: {
                return this._indexes && !this._indexes.isEmpty()
            }
            case LibraryConstants.BOOK__PAGES: {
                return this._pages != 100
            }
            case LibraryConstants.BOOK__TABLE_OF_CONTENTS: {
                return this._tableOfContents && !this._tableOfContents.isEmpty()
            }
            case LibraryConstants.BOOK__TITLE: {
                return this._title != ""
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
            case LibraryConstants.BOOK__AUTHOR: {
                let msgs = notifications
                const author = this.basicGetAuthor()
                if (ecore.isEObjectInternal(author)) {
                    msgs = author.eInverseRemove(this, LibraryConstants.WRITER__BOOKS, msgs)
                }
                return this.basicSetAuthor(otherEnd as Writer, msgs)
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
            case LibraryConstants.BOOK__AUTHOR: {
                return this.basicSetAuthor(null, notifications)
            }
            default: {
                return super.eBasicInverseRemove(otherEnd, featureID, notifications)
            }
        }
    }
}
