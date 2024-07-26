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
        if (this.getEPackage() != eClass.getEPackage() || eClass.isAbstract())
            throw new Error("The class '" + eClass.getName() + "' is not a valid classifier")
        const eObject = new DynamicEObjectImpl()
        eObject.setEClass(eClass)
        return eObject
    }

    // CreateFromString default implementation
    createFromString(eDataType: EDataType, literalValue: string): any {
        if (this.getEPackage() != eDataType.getEPackage()) {
            throw new Error("The datatype '" + eDataType.getName() + "' is not a valid classifier")
        }

        if (isEEnum(eDataType)) {
            const result = eDataType.getEEnumLiteralByLiteral(literalValue)
            if (!result) {
                throw new Error(
                    "The value '" + literalValue + "' is not a valid enumerator of '" + eDataType.getName() + "'"
                )
            }
            return result.getValue()
        }

        switch (eDataType.getInstanceTypeName()) {
            case "number":
                return Number(literalValue)
            case "boolean":
                return Boolean(literalValue)
            case "string":
                return literalValue
        }

        throw new Error("createFromString not implemented for '" + eDataType.getName() + "'")
    }

    convertToString(eDataType: EDataType, instanceValue: any): string {
        if (this.getEPackage() != eDataType.getEPackage()) {
            throw new Error("The datatype '" + eDataType.getName() + "' is not a valid classifier")
        }

        if (isEEnum(eDataType)) {
            const result = eDataType.getEEnumLiteralByValue(instanceValue)
            if (!result) {
                throw new Error(
                    "The value '" + instanceValue + "' is not a valid enumerator of '" + eDataType.getName() + "'"
                )
            }
            return result.getLiteral()
        }

        return instanceValue.toString()
    }
}
