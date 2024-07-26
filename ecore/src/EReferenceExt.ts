// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClass, EReference, EReferenceImpl, EStructuralFeature, isEClass } from "./internal.js"

export function isEReference(s: EStructuralFeature): s is EReference {
    return s == undefined ? undefined : "getEReferenceType" in s
}

export function isContainer(feature: EStructuralFeature): boolean {
    return isEReference(feature) && feature.getEOpposite() && feature.getEOpposite().isContainment()
}

export function isBidirectional(feature: EStructuralFeature): boolean {
    return isEReference(feature) && feature.getEOpposite() != null
}

export function isContains(feature: EStructuralFeature): boolean {
    return isEReference(feature) && feature.isContainment()
}

export function isProxy(feature: EStructuralFeature): boolean {
    return isEReference(feature) ? feature.isResolveProxies() : false
}

export class EReferenceExt extends EReferenceImpl {
    private _referenceType: EClass

    constructor() {
        super()
    }

    isContainer(): boolean {
        return this.getEOpposite() && this.getEOpposite().isContainment()
    }

    // get the value of eReferenceType
    getEReferenceType(): EClass {
        if (!this._referenceType || this._referenceType.eIsProxy()) {
            const eType = this.getEType()
            if (isEClass(eType)) {
                this._referenceType = eType
            }
        }
        return this._referenceType
    }

    // get the basic value of eReferenceType with no proxy resolution
    basicGetEReferenceType(): EClass {
        if (!this._referenceType) {
            const eType = this.basicGetEType()
            if (isEClass(eType)) {
                this._referenceType = eType
            }
        }
        return this._referenceType
    }
}
