// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { DynamicEObjectImpl, EClass, EDataType, EFactoryImpl, EObject, EPackage, isEEnum } from "./internal.js"

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

// parseIntegerLiteral parses a decimal integer of bits bits (0: no limit), as go strconv.ParseInt and
// ParseUint do
function parseIntegerLiteral(literal: string, bits: number, unsigned: boolean, invalid: () => Error): bigint {
    if (!/^[+-]?\d+$/.test(literal) || (unsigned && literal.startsWith("-"))) throw invalid()
    const value = BigInt(literal)
    if (bits > 0) {
        const min = unsigned ? 0n : -(1n << BigInt(bits - 1))
        const max = unsigned ? (1n << BigInt(bits)) - 1n : (1n << BigInt(bits - 1)) - 1n
        if (value < min || value > max) throw invalid()
    }
    return value
}

// parseFloatLiteral parses a float as go strconv.ParseFloat does, NaN and infinities included
function parseFloatLiteral(literal: string, float32: boolean, invalid: () => Error): number {
    let value: number
    if (/^[+-]?(inf|infinity)$/i.test(literal)) {
        value = literal.startsWith("-") ? -Infinity : Infinity
    } else if (/^nan$/i.test(literal)) {
        value = NaN
    } else if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(literal)) {
        value = Number(literal)
        if (!isFinite(value) || (float32 && !isFinite(Math.fround(value)))) throw invalid()
    } else {
        throw invalid()
    }
    return value
}

export class EFactoryExt extends EFactoryImpl {
    private _sharedPackage: EPackage = null

    constructor() {
        super()
    }

    // setSharedEPackage makes ePackage the package of this factory without making this factory
    // the factory instance of ePackage: the factory of one implementation of a package shared
    // by several implementations, registered in a package registry (registerFactory)
    setSharedEPackage(ePackage: EPackage): void {
        this._sharedPackage = ePackage
    }

    getEPackage(): EPackage {
        return this._sharedPackage ?? super.getEPackage()
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

        // an invalid literal throws, as EMF and go do: it does not become a zero value silently
        const invalid = (): Error => new Error(`the value '${literalValue}' is not a valid literal of '${eDataType.getName()}'`)
        const typeName = getInstanceTypeName(eDataType)
        switch (typeName) {
            case "number":
            case "float64":
            case "java.lang.Double":
            case "double":
                return parseFloatLiteral(literalValue, false, invalid)
            case "float32":
            case "java.lang.Float":
            case "float":
                return parseFloatLiteral(literalValue, true, invalid)
            case "int":
            case "java.lang.Integer":
                return Number(parseIntegerLiteral(literalValue, 64, false, invalid))
            case "int32":
                return Number(parseIntegerLiteral(literalValue, 32, false, invalid))
            case "int16":
            case "java.lang.Short":
            case "short":
                return Number(parseIntegerLiteral(literalValue, 16, false, invalid))
            case "int8":
                return Number(parseIntegerLiteral(literalValue, 8, false, invalid))
            case "byte":
                return Number(parseIntegerLiteral(literalValue, 8, true, invalid))
            case "uint64":
            case "com.google.common.primitives.UnsignedLong":
                return parseIntegerLiteral(literalValue, 64, true, invalid)
            case "int64":
            case "java.lang.Long":
            case "long":
                return parseIntegerLiteral(literalValue, 64, false, invalid)
            case "bigint":
            case "BigInt":
            case "java.math.BigInteger":
                return parseIntegerLiteral(literalValue, 0, false, invalid)
            case "boolean":
            case "bool":
            case "java.lang.Boolean":
                // the literals of go strconv.ParseBool
                switch (literalValue) {
                    case "1":
                    case "t":
                    case "T":
                    case "TRUE":
                    case "true":
                    case "True":
                        return true
                    case "0":
                    case "f":
                    case "F":
                    case "FALSE":
                    case "false":
                    case "False":
                        return false
                }
                throw invalid()
            case "string":
            case "java.lang.String":
                return literalValue
            case "Date":
            case "java.util.Date":
            case "EDate": {
                const date = new Date(literalValue)
                if (isNaN(date.getTime())) throw invalid()
                return date
            }
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
