// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EFactory, EStructuralFeature, EStructuralFeatureImpl, isEDataType } from "./internal.js"

export class EStructuralFeatureExt extends EStructuralFeatureImpl {
    private _defaultValue: any
    private _defaultValueFactory: EFactory
    constructor() {
        super()
    }

    // get the value of defaultValue
    getDefaultValue(): any {
        let eType = this.getEType()
        let defaultValueLiteral = this.getDefaultValueLiteral()
        if (eType && defaultValueLiteral.length == 0) {
            if (this.isMany) {
                return null
            } else {
                return eType.getDefaultValue()
            }
        } else if (isEDataType(eType)) {
            let factory = eType.getEPackage()?.getEFactoryInstance()
            if (factory && factory != this._defaultValueFactory) {
                if (eType.isSerializable) {
                    this._defaultValue = factory.createFromString(eType, defaultValueLiteral)
                }
                this._defaultValueFactory = factory
            }
            return this._defaultValue
        }
        return null
    }

    // set the value of defaultValue
    setDefaultValue(newDefaultValue: any) {
        let eType = this.getEType()
        if (isEDataType(eType)) {
            let factory = eType.getEPackage().getEFactoryInstance()
            let literal = factory.convertToString(eType, newDefaultValue)
            super.setDefaultValue(literal)
            this._defaultValueFactory = null // reset default value
        } else {
            throw new Error("Cannot serialize value to object without an EDataType eType")
        }
    }

    // set the value of defaultValueLiteral
    setDefaultValueLiteral(newDefaultValueLiteral: string) {
        this._defaultValueFactory = null // reset default value
        super.setDefaultValueLiteral(newDefaultValueLiteral)
    }

    get featureID(): number {
        return this._featureID
    }

    // set the value of featureID
    set featureID(newFeatureID: number) {
        this._featureID = newFeatureID
    }
}

export function isMapType(feature: EStructuralFeature): boolean {
    return feature.getEType() && feature.getEType().getInstanceTypeName() == "@masagroup/ecore/EMapEntry"
}

export function isEStructuralFeature(o: any): o is EStructuralFeature {
    return o == undefined ? undefined : "featureID" in o
}
