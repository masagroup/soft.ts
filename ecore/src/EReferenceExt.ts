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
    return "eReferenceType" in s
}

export function isContainer(feature: EStructuralFeature): boolean {
    return isEReference(feature) && feature.eOpposite && feature.eOpposite.isContainment
}

export function isBidirectional(feature: EStructuralFeature): boolean {
    return isEReference(feature) && feature.eOpposite != null
}

export function isContains(feature: EStructuralFeature): boolean {
    return isEReference(feature) && feature.isContainment
}

export function isProxy(feature: EStructuralFeature): boolean {
    return isEReference(feature) ? feature.isResolveProxies : false
}

export class EReferenceExt extends EReferenceImpl {
    private _referenceType: EClass

    constructor() {
        super()
    }

    get isContainer(): boolean {
        return this.eOpposite && this.eOpposite.isContainment
    }

    // get the value of eReferenceType
    get eReferenceType(): EClass {
        if (!this._referenceType || this._referenceType.eIsProxy()) {
            let eType = this.eType
            if (isEClass(eType)) {
                this._referenceType = eType
            }
        }
        return this._referenceType
    }

    // get the basic value of eReferenceType with no proxy resolution
    basicGetEReferenceType(): EClass {
        if (!this._referenceType) {
            let eType = this.basicGetEType()
            if (isEClass(eType)) {
                this._referenceType = eType
            }
        }
        return this._referenceType
    }
}
