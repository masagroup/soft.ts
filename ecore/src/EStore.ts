// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { Collection, EObject, EStructuralFeature } from "./internal.js"

// EStore holds the feature values of the objects it is set on: an object reads and writes its
// features through its store instead of fields of its own.
export interface EStore {
    addRoot(object: EObject): void

    removeRoot(object: EObject): void

    get(object: EObject, feature: EStructuralFeature, index: number): any

    set(object: EObject, feature: EStructuralFeature, index: number, value: any, needResult: boolean): any

    isSet(object: EObject, feature: EStructuralFeature): boolean

    unSet(object: EObject, feature: EStructuralFeature): void

    isEmpty(object: EObject, feature: EStructuralFeature): boolean

    size(object: EObject, feature: EStructuralFeature): number

    contains(object: EObject, feature: EStructuralFeature, value: any): boolean

    indexOf(object: EObject, feature: EStructuralFeature, value: any): number

    lastIndexOf(object: EObject, feature: EStructuralFeature, value: any): number

    add(object: EObject, feature: EStructuralFeature, index: number, value: any): void

    addAll(object: EObject, feature: EStructuralFeature, index: number, collection: Collection<any>): void

    remove(object: EObject, feature: EStructuralFeature, index: number, needResult: boolean): any

    move(object: EObject, feature: EStructuralFeature, sourceIndex: number, targetIndex: number, needResult: boolean): any

    clear(object: EObject, feature: EStructuralFeature): void

    setContainer(object: EObject, container: EObject, feature: EStructuralFeature): void

    getContainer(object: EObject): [EObject, EStructuralFeature]

    toArray(object: EObject, feature: EStructuralFeature): any[]
}

export interface EStoreProvider {
    setEStore(store: EStore): void

    getEStore(): EStore
}

export function isEStoreProvider(o: any): o is EStoreProvider {
    return typeof o === "object" && o !== null && "getEStore" in o && "setEStore" in o
}

export interface ECacheProvider {
    // setCache sets whether the object caches its feature values
    setCache(cache: boolean): void

    // isCache returns whether the object caches its feature values
    isCache(): boolean
}

export function isECacheProvider(o: any): o is ECacheProvider {
    return typeof o === "object" && o !== null && "setCache" in o && "isCache" in o
}
