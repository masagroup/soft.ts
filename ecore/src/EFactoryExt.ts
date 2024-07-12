// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { DynamicEObjectImpl, EClass, EDataType, EFactoryImpl, EObject, isEEnum } from "./internal.js"

export class EFactoryExt extends EFactoryImpl {
    constructor() {
        super()
    }

    create(eClass: EClass): EObject {
        if (this.ePackage != eClass.ePackage || eClass.isAbstract)
            throw new Error("The class '" + eClass.name + "' is not a valid classifier")
        let eObject = new DynamicEObjectImpl()
        eObject.setEClass(eClass)
        return eObject
    }

    // CreateFromString default implementation
    createFromString(eDataType: EDataType, literalValue: string): any {
        if (this.ePackage != eDataType.ePackage) {
            throw new Error("The datatype '" + eDataType.name + "' is not a valid classifier")
        }

        if (isEEnum(eDataType)) {
            let result = eDataType.getEEnumLiteralByLiteral(literalValue)
            if (!result) {
                throw new Error(
                    "The value '" + literalValue + "' is not a valid enumerator of '" + eDataType.name + "'"
                )
            }
            return result.value
        }

        switch (eDataType.instanceTypeName) {
            case "number":
                return Number(literalValue)
            case "boolean":
                return Boolean(literalValue)
            case "string":
                return literalValue
        }

        throw new Error("createFromString not implemented for '" + eDataType.name + "'")
    }

    convertToString(eDataType: EDataType, instanceValue: any): string {
        if (this.ePackage != eDataType.ePackage) {
            throw new Error("The datatype '" + eDataType.name + "' is not a valid classifier")
        }

        if (isEEnum(eDataType)) {
            let result = eDataType.getEEnumLiteralByValue(instanceValue)
            if (!result) {
                throw new Error(
                    "The value '" + instanceValue + "' is not a valid enumerator of '" + eDataType.name + "'"
                )
            }
            return result.literal
        }

        return instanceValue.toString()
    }
}
