// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EFactory, EStructuralFeature, EStructuralFeatureImpl, isEDataType } from "./internal";

export class EStructuralFeatureExt extends EStructuralFeatureImpl {
    private _defaultValue: any;
    private _defaultValueFactory: EFactory;
    constructor() {
        super();
    }

    // get the value of defaultValue
    get defaultValue(): any {
        let eType = this.eType;
        let defaultValueLiteral = this.defaultValueLiteral;
        if (eType && defaultValueLiteral.length == 0) {
            if (this.isMany) {
                return null;
            } else {
                return eType.defaultValue;
            }
        } else if (isEDataType(eType)) {
            let factory = eType.ePackage?.eFactoryInstance;
            if (factory && factory != this._defaultValueFactory) {
                if (eType.isSerializable) {
                    this._defaultValue = factory.createFromString(eType, defaultValueLiteral);
                }
                this._defaultValueFactory = factory;
            }
            return this._defaultValue;
        }
        return null;
    }

    // set the value of defaultValue
    set defaultValue(newDefaultValue: any) {
        let eType = this.eType;
        if (isEDataType(eType)) {
            let factory = eType.ePackage.eFactoryInstance;
            let literal = factory.convertToString(eType, newDefaultValue);
            super.defaultValueLiteral = literal;
            this._defaultValueFactory = null; // reset default value
        } else {
            throw new Error("Cannot serialize value to object without an EDataType eType");
        }
    }

    get defaultValueLiteral(): string {
        return super.defaultValueLiteral;
    }

    // set the value of defaultValueLiteral
    set defaultValueLiteral(newDefaultValueLiteral: string) {
        this._defaultValueFactory = null; // reset default value
        super.defaultValueLiteral = newDefaultValueLiteral;
    }
}

export function isMapType(feature: EStructuralFeature): boolean {
    return feature.eType && feature.eType.instanceTypeName == "ecore.EMapEntry";
}

export function isEStructuralFeature(o: any): o is EStructuralFeature {
    return o == undefined ? undefined : "featureID" in o;
}
