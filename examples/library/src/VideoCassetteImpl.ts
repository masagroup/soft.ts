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
    AudioVisualItem,
    AudioVisualItemImpl,
    LibraryConstants,
    Person,
    VideoCassette,
    getLibraryPackage
} from "./internal.js"

export class VideoCassetteImpl extends AudioVisualItemImpl implements VideoCassette {
    protected _cast: ecore.EList<Person>

    constructor() {
        super()
        this._cast = null
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getVideoCassette()
    }

    // get the value of cast
    get cast(): ecore.EList<Person> {
        return this.getCast()
    }

    // set the value of cast
    set cast(newCast: ecore.EList<Person>) {
        const l = this.getCast()
        l.clear()
        l.addAll(newCast)
    }

    // get the value of cast
    getCast(): ecore.EList<Person> {
        if (this._cast == null) {
            this._cast = new ecore.BasicEObjectList<Person>(
                this,
                LibraryConstants.VIDEO_CASSETTE__CAST,
                -1,
                false,
                false,
                false,
                true,
                false
            )
        }
        return this._cast
    }

    // set the value of cast
    setCast(newCast: ecore.EList<Person>) {
        const l = this.getCast()
        l.clear()
        l.addAll(newCast)
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.VIDEO_CASSETTE__CAST: {
                const list = this.getCast()
                return !resolve && ecore.isEObjectList(list) ? list.getUnResolvedList() : list
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    async eGetFromIDAsync(featureID: number, resolve: boolean): Promise<any> {
        return this.eGetFromID(featureID, resolve)
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case LibraryConstants.VIDEO_CASSETTE__CAST: {
                const list = this.getCast()
                list.clear()
                list.addAll(newValue as ecore.EList<Person>)
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.VIDEO_CASSETTE__CAST: {
                this.getCast().clear()
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.VIDEO_CASSETTE__CAST: {
                return this._cast && !this._cast.isEmpty()
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }
}
