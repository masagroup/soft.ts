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
    EClassifier,
    EGenericType,
    EList,
    ENotification,
    ENotificationChain,
    ENotifyingList,
    EOPPOSITE_FEATURE_BASE,
    EObject,
    EObjectImpl,
    EObjectInternal,
    ETypeParameter,
    EcoreConstants,
    EventType,
    Notification,
    getEcorePackage,
    isEObjectInternal,
    isEObjectList,
} from "./internal"

export class EGenericTypeImpl extends EObjectImpl implements EGenericType {
    protected _eTypeArguments: EList<EGenericType>
    protected _eUpperBound: EGenericType
    protected _eClassifier: EClassifier
    protected _eRawType: EClassifier
    protected _eLowerBound: EGenericType
    protected _eTypeParameter: ETypeParameter

    constructor() {
        super()
        this._eClassifier = null
        this._eLowerBound = null
        this._eRawType = null
        this._eTypeArguments = null
        this._eTypeParameter = null
        this._eUpperBound = null
    }

    eStaticClass(): EClass {
        return getEcorePackage().getEGenericType()
    }

    // get the value of eClassifier
    get eClassifier(): EClassifier {
        if (this._eClassifier != null && this._eClassifier.eIsProxy()) {
            let oldEClassifier = this._eClassifier
            let newEClassifier = this.eResolveProxy(oldEClassifier) as EClassifier
            this._eClassifier = newEClassifier
            if (newEClassifier != oldEClassifier) {
                if (this.eNotificationRequired) {
                    this.eNotify(
                        new Notification(
                            this,
                            EventType.RESOLVE,
                            EcoreConstants.EGENERIC_TYPE__ECLASSIFIER,
                            oldEClassifier,
                            newEClassifier,
                        ),
                    )
                }
            }
        }
        return this._eClassifier
    }

    // set the value of eClassifier
    set eClassifier(newEClassifier: EClassifier) {
        let oldEClassifier = this._eClassifier
        this._eClassifier = newEClassifier
        if (this.eNotificationRequired) {
            this.eNotify(
                new Notification(
                    this,
                    EventType.SET,
                    EcoreConstants.EGENERIC_TYPE__ECLASSIFIER,
                    oldEClassifier,
                    newEClassifier,
                ),
            )
        }
    }

    // get the basic value of eClassifier with no proxy resolution
    basicGetEClassifier(): EClassifier {
        return this._eClassifier
    }

    // get the value of eLowerBound
    get eLowerBound(): EGenericType {
        return this._eLowerBound
    }

    // set the value of eLowerBound
    set eLowerBound(newELowerBound: EGenericType) {
        let oldELowerBound = this._eLowerBound
        if (newELowerBound != oldELowerBound) {
            let notifications: ENotificationChain = null
            if (isEObjectInternal(oldELowerBound)) {
                notifications = oldELowerBound.eInverseRemove(
                    this,
                    EOPPOSITE_FEATURE_BASE - EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND,
                    notifications,
                )
            }
            if (isEObjectInternal(newELowerBound)) {
                notifications = newELowerBound.eInverseAdd(
                    this,
                    EOPPOSITE_FEATURE_BASE - EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND,
                    notifications,
                )
            }
            notifications = this.basicSetELowerBound(newELowerBound, notifications)
            if (notifications != null) {
                notifications.dispatch()
            }
        }
    }

    basicSetELowerBound(newELowerBound: EGenericType, msgs: ENotificationChain): ENotificationChain {
        let oldELowerBound = this._eLowerBound
        this._eLowerBound = newELowerBound
        let notifications = msgs
        if (this.eNotificationRequired) {
            let notification = new Notification(
                this,
                EventType.SET,
                EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND,
                oldELowerBound,
                newELowerBound,
            )
            if (notifications != null) {
                notifications.add(notification)
            } else {
                notifications = notification
            }
        }
        return notifications
    }

    // get the value of eRawType
    get eRawType(): EClassifier {
        if (this._eRawType != null && this._eRawType.eIsProxy()) {
            let oldERawType = this._eRawType
            let newERawType = this.eResolveProxy(oldERawType) as EClassifier
            this._eRawType = newERawType
            if (newERawType != oldERawType) {
                if (this.eNotificationRequired) {
                    this.eNotify(
                        new Notification(
                            this,
                            EventType.RESOLVE,
                            EcoreConstants.EGENERIC_TYPE__ERAW_TYPE,
                            oldERawType,
                            newERawType,
                        ),
                    )
                }
            }
        }
        return this._eRawType
    }

    /** @internal */
    set eRawType(newERawType: EClassifier) {
        this._eRawType = newERawType
    }

    // get the basic value of eRawType with no proxy resolution
    basicGetERawType(): EClassifier {
        return this._eRawType
    }

    // get the value of eTypeArguments
    get eTypeArguments(): EList<EGenericType> {
        if (this._eTypeArguments == null) {
            this._eTypeArguments = this.initETypeArguments()
        }
        return this._eTypeArguments
    }

    // get the value of eTypeParameter
    get eTypeParameter(): ETypeParameter {
        return this._eTypeParameter
    }

