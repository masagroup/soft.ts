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
    EAttribute,
    EClass,
    EList,
    ENotification,
    ENotificationChain,
    ENotifyingList,
    EOPPOSITE_FEATURE_BASE,
    EObject,
    EObjectInternal,
    EReference,
    EStructuralFeature,
    EStructuralFeatureExt,
    EcoreConstants,
    EventType,
    Notification,
    getEcorePackage,
    isEObjectInternal,
    isEObjectList,
} from "./internal";

export class EReferenceImpl extends EStructuralFeatureExt implements EReference {
    protected _isContainment: boolean;
    protected _eOpposite: EReference;
    protected _eKeys: EList<EAttribute>;
    protected _isResolveProxies: boolean;

    constructor() {
        super();
        this._eKeys = null;
        this._eOpposite = null;
        this._isContainment = false;
        this._isResolveProxies = true;
    }

    eStaticClass(): EClass {
        return getEcorePackage().getEReference();
    }

    // get the value of eKeys
    get eKeys(): EList<EAttribute> {
        if (this._eKeys == null) {
            this._eKeys = this.initEKeys();
        }
        return this._eKeys;
    }

    // get the value of eOpposite
    get eOpposite(): EReference {
        if (this._eOpposite != null && this._eOpposite.eIsProxy()) {
            let oldEOpposite = this._eOpposite;
            let newEOpposite = this.eResolveProxy(oldEOpposite) as EReference;
            this._eOpposite = newEOpposite;
            if (newEOpposite != oldEOpposite) {
                if (this.eNotificationRequired) {
                    this.eNotify(
                        new Notification(
                            this,
                            EventType.RESOLVE,
                            EcoreConstants.EREFERENCE__EOPPOSITE,
                            oldEOpposite,
                            newEOpposite,
                        ),
                    );
                }
            }
        }
        return this._eOpposite;
    }

    // set the value of eOpposite
    set eOpposite(newEOpposite: EReference) {
        let oldEOpposite = this._eOpposite;
        this._eOpposite = newEOpposite;
        if (this.eNotificationRequired) {
            this.eNotify(
                new Notification(this, EventType.SET, EcoreConstants.EREFERENCE__EOPPOSITE, oldEOpposite, newEOpposite),
            );
        }
    }

    // get the basic value of eOpposite with no proxy resolution
    basicGetEOpposite(): EReference {
        return this._eOpposite;
    }

    // get the value of eReferenceType
    get eReferenceType(): EClass {
        throw new Error("get eReferenceType not implemented");
    }

    // get the basic value of eReferenceType with no proxy resolution
    basicGetEReferenceType(): EClass {
        throw new Error("basicGetEReferenceType not implemented");
    }

    // get the value of isContainer
    get isContainer(): boolean {
        throw new Error("get isContainer not implemented");
    }

    // get the value of isContainment
    get isContainment(): boolean {
        return this._isContainment;
    }

    // set the value of isContainment
    set isContainment(newIsContainment: boolean) {
        let oldIsContainment = this._isContainment;
        this._isContainment = newIsContainment;
        if (this.eNotificationRequired) {
            this.eNotify(
                new Notification(
                    this,
                    EventType.SET,
                    EcoreConstants.EREFERENCE__CONTAINMENT,
                    oldIsContainment,
                    newIsContainment,
                ),
            );
        }
    }

    // get the value of isResolveProxies
    get isResolveProxies(): boolean {
        return this._isResolveProxies;
    }

    // set the value of isResolveProxies
    set isResolveProxies(newIsResolveProxies: boolean) {
        let oldIsResolveProxies = this._isResolveProxies;
        this._isResolveProxies = newIsResolveProxies;
        if (this.eNotificationRequired) {
            this.eNotify(
                new Notification(
                    this,
                    EventType.SET,
                    EcoreConstants.EREFERENCE__RESOLVE_PROXIES,
                    oldIsResolveProxies,
                    newIsResolveProxies,
                ),
            );
        }
    }

    protected initEKeys(): EList<EAttribute> {
        return new BasicEObjectList<EAttribute>(
            this,
            EcoreConstants.EREFERENCE__EKEYS,
            -1,
            false,
            false,
            false,
            true,
            false,
        );
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case EcoreConstants.EREFERENCE__CONTAINER: {
                return this.isContainer;
            }
            case EcoreConstants.EREFERENCE__CONTAINMENT: {
                return this.isContainment;
            }
            case EcoreConstants.EREFERENCE__EKEYS: {
                let list = this.eKeys;
                if (!resolve) {
                    if (isEObjectList(list)) return list.getUnResolvedList();
                }
                return list;
            }
            case EcoreConstants.EREFERENCE__EOPPOSITE: {
                if (resolve) {
                    return this.eOpposite;
                }
                return this.basicGetEOpposite();
            }
            case EcoreConstants.EREFERENCE__EREFERENCE_TYPE: {
                if (resolve) {
                    return this.eReferenceType;
                }
                return this.basicGetEReferenceType();
            }
            case EcoreConstants.EREFERENCE__RESOLVE_PROXIES: {
                return this.isResolveProxies;
            }
            default: {
                return super.eGetFromID(featureID, resolve);
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case EcoreConstants.EREFERENCE__CONTAINMENT: {
                this.isContainment = newValue as boolean;
                break;
            }
            case EcoreConstants.EREFERENCE__EKEYS: {
                this.eKeys.clear();
                this.eKeys.addAll(newValue as EList<EAttribute>);
                break;
            }
            case EcoreConstants.EREFERENCE__EOPPOSITE: {
                this.eOpposite = newValue as EReference;
                break;
            }
            case EcoreConstants.EREFERENCE__RESOLVE_PROXIES: {
                this.isResolveProxies = newValue as boolean;
                break;
            }
            default: {
                super.eSetFromID(featureID, newValue);
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case EcoreConstants.EREFERENCE__CONTAINMENT: {
                this.isContainment = false;
                break;
            }
            case EcoreConstants.EREFERENCE__EKEYS: {
                this.eKeys.clear();
                break;
            }
            case EcoreConstants.EREFERENCE__EOPPOSITE: {
                this.eOpposite = null;
                break;
            }
            case EcoreConstants.EREFERENCE__RESOLVE_PROXIES: {
                this.isResolveProxies = true;
                break;
            }
            default: {
                super.eUnsetFromID(featureID);
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case EcoreConstants.EREFERENCE__CONTAINER: {
                return this.isContainer != false;
            }
            case EcoreConstants.EREFERENCE__CONTAINMENT: {
                return this._isContainment != false;
            }
            case EcoreConstants.EREFERENCE__EKEYS: {
                return this.eKeys != null && this.eKeys.size() != 0;
            }
            case EcoreConstants.EREFERENCE__EOPPOSITE: {
                return this._eOpposite != null;
            }
            case EcoreConstants.EREFERENCE__EREFERENCE_TYPE: {
                return this.eReferenceType != null;
            }
            case EcoreConstants.EREFERENCE__RESOLVE_PROXIES: {
                return this._isResolveProxies != true;
            }
            default: {
                return super.eIsSetFromID(featureID);
            }
        }
    }
}
