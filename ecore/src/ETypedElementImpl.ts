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
    EClass,
    EClassifier,
    ENamedElementImpl,
    ETypedElement,
    EcoreConstants,
    EventType,
    Notification,
    getEcorePackage
} from "./internal.js"

export class ETypedElementImpl extends ENamedElementImpl implements ETypedElement {
    protected _lowerBound: number
    protected _isOrdered: boolean
    protected _eType: EClassifier
    protected _upperBound: number
    protected _isUnique: boolean

    constructor() {
        super()
        this._eType = null
        this._isOrdered = true
        this._isUnique = true
        this._lowerBound = 0
        this._upperBound = 1
    }

    eStaticClass(): EClass {
        return getEcorePackage().getETypedElement()
    }

    // get the value of eType
    getEType(): EClassifier {
        if (this._eType != null && this._eType.eIsProxy()) {
            const oldEType = this._eType
            const newEType = this.eResolveProxy(oldEType) as EClassifier
            this._eType = newEType
            if (newEType != oldEType) {
                if (this.eNotificationRequired()) {
                    this.eNotify(new Notification(this, EventType.RESOLVE, EcoreConstants.ETYPED_ELEMENT__ETYPE, oldEType, newEType))
                }
            }
        }
        return this._eType
    }

    // get the value of eType asynchronously
    async getETypeAsync(): Promise<EClassifier> {
        if (this._eType != null && this._eType.eIsProxy()) {
            const oldEType = this._eType
            const newEType = (await this.eResolveProxyAsync(oldEType)) as EClassifier
            this._eType = newEType
            if (newEType != oldEType) {
                if (this.eNotificationRequired()) {
                    this.eNotify(new Notification(this, EventType.RESOLVE, EcoreConstants.ETYPED_ELEMENT__ETYPE, oldEType, newEType))
                }
            }
        }
        return this._eType
    }

    // set the value of eType
    setEType(newEType: EClassifier): void {
        const oldEType = this._eType
        this._eType = newEType
        if (this.eNotificationRequired()) {
            this.eNotify(new Notification(this, EventType.SET, EcoreConstants.ETYPED_ELEMENT__ETYPE, oldEType, newEType))
        }
    }

    // unSetEType unset the value of _eType
    unSetEType(): void {
        if (this.eNotificationRequired()) {
            this.eNotify(new Notification(this, EventType.UNSET, EcoreConstants.ETYPED_ELEMENT__ETYPE, null, null))
        }
    }

    // get the basic value of eType with no proxy resolution
    basicGetEType(): EClassifier {
        return this._eType
    }

    // get the value of many
    isMany(): boolean {
        throw new Error("isMany not implemented")
    }

    // get the value of ordered
    isOrdered(): boolean {
        return this._isOrdered
    }

    // set the value of ordered
    setOrdered(newOrdered: boolean): void {
        const oldOrdered = this._isOrdered
        this._isOrdered = newOrdered
        if (this.eNotificationRequired()) {
            this.eNotify(new Notification(this, EventType.SET, EcoreConstants.ETYPED_ELEMENT__ORDERED, oldOrdered, newOrdered))
        }
    }

    // get the value of required
    isRequired(): boolean {
        throw new Error("isRequired not implemented")
    }

    // get the value of unique
    isUnique(): boolean {
        return this._isUnique
    }

    // set the value of unique
    setUnique(newUnique: boolean): void {
        const oldUnique = this._isUnique
        this._isUnique = newUnique
        if (this.eNotificationRequired()) {
            this.eNotify(new Notification(this, EventType.SET, EcoreConstants.ETYPED_ELEMENT__UNIQUE, oldUnique, newUnique))
        }
    }

    // get the value of lowerBound
    getLowerBound(): number {
        return this._lowerBound
    }

    // set the value of lowerBound
    setLowerBound(newLowerBound: number): void {
        const oldLowerBound = this._lowerBound
        this._lowerBound = newLowerBound
        if (this.eNotificationRequired()) {
            this.eNotify(new Notification(this, EventType.SET, EcoreConstants.ETYPED_ELEMENT__LOWER_BOUND, oldLowerBound, newLowerBound))
        }
    }

    // get the value of upperBound
    getUpperBound(): number {
        return this._upperBound
    }

    // set the value of upperBound
    setUpperBound(newUpperBound: number): void {
        const oldUpperBound = this._upperBound
        this._upperBound = newUpperBound
        if (this.eNotificationRequired()) {
            this.eNotify(new Notification(this, EventType.SET, EcoreConstants.ETYPED_ELEMENT__UPPER_BOUND, oldUpperBound, newUpperBound))
        }
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case EcoreConstants.ETYPED_ELEMENT__ETYPE: {
                return resolve ? this.getEType() : this.basicGetEType()
            }
            case EcoreConstants.ETYPED_ELEMENT__LOWER_BOUND: {
                return this.getLowerBound()
            }
            case EcoreConstants.ETYPED_ELEMENT__MANY: {
                return this.isMany()
            }
            case EcoreConstants.ETYPED_ELEMENT__ORDERED: {
                return this.isOrdered()
            }
            case EcoreConstants.ETYPED_ELEMENT__REQUIRED: {
                return this.isRequired()
            }
            case EcoreConstants.ETYPED_ELEMENT__UNIQUE: {
                return this.isUnique()
            }
            case EcoreConstants.ETYPED_ELEMENT__UPPER_BOUND: {
                return this.getUpperBound()
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    async eGetFromIDAsync(featureID: number, resolve: boolean): Promise<any> {
        if (resolve) {
            switch (featureID) {
                case EcoreConstants.ETYPED_ELEMENT__ETYPE:
                    return this.getETypeAsync()
            }
        }
        return this.eGetFromID(featureID, resolve)
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case EcoreConstants.ETYPED_ELEMENT__ETYPE: {
                this.setEType(newValue as EClassifier)
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__LOWER_BOUND: {
                this.setLowerBound(newValue as number)
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__ORDERED: {
                this.setOrdered(newValue as boolean)
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__UNIQUE: {
                this.setUnique(newValue as boolean)
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__UPPER_BOUND: {
                this.setUpperBound(newValue as number)
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case EcoreConstants.ETYPED_ELEMENT__ETYPE: {
                this.unSetEType()
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__LOWER_BOUND: {
                this.setLowerBound(0)
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__ORDERED: {
                this.setOrdered(true)
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__UNIQUE: {
                this.setUnique(true)
                break
            }
            case EcoreConstants.ETYPED_ELEMENT__UPPER_BOUND: {
                this.setUpperBound(1)
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case EcoreConstants.ETYPED_ELEMENT__ETYPE: {
                return this._eType != null
            }
            case EcoreConstants.ETYPED_ELEMENT__LOWER_BOUND: {
                return this._lowerBound != 0
            }
            case EcoreConstants.ETYPED_ELEMENT__MANY: {
                return this.isMany() != false
            }
            case EcoreConstants.ETYPED_ELEMENT__ORDERED: {
                return this._isOrdered != true
            }
            case EcoreConstants.ETYPED_ELEMENT__REQUIRED: {
                return this.isRequired() != false
            }
            case EcoreConstants.ETYPED_ELEMENT__UNIQUE: {
                return this._isUnique != true
            }
            case EcoreConstants.ETYPED_ELEMENT__UPPER_BOUND: {
                return this._upperBound != 1
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }
}
