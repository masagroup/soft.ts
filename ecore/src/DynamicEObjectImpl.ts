// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EClass,
    EDynamicProperties,
    EObjectImpl,
    EOperation,
    EStructuralFeature,
    getEcorePackage,
    isEAttribute,
    isEList,
    isSetList,
    NIL
} from "./internal.js"

function equalsDefault(value: any, defaultValue: any): boolean {
    if (value === defaultValue) return true
    if (value instanceof Date && defaultValue instanceof Date) return value.getTime() === defaultValue.getTime()
    if (value instanceof Uint8Array && defaultValue instanceof Uint8Array) {
        return value.length === defaultValue.length && value.every((b, i) => b === defaultValue[i])
    }
    return false
}

// isSetValue reports whether value, the value of feature, makes the feature set: as in EMF, a list
// that is not set (isSetList), and an attribute (not unsettable) set to its default value are not
// set; a feature set to null (NIL) is
export function isSetValue(feature: EStructuralFeature, value: any): boolean {
    if (value === null || value === undefined) return false
    if (value === NIL) return true
    if (isEList(value)) return isSetList(value)
    if (!isEAttribute(feature) || feature.isMany() || feature.isUnsettable()) return true
    return !equalsDefault(value, feature.getDefaultValue())
}

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

    // eDynamicKeepsNil tells that the properties keep NIL, the value of a feature set to null.
    eDynamicKeepsNil(): boolean {
        return true
    }

    eDynamicIsSet(dynamicFeatureID: number): boolean {
        const value = this._properties[dynamicFeatureID]
        return value != null && isSetValue(this.eClass().getEStructuralFeature(dynamicFeatureID), value)
    }

    eFeatureID(feature: EStructuralFeature): number {
        return this.eClass().getFeatureID(feature)
    }

    eOperationID(operation: EOperation): number {
        return this.eClass().getOperationID(operation)
    }

    resizeProperties(): void {
        resize(this._properties, this.eClass().getFeatureCount() - this.eStaticClass().getFeatureCount(), null)
    }
}
