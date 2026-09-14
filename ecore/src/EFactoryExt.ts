// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { DynamicEObjectImpl, EClass, EDataType, EFactoryImpl, EObject, isEEnum } from "./internal.js"

function getInstanceTypeName(eDataType: EDataType): string {
    const eAnnotation =
        eDataType.getEAnnotation("http://net.masagroup/soft/2020/GenTS") || eDataType.getEAnnotation("http://net.masagroup/soft/2019/GenGo")
    if (eAnnotation != null) {
        const typeName = eAnnotation.getDetails().getValue("instanceTypeName")
        if (typeName) {
            return typeName
        }
    }
    return eDataType.getInstanceTypeName() || ""
}

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
                throw new Error("The value '" + literalValue + "' is not a valid enumerator of '" + eDataType.getName() + "'")
            }
            return result.getValue()
        }

        const typeName = getInstanceTypeName(eDataType)
        switch (typeName) {
            case "number":
            case "float64":
            case "java.lang.Double":
            case "double":
            case "float32":
            case "java.lang.Float":
            case "float":
            case "int":
            case "java.lang.Integer":
            case "int32":
            case "int16":
            case "java.lang.Short":
            case "short":
            case "int8":
            case "byte":
                return Number(literalValue)
            case "uint64":
            case "com.google.common.primitives.UnsignedLong":
            case "int64":
            case "java.lang.Long":
            case "long":
            case "bigint":
            case "BigInt":
            case "java.math.BigInteger":
                try {
                    return BigInt(literalValue)
                } catch {
                    return Number(literalValue)
                }
            case "boolean":
            case "bool":
            case "java.lang.Boolean": {
                const lower = literalValue ? literalValue.toLowerCase() : ""
                return lower === "true" || lower === "1"
            }
            case "string":
            case "java.lang.String":
                return literalValue
            case "Date":
            case "java.util.Date":
            case "EDate":
                return new Date(literalValue)
            case "byte[]":
            case "[]byte":
            case "Uint8Array":
                return new TextEncoder().encode(literalValue)
        }

        throw new Error("createFromString not implemented for '" + eDataType.getName() + "'")
    }

    convertToString(eDataType: EDataType, instanceValue: any): string {
        if (this.getEPackage() != eDataType.getEPackage()) {
            throw new Error("The datatype '" + eDataType.getName() + "' is not a valid classifier")
        }

        if (instanceValue == null) {
            return ""
        }

        if (isEEnum(eDataType)) {
            const result = eDataType.getEEnumLiteralByValue(instanceValue)
            if (!result) {
                throw new Error("The value '" + instanceValue + "' is not a valid enumerator of '" + eDataType.getName() + "'")
            }
            return result.getLiteral()
        }

        const typeName = getInstanceTypeName(eDataType)
        switch (typeName) {
            case "boolean":
            case "bool":
            case "java.lang.Boolean":
                return instanceValue ? "true" : "false"
            case "Date":
            case "java.util.Date":
            case "EDate":
                return instanceValue instanceof Date ? instanceValue.toISOString() : new Date(instanceValue).toISOString()
            case "byte[]":
            case "[]byte":
            case "Uint8Array":
                if (instanceValue instanceof Uint8Array) {
                    return new TextDecoder().decode(instanceValue)
                }
                break
        }

        return instanceValue.toString()
    }
}
