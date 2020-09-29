// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import {
    ENotification,
    ENotificationChain,
    EObjectInternal,
    EClass,
    EReference,
    EObjectImpl,
    EcoreConstants,
    Adapter,
    EventType,
    EStructuralFeature,
    isEAttribute,
    isEReference,
    BasicEList,
    BasicEObjectList,
    Notification,
    EOPPOSITE_FEATURE_BASE,
} from "./internal";

class DynamicFeaturesAdapter extends Adapter {
    constructor(private _obj: DynamicEObjectImpl) {
        super();
    }

    notifyChanged(notification: ENotification): void {
        if (notification.eventType != EventType.REMOVING_ADAPTER) {
            if (notification.featureID == EcoreConstants.ECLASS__ESTRUCTURAL_FEATURES) {
                this._obj.resizeProperties();
            }
        }
    }
}

function resize(arr, newSize, defaultValue) {
    while (newSize > arr.length) arr.push(defaultValue);
    arr.length = newSize;
}

export class DynamicEObjectImpl extends EObjectImpl {
    private _clz: EClass;
    private _properties: any[];
    private _dynamicFeaturesAdapter: DynamicFeaturesAdapter;

    constructor() {
        super();
        this._clz = null;
        this._dynamicFeaturesAdapter = new DynamicFeaturesAdapter(this);
        this._properties = [];
    }

    resizeProperties(): void {
        resize(
            this._properties,
            this.eClass().getFeatureCount() - this.eStaticClass().getFeatureCount(),
            null
        );
    }

    eClass(): EClass {
        return this._clz == null ? this.eStaticClass() : this._clz;
    }

    setEClass(clz: EClass) {
        if (this._clz) this._clz.eAdapters.remove(this._dynamicFeaturesAdapter);

        this._clz = clz;
        this.resizeProperties();

        if (this._clz) this._clz.eAdapters.add(this._dynamicFeaturesAdapter);
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) {
            let feature = this.eDynamicFeature(featureID);
            let result = this._properties[dynamicFeatureID];
            if (result == null) {
                if (feature.isMany) {
                    result = this.createList(feature);
                }
                this._properties[dynamicFeatureID] = result;
            }
            return result;
        }
        return super.eGetFromID(featureID, resolve);
    }

    eSetFromID(featureID: number, newValue: any): void {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) {
            let dynamicFeature = this.eDynamicFeature(featureID);
            if (this.isContainer(dynamicFeature)) {
                let newContainer = newValue as EObjectInternal;
                if (
                    newContainer != this.eContainer() ||
                    (newContainer != null && this.eContainerFeatureID() != featureID)
                ) {
                    let notifications: ENotificationChain = null;
                    if (this.eContainer())
                        notifications = this.eBasicRemoveFromContainer(notifications);
                    if (newContainer)
                        notifications = newContainer.eInverseAdd(this, featureID, notifications);
                    notifications = this.eBasicSetContainer(newContainer, featureID, notifications);
                    if (notifications) notifications.dispatch();
                } else if (this.eNotificationRequired) {
                    this.eNotify(
                        new Notification(this, EventType.SET, featureID, newValue, newValue)
                    );
                }
            } else if (this.isBidirectional(dynamicFeature) || this.isContains(dynamicFeature)) {
                // inverse - opposite
                let oldValue = this._properties[dynamicFeatureID];
                if (oldValue != newValue) {
                    let notifications: ENotificationChain = null;
                    let oldObject = oldValue as EObjectInternal;
                    let newObject = newValue as EObjectInternal;
                    if (!this.isBidirectional(dynamicFeature)) {
                        if (oldObject)
                            notifications = oldObject.eInverseRemove(
                                this,
                                EOPPOSITE_FEATURE_BASE - featureID,
                                notifications
                            );
                        if (newObject)
                            notifications = oldObject.eInverseAdd(
                                this,
                                EOPPOSITE_FEATURE_BASE - featureID,
                                notifications
                            );
                    } else {
                        let dynamicReference = dynamicFeature as EReference;
                        let reverseFeature = dynamicReference.eOpposite;
                        if (oldObject)
                            notifications = oldObject.eInverseRemove(
                                this,
                                reverseFeature.featureID,
                                notifications
                            );
                        if (newObject)
                            notifications = newObject.eInverseAdd(
                                this,
                                reverseFeature.featureID,
                                notifications
                            );
                    }
                    // basic set
                    this._properties[dynamicFeatureID] = newValue;

                    if (this.eNotificationRequired) {
                        let notification = new Notification(
                            this,
                            EventType.SET,
                            featureID,
                            oldValue,
                            newValue
                        );
                        if (notifications) notifications.add(notification);
                        else notifications = notification;
                    }

                    // notify
                    if (notifications) notifications.dispatch();
                }
            } else {
                let oldValue = this._properties[dynamicFeatureID];
                this._properties[dynamicFeatureID] = newValue;
                if (this.eNotificationRequired)
                    this.eNotify(
                        new Notification(this, EventType.SET, featureID, oldValue, newValue)
                    );
            }
        } else {
            super.eSetFromID(featureID, newValue);
        }
    }

    eIsSetFromID(featureID: number): boolean {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) return this._properties[dynamicFeatureID] != null;
        else return super.eIsSetFromID(featureID);
    }

    eUnsetFromID(featureID: number): void {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) {
            let oldValue = this._properties[dynamicFeatureID];
            this._properties[dynamicFeatureID] = null;
            if (this.eNotificationRequired)
                this.eNotify(new Notification(this, EventType.UNSET, featureID, oldValue, null));
        } else super.eUnsetFromID(featureID);
    }

    private isContainer(feature: EStructuralFeature): boolean {
        return isEReference(feature) && feature.eOpposite ? feature.eOpposite.isContainment : false;
    }

    private isBidirectional(feature: EStructuralFeature): boolean {
        return isEReference(feature) ? feature.eOpposite != null : false;
    }

    private isContains(feature: EStructuralFeature): boolean {
        return isEReference(feature) ? feature.isContainment : false;
    }

    private isBackReference(feature: EStructuralFeature): boolean {
        return isEReference(feature) ? feature.isContainer : false;
    }

    private isProxy(feature: EStructuralFeature): boolean {
        if (this.isContainer(feature) || this.isContains(feature)) return false;
        return isEReference(feature) ? feature.isResolveProxies : false;
    }

    private createList(feature: EStructuralFeature) {
        if (isEAttribute(feature)) {
            return new BasicEList([], feature.isUnique);
        } else if (isEReference(feature)) {
            let inverse = false;
            let opposite = false;
            let reverseID = -1;
            let reverseFeature = feature.eOpposite;
            if (reverseFeature) {
                reverseID = reverseFeature.featureID;
                inverse = true;
                opposite = true;
            } else if (feature.isContainment) {
                inverse = true;
                opposite = false;
            }
            return new BasicEObjectList(
                this,
                feature.featureID,
                reverseID,
                feature.isContainment,
                inverse,
                opposite,
                feature.isResolveProxies,
                feature.isUnsettable
            );
        }
        return null;
    }

    private eDynamicFeature(dynamicFeatureID: number): EStructuralFeature {
        return this.eClass().getEStructuralFeature(
            dynamicFeatureID + this.eStaticClass().getFeatureCount()
        );
    }
}