    // set the value of eTypeParameter
    set eTypeParameter(newETypeParameter: ETypeParameter) {
        let oldETypeParameter = this._eTypeParameter
        this._eTypeParameter = newETypeParameter
        if (this.eNotificationRequired) {
            this.eNotify(
                new Notification(
                    this,
                    EventType.SET,
                    EcoreConstants.EGENERIC_TYPE__ETYPE_PARAMETER,
                    oldETypeParameter,
                    newETypeParameter,
                ),
            )
        }
    }

    // get the value of eUpperBound
    get eUpperBound(): EGenericType {
        return this._eUpperBound
    }

    // set the value of eUpperBound
    set eUpperBound(newEUpperBound: EGenericType) {
        let oldEUpperBound = this._eUpperBound
        if (newEUpperBound != oldEUpperBound) {
            let notifications: ENotificationChain = null
            if (isEObjectInternal(oldEUpperBound)) {
                notifications = oldEUpperBound.eInverseRemove(
                    this,
                    EOPPOSITE_FEATURE_BASE - EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND,
                    notifications,
                )
            }
            if (isEObjectInternal(newEUpperBound)) {
                notifications = newEUpperBound.eInverseAdd(
                    this,
                    EOPPOSITE_FEATURE_BASE - EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND,
                    notifications,
                )
            }
            notifications = this.basicSetEUpperBound(newEUpperBound, notifications)
            if (notifications != null) {
                notifications.dispatch()
            }
        }
    }

    basicSetEUpperBound(newEUpperBound: EGenericType, msgs: ENotificationChain): ENotificationChain {
        let oldEUpperBound = this._eUpperBound
        this._eUpperBound = newEUpperBound
        let notifications = msgs
        if (this.eNotificationRequired) {
            let notification = new Notification(
                this,
                EventType.SET,
                EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND,
                oldEUpperBound,
                newEUpperBound,
            )
            if (notifications != null) {
                notifications.add(notification)
            } else {
                notifications = notification
            }
        }
        return notifications
    }

    // isInstance default implementation
    isInstance(object: any): boolean {
        throw new Error("isInstance not implemented")
    }

    protected initETypeArguments(): EList<EGenericType> {
        return new BasicEObjectList<EGenericType>(
            this,
            EcoreConstants.EGENERIC_TYPE__ETYPE_ARGUMENTS,
            -1,
            true,
            true,
            false,
            false,
            false,
        )
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case EcoreConstants.EGENERIC_TYPE__ECLASSIFIER: {
                return resolve ? this.eClassifier : this.basicGetEClassifier()
            }
            case EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND: {
                return this.eLowerBound
            }
            case EcoreConstants.EGENERIC_TYPE__ERAW_TYPE: {
                return resolve ? this.eRawType : this.basicGetERawType()
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_ARGUMENTS: {
                return this.eTypeArguments
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_PARAMETER: {
                return this.eTypeParameter
            }
            case EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND: {
                return this.eUpperBound
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case EcoreConstants.EGENERIC_TYPE__ECLASSIFIER: {
                this.eClassifier = newValue as EClassifier
                break
            }
            case EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND: {
                this.eLowerBound = newValue as EGenericType
                break
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_ARGUMENTS: {
                this.eTypeArguments.clear()
                this.eTypeArguments.addAll(newValue as EList<EGenericType>)
                break
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_PARAMETER: {
                this.eTypeParameter = newValue as ETypeParameter
                break
            }
            case EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND: {
                this.eUpperBound = newValue as EGenericType
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case EcoreConstants.EGENERIC_TYPE__ECLASSIFIER: {
                this.eClassifier = null
                break
            }
            case EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND: {
                this.eLowerBound = null
                break
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_ARGUMENTS: {
                this.eTypeArguments.clear()
                break
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_PARAMETER: {
                this.eTypeParameter = null
                break
            }
            case EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND: {
                this.eUpperBound = null
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case EcoreConstants.EGENERIC_TYPE__ECLASSIFIER: {
                return this._eClassifier != null
            }
            case EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND: {
                return this._eLowerBound != null
            }
            case EcoreConstants.EGENERIC_TYPE__ERAW_TYPE: {
                return this._eRawType != null
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_ARGUMENTS: {
                return this.eTypeArguments != null && this.eTypeArguments.size() != 0
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_PARAMETER: {
                return this._eTypeParameter != null
            }
            case EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND: {
                return this._eUpperBound != null
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }

    eInvokeFromID(operationID: number, args: EList<any>): any {
        switch (operationID) {
            case EcoreConstants.EGENERIC_TYPE__IS_INSTANCE_EJAVAOBJECT: {
                return this.isInstance(args.get(0))
            }
            default: {
                return super.eInvokeFromID(operationID, args)
            }
        }
    }

    eBasicInverseRemove(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain {
        switch (featureID) {
            case EcoreConstants.EGENERIC_TYPE__ELOWER_BOUND: {
                return this.basicSetELowerBound(null, notifications)
            }
            case EcoreConstants.EGENERIC_TYPE__ETYPE_ARGUMENTS: {
                let list = this.eTypeArguments as ENotifyingList<EGenericType>
                let end = otherEnd as EGenericType
                return list.removeWithNotification(end, notifications)
            }
            case EcoreConstants.EGENERIC_TYPE__EUPPER_BOUND: {
                return this.basicSetEUpperBound(null, notifications)
            }
            default: {
                return super.eBasicInverseRemove(otherEnd, featureID, notifications)
            }
        }
    }
}
