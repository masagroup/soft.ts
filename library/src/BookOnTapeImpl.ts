// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore";
import {
    AudioVisualItem,
    AudioVisualItemImpl,
    BookOnTape,
    LibraryConstants,
    Person,
    Writer,
    getLibraryPackage,
} from "./internal";

export class BookOnTapeImpl extends AudioVisualItemImpl implements BookOnTape {
    protected _author: Writer;
    protected _reader: Person;

    constructor() {
        super();
        this._author = null;
        this._reader = null;
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getBookOnTape();
    }

    // get the value of author
    get author(): Writer {
        if (this._author != null && this._author.eIsProxy()) {
            let oldAuthor = this._author;
            let newAuthor = this.eResolveProxy(oldAuthor) as Writer;
            this._author = newAuthor;
            if (newAuthor != oldAuthor) {
                if (this.eNotificationRequired) {
                    this.eNotify(
                        new ecore.Notification(
                            this,
                            ecore.EventType.RESOLVE,
                            LibraryConstants.BOOK_ON_TAPE__AUTHOR,
                            oldAuthor,
                            newAuthor
                        )
                    );
                }
            }
        }
        return this._author;
    }

    // set the value of author
    set author(newAuthor: Writer) {
        let oldAuthor = this._author;
        this._author = newAuthor;
        if (this.eNotificationRequired) {
            this.eNotify(
                new ecore.Notification(
                    this,
                    ecore.EventType.SET,
                    LibraryConstants.BOOK_ON_TAPE__AUTHOR,
                    oldAuthor,
                    newAuthor
                )
            );
        }
    }

    // get the basic value of author with no proxy resolution
    basicGetAuthor(): Writer {
        return this._author;
    }

    // get the value of reader
    get reader(): Person {
        if (this._reader != null && this._reader.eIsProxy()) {
            let oldReader = this._reader;
            let newReader = this.eResolveProxy(oldReader) as Person;
            this._reader = newReader;
            if (newReader != oldReader) {
                if (this.eNotificationRequired) {
                    this.eNotify(
                        new ecore.Notification(
                            this,
                            ecore.EventType.RESOLVE,
                            LibraryConstants.BOOK_ON_TAPE__READER,
                            oldReader,
                            newReader
                        )
                    );
                }
            }
        }
        return this._reader;
    }

    // set the value of reader
    set reader(newReader: Person) {
        let oldReader = this._reader;
        this._reader = newReader;
        if (this.eNotificationRequired) {
            this.eNotify(
                new ecore.Notification(
                    this,
                    ecore.EventType.SET,
                    LibraryConstants.BOOK_ON_TAPE__READER,
                    oldReader,
                    newReader
                )
            );
        }
    }

    // get the basic value of reader with no proxy resolution
    basicGetReader(): Person {
        return this._reader;
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.BOOK_ON_TAPE__AUTHOR: {
                if (resolve) {
                    return this.author;
                }
                return this.basicGetAuthor();
            }
            case LibraryConstants.BOOK_ON_TAPE__READER: {
                if (resolve) {
                    return this.reader;
                }
                return this.basicGetReader();
            }
            default: {
                return super.eGetFromID(featureID, resolve);
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case LibraryConstants.BOOK_ON_TAPE__AUTHOR: {
                this.author = newValue as Writer;
                break;
            }
            case LibraryConstants.BOOK_ON_TAPE__READER: {
                this.reader = newValue as Person;
                break;
            }
            default: {
                super.eSetFromID(featureID, newValue);
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.BOOK_ON_TAPE__AUTHOR: {
                this.author = null;
                break;
            }
            case LibraryConstants.BOOK_ON_TAPE__READER: {
                this.reader = null;
                break;
            }
            default: {
                super.eUnsetFromID(featureID);
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.BOOK_ON_TAPE__AUTHOR: {
                return this._author != null;
            }
            case LibraryConstants.BOOK_ON_TAPE__READER: {
                return this._reader != null;
            }
            default: {
                return super.eIsSetFromID(featureID);
            }
        }
    }
}