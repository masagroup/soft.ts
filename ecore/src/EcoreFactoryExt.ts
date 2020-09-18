// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2019 MASA Group
//
// *****************************************************************************

import { EcoreFactoryImpl } from "./EcoreFactoryImpl";
import { EDataType } from "./EDataType";

export class EcoreFactoryExt extends EcoreFactoryImpl {
    private static _instanceExt: EcoreFactoryExt = null;

    public static getInstance(): EcoreFactoryExt {
        if (this._instanceExt == null) {
            this._instanceExt = new EcoreFactoryExt();
        }
        return this._instanceExt;
    }

    protected constructor() {
        super();
    }

    createEBooleanFromString(eDataType: EDataType, literalValue: string): any {
        return Boolean(literalValue);
    }

    convertEBooleanToString(eDataType: EDataType, instanceValue: any): string {
        return instanceValue.toString();
    }

    createECharFromString(eDataType: EDataType, literalValue: string): any {
        return literalValue.charCodeAt(0);
    }

    convertECharToString(eDataType: EDataType, instanceValue: any): string {
        return String.fromCharCode(instanceValue);
    }

    createEDateFromString(eDataType: EDataType, literalValue: string): any {
        return new Date(literalValue);
    }

    convertEDateToString(eDataType: EDataType, instanceValue: any): string {
        return (instanceValue as Date).toISOString();
    }

    createEDoubleFromString(eDataType: EDataType, literalValue: string): any {
        return Number(literalValue);
    }

    convertEDoubleToString(eDataType: EDataType, instanceValue: any): string {
        return instanceValue.toString();
    }

    createEFloatFromString(eDataType: EDataType, literalValue: string): any {
        return Number(literalValue);
    }

    convertEFloatToString(eDataType: EDataType, instanceValue: any): string {
        return instanceValue.toString();
    }

    createEIntFromString(eDataType: EDataType, literalValue: string): any {
        return Number(literalValue);
    }

    convertEIntToString(eDataType: EDataType, instanceValue: any): string {
        return instanceValue.toString();
    }

    createELongFromString(eDataType: EDataType, literalValue: string): any {
        return Number(literalValue);
    }

    convertELongToString(eDataType: EDataType, instanceValue: any): string {
        return instanceValue.toString();
    }

    createEShortFromString(eDataType: EDataType, literalValue: string): any {
        return Number(literalValue);
    }

    convertEShortToString(eDataType: EDataType, instanceValue: any): string {
        return instanceValue.toString();
    }

    createEStringFromString(eDataType: EDataType, literalValue: string): any {
        return literalValue;
    }

    convertEStringToString(eDataType: EDataType, instanceValue: any): string {
        return instanceValue.toString();
    }
}
