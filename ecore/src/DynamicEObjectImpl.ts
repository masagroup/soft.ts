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
    EObject,
    ENotifyingList,
    isEObject,
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
        return !this._clz ? this.eStaticClass() : this._clz;
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
            let dynamicFeature = this.eDynamicFeature(featureID);
            if (this.isContainer(dynamicFeature)) {
                if (this.eContainerFeatureID() == dynamicFeature.featureID) {
                    if (resolve) {
                        return this.eContainer();
                    } else {
                        return this.eInternalContainer();
                    }
                }
            } else {
                // retrieve value or compute it if empty
                let result = this._properties[dynamicFeatureID];
                if (!result) {
                    if (dynamicFeature.isMany) {
                        result = this.createList(dynamicFeature);
                        this._properties[dynamicFeatureID] = result;
                    }
    
                } else if (resolve && this.isProxy(dynamicFeature)) {
                    let oldValue = result as EObject;
                    let newValue = this.eResolveProxy(oldValue);
                    result = newValue;
    
                    if (oldValue != newValue) {
                        this._properties[dynamicFeatureID] = newValue;
                        if (this.isContains(dynamicFeature)) {
                            let notifications : ENotificationChain = null;
                            if (!this.isBidirectional(dynamicFeature)) {
                                if (oldValue) {
                                    notifications = (oldValue as EObjectInternal).eInverseRemove(this, EOPPOSITE_FEATURE_BASE-featureID, notifications);
                                }
                                if (newValue) {
                                    notifications = (newValue as EObjectInternal).eInverseAdd(this, EOPPOSITE_FEATURE_BASE-featureID, notifications);
                                }
                            } else {
                                let dynamicReference = dynamicFeature as EReference;
                                let reverseFeature = dynamicReference.eOpposite;
                                if (oldValue) {
                                    notifications = (oldValue as EObjectInternal).eInverseRemove(this, reverseFeature.featureID, notifications);
                                }
                                if (newValue) {
                                    notifications = (newValue as EObjectInternal).eInverseAdd(this, reverseFeature.featureID, notifications);
                                }
                            }
                            if (notifications) {
                                notifications.dispatch();
                            }
                        }
                        if (this.eNotificationRequired) {
                            this.eNotify( new Notification(this, EventType.RESOLVE, featureID, oldValue, newValue));
                        }
                    }
                }
                return result
            }
        }
        return this.eGetFromID(featureID, resolve);
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
                            notifications = newObject.eInverseAdd(
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
        if (dynamicFeatureID >= 0) {
            let dynamicFeature = this.eDynamicFeature(featureID);
            if (this.isContainer(dynamicFeature)) {
                return this.eContainerFeatureID() == featureID && this.eInternalContainer() != null;
            }
            else {
                return this._properties[dynamicFeatureID] != null;
            }
        }
        else {
            return super.eIsSetFromID(featureID);
        }
    }

    eUnsetFromID(featureID: number): void {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) {
            let dynamicFeature = this.eDynamicFeature(featureID);
            if (this.isContainer(dynamicFeature)) {
                if (this.eInternalContainer()) {
                    let notifications = this.eBasicRemoveFromContainer(null);
                    notifications = this.eBasicSetContainer(null, featureID, notifications);
                    if (notifications) {
                        notifications.dispatch();
                    }
                } else if (this.eNotificationRequired) {
                    this.eNotify( new Notification(this, EventType.SET, featureID, null, null));
                }
            } else if (this.isBidirectional(dynamicFeature) || this.isContains(dynamicFeature)){
                // inverse - opposite
                let oldValue = this._properties[dynamicFeatureID];
                if (oldValue) {
                    let notifications : ENotificationChain = null;
                    let oldObject = oldValue as EObject;

                    if (!this.isBidirectional(dynamicFeature)) {
                        if (oldObject) {
                            notifications = (oldObject as EObjectInternal).eInverseRemove(this, EOPPOSITE_FEATURE_BASE-featureID, notifications);
                        }
                    } else {
                        let dynamicReference = dynamicFeature as EReference;
                        let reverseFeature = dynamicReference.eOpposite;
                        if (oldObject) {
                            notifications = (oldObject as EObjectInternal).eInverseRemove(this, reverseFeature.featureID, notifications);
                        }
                    }
                    // basic unset
                    this._properties[dynamicFeatureID] = null;

                    // create notification
                    if (this.eNotificationRequired) {
                        let eventType = EventType.SET;
                        if (dynamicFeature.isUnsettable) {
                            eventType = EventType.UNSET;
                        }
                        let notification = new Notification(this, eventType, featureID, oldValue, null);
                        if (notifications) {
                            notifications.add(notification);
                        } else {
                            notifications = notification;
                        }
                    }

                    // notify
                    if (notifications) {
                        notifications.dispatch();
                    }
                }
            } else {
                let oldValue = this._properties[dynamicFeatureID];
                this._properties[dynamicFeatureID] = null;
                if (this.eNotificationRequired)
                    this.eNotify(new Notification(this, EventType.UNSET, featureID, oldValue, null));
            }
        } else {
            super.eUnsetFromID(featureID);
        }
    }

    eBasicInverseAdd(otherEnd : EObject, featureID : number, notifications : ENotificationChain) : ENotificationChain {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) {
            let dynamicFeature = this.eDynamicFeature(featureID);
            if ( dynamicFeature.isMany) {
                let value = this._properties[dynamicFeatureID];
                if (!value) {
                    value = this.createList(dynamicFeature);
                    this._properties[dynamicFeatureID] = value;
                }
                return (value as ENotifyingList<EObject>).addWithNotification(otherEnd, notifications);
            } else if (this.isContainer(dynamicFeature)) {
                let msgs = notifications;
                if (this.eContainer()) {
                    msgs = this.eBasicRemoveFromContainer(msgs);
                }
                return this.eBasicSetContainer(otherEnd, featureID, msgs);
            } else {
                // inverse - opposite
                let oldValue = this._properties[dynamicFeatureID];
                if (oldValue) {
                    if (!this.isBidirectional(dynamicFeature)) {
                        notifications = (oldValue as EObjectInternal).eInverseRemove(this, EOPPOSITE_FEATURE_BASE-featureID, notifications);
                    } else {
                        let dynamicReference = dynamicFeature as EReference;
                        let reverseFeature = dynamicReference.eOpposite;
                        notifications = (oldValue as EObjectInternal).eInverseRemove(this, reverseFeature.featureID, notifications);
                    }
                }
                // set current value
                this._properties[dynamicFeatureID] = otherEnd;

                // create notification
                if (this.eNotificationRequired ) {
                    let notification =  new Notification(this, EventType.SET, featureID, oldValue, otherEnd);
                    if (notifications) {
                        notifications.add(notification);
                    } else {
                        notifications = notification;
                    }
                }
           }
        }
        return notifications;
    }
    
    eBasicInverseRemove(otherEnd : EObject, featureID : number , notifications : ENotificationChain) : ENotificationChain {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) {
            let dynamicFeature = this.eDynamicFeature(featureID);
            if ( dynamicFeature.isMany) {
                let value = this._properties[dynamicFeatureID];
                if (value) {
                    return (value as ENotifyingList<EObject>).removeWithNotification(otherEnd, notifications);
                }
            } else if (this.isContainer(dynamicFeature)) {
                return this.eBasicSetContainer(null, featureID, notifications);
            } else {
                let oldValue = this._properties[dynamicFeatureID];
                this._properties[dynamicFeatureID] = null;
    
                // create notification
                if (this.eNotificationRequired) {
                    let notification = new Notification(this, EventType.SET, featureID, oldValue, null);
                    if (notifications) {
                        notifications.add(notification);
                    } else {
                        notifications = notification;
                    }
                }
            }
        }
        return notifications;
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
