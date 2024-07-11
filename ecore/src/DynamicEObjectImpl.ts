// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractEAdapter,
    EClass,
    EcoreConstants,
    EDynamicProperties,
    ENotification,
    EObjectImpl,
    EOperation,
    EStructuralFeature,
    EventType,
    getEcorePackage
} from "./internal.js"

function resize(arr: any[], newSize: number, defaultValue: any) {
    while (newSize > arr.length) arr.push(defaultValue)
    arr.length = newSize
}

export class DynamicEObjectImpl extends EObjectImpl implements EDynamicProperties {
    private _clz: EClass
    private _properties: any[]

    constructor() {
        super()
        this._clz = null
        this._properties = []
        this.resizeProperties()
    }

    eStaticClass(): EClass {
        return getEcorePackage().getEObject()
    }

    eStaticFeatureCount(): number {
        return 0
    }

    eClass(): EClass {
        return this._clz ? this._clz : this.eStaticClass()
    }

    setEClass(clz: EClass) {
        if (this._clz !== clz) {
            this._clz = clz
            this.resizeProperties()
        }
    }

    eDynamicProperties(): EDynamicProperties {
        return this
    }

    eDynamicGet(dynamicFeatureID: number): any {
        return this._properties[dynamicFeatureID]
    }
    eDynamicSet(dynamicFeatureID: number, newValue: any): void {
        this._properties[dynamicFeatureID] = newValue
    }
    eDynamicUnset(dynamicFeatureID: number): void {
        this._properties[dynamicFeatureID] = null
    }

    eFeatureID(feature: EStructuralFeature): number {
        return this._clz.getFeatureID(feature)
    }

    eOperationID(operation: EOperation): number {
        return this._clz.getOperationID(operation)
    }

    resizeProperties(): void {
        resize(this._properties, this.eClass().getFeatureCount() - this.eStaticClass().getFeatureCount(), null)
    }
}
