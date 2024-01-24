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
import { BookIndex, LibraryConstants, getLibraryPackage } from "./internal"

export class BookIndexImpl extends ecore.EObjectImpl implements BookIndex {
    protected _key: string
    protected _value: ecore.EList<number>

    constructor() {
        super()
        this._key = ""
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getBookIndex()
    }

    // get the value of key
    get key(): string {
        return this._key
    }

    // set the value of key
    set key(newKey: string) {
        let oldKey = this._key
        this._key = newKey
        if (this.eNotificationRequired) {
            this.eNotify(
                new ecore.Notification(this, ecore.EventType.SET, LibraryConstants.BOOK_INDEX__KEY, oldKey, newKey)
            )
        }
    }

    // get the value of value
    get value(): ecore.EList<number> {
        if (this._value == null) {
            this._value = new ecore.BasicEDataTypeList<number>(this, LibraryConstants.BOOK_INDEX__VALUE)
        }
        return this._value
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.BOOK_INDEX__KEY: {
                return this.key
            }
            case LibraryConstants.BOOK_INDEX__VALUE: {
                return this.value
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case LibraryConstants.BOOK_INDEX__KEY: {
                this.key = newValue as string
                break
            }
            case LibraryConstants.BOOK_INDEX__VALUE: {
                this.value.clear()
                this.value.addAll(newValue as ecore.EList<number>)
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.BOOK_INDEX__KEY: {
                this.key = ""
                break
            }
            case LibraryConstants.BOOK_INDEX__VALUE: {
                this.value.clear()
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.BOOK_INDEX__KEY: {
                return this._key != ""
            }
            case LibraryConstants.BOOK_INDEX__VALUE: {
                return this.value != null && this.value.size() != 0
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }
}
