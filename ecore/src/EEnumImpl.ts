// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    BasicEDataTypeList,
    BasicEList,
    BasicEObjectList,
    EClass,
    EDataType,
    EDataTypeExt,
    EEnum,
    EEnumLiteral,
    EList,
    ENotificationChain,
    ENotifyingList,
    EObject,
    EObjectInternal,
    EcoreConstants,
    getEcorePackage,
    isEObjectInternal,
    isEObjectList,
} from "./internal"

export class EEnumImpl extends EDataTypeExt implements EEnum {
    protected _eLiterals: EList<EEnumLiteral>

    constructor() {
        super()
        this._eLiterals = null
    }

    eStaticClass(): EClass {
        return getEcorePackage().getEEnum()
    }

    // get the value of eLiterals
    get eLiterals(): EList<EEnumLiteral> {
        if (this._eLiterals == null) {
            this._eLiterals = this.initELiterals()
        }
        return this._eLiterals
    }

    // getEEnumLiteralByLiteral default implementation
    getEEnumLiteralByLiteral(literal: string): EEnumLiteral {
        throw new Error("getEEnumLiteralByLiteral not implemented")
    }

    // getEEnumLiteralByName default implementation
    getEEnumLiteralByName(name: string): EEnumLiteral {
        throw new Error("getEEnumLiteralByName not implemented")
    }

    // getEEnumLiteralByValue default implementation
    getEEnumLiteralByValue(value: number): EEnumLiteral {
        throw new Error("getEEnumLiteralByValue not implemented")
    }

    protected initELiterals(): EList<EEnumLiteral> {
        return new BasicEObjectList<EEnumLiteral>(
            this,
            EcoreConstants.EENUM__ELITERALS,
            EcoreConstants.EENUM_LITERAL__EENUM,
            true,
            true,
            true,
            false,
            false,
        )
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case EcoreConstants.EENUM__ELITERALS: {
                return this.eLiterals
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case EcoreConstants.EENUM__ELITERALS: {
                this.eLiterals.clear()
                this.eLiterals.addAll(newValue as EList<EEnumLiteral>)
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case EcoreConstants.EENUM__ELITERALS: {
                this.eLiterals.clear()
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case EcoreConstants.EENUM__ELITERALS: {
                return this.eLiterals != null && this.eLiterals.size() != 0
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }

    eInvokeFromID(operationID: number, args: EList<any>): any {
        switch (operationID) {
            case EcoreConstants.EENUM__GET_EENUM_LITERAL_BY_LITERAL_ESTRING: {
                return this.getEEnumLiteralByLiteral(args.get(0) as string)
            }
            case EcoreConstants.EENUM__GET_EENUM_LITERAL_ESTRING: {
                return this.getEEnumLiteralByName(args.get(0) as string)
            }
            case EcoreConstants.EENUM__GET_EENUM_LITERAL_EINT: {
                return this.getEEnumLiteralByValue(args.get(0) as number)
            }
            default: {
                return super.eInvokeFromID(operationID, args)
            }
        }
    }

    eBasicInverseAdd(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain {
        switch (featureID) {
            case EcoreConstants.EENUM__ELITERALS: {
                let list = this.eLiterals as ENotifyingList<EEnumLiteral>
                let end = otherEnd as EEnumLiteral
                return list.addWithNotification(end, notifications)
            }
            default: {
                return super.eBasicInverseAdd(otherEnd, featureID, notifications)
            }
        }
    }

    eBasicInverseRemove(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain {
        switch (featureID) {
            case EcoreConstants.EENUM__ELITERALS: {
                let list = this.eLiterals as ENotifyingList<EEnumLiteral>
                let end = otherEnd as EEnumLiteral
                return list.removeWithNotification(end, notifications)
            }
            default: {
                return super.eBasicInverseRemove(otherEnd, featureID, notifications)
            }
        }
    }
}
