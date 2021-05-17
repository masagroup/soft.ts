// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractENotifier,
    BasicEList,
    BasicEObjectList,
    EClass,
    EcoreUtils,
    EDynamicProperties,
    EList,
    ENotificationChain,
    ENotifyingList,
    EObject,
    EObjectInternal,
    EOperation,
    EOPPOSITE_FEATURE_BASE,
    EReference,
    EResource,
    EStructuralFeature,
    ETreeIterator,
    EventType,
    isBidirectional,
    isContainer,
    isContains,
    isEAttribute,
    isEObject,
    isEObjectInternal,
    isEReference,
    isMapType,
    isProxy,
    Notification,
} from "./internal";

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export abstract class AbstractEObject extends AbstractENotifier implements EObjectInternal {
    abstract eInternalContainer(): EObject;
    abstract eInternalResource(): EResource;
    abstract eInternalContainerFeatureID(): number;
    abstract eSetInternalContainer(container: EObject, containerFeatureID: number): void;
    abstract eSetInternalResource(resource: EResource): void;
    abstract eIsProxy(): boolean;
    abstract eProxyURI(): URL;
    abstract eSetProxyURI(uri: URL): void;

    eDynamicProperties(): EDynamicProperties {
        return null;
    }

    eClass(): EClass {
        return this.eStaticClass();
    }

    eStaticClass(): EClass {
        return null;
    }

    eStaticFeatureCount(): number {
        return this.eStaticClass().getFeatureCount();
    }

    eResolveProxy(proxy: EObject): EObject {
        return EcoreUtils.resolveInObject(proxy, this);
    }

    eContainer(): EObject {
        let eContainer = this.eInternalContainer();
        if (eContainer && eContainer.eIsProxy()) {
            let resolved = this.eResolveProxy(eContainer);
            if (resolved != eContainer) {
                let notifications = this.eBasicRemoveFromContainer(null);
                let containerFeatureID = this.eInternalContainerFeatureID();
                this.eSetInternalContainer(resolved, containerFeatureID);
                if (notifications) {
                    notifications.dispatch();
                }
                if (this.eNotificationRequired && containerFeatureID >= EOPPOSITE_FEATURE_BASE) {
                    this.eNotify(
                        new Notification(
                            this,
                            EventType.RESOLVE,
                            containerFeatureID,
                            eContainer,
                            resolved
                        )
                    );
                }
            }
            return resolved;
        }
        return eContainer;
    }

    eContainerFeatureID(): number {
        return this.eInternalContainerFeatureID();
    }

    eResource(): EResource {
        let resource = this.eInternalResource();
        if (!resource) {
            let container = this.eInternalContainer();
            if (container) {
                resource = container.eResource();
            }
        }
        return resource;
    }

    eSetResource(newResource: EResource, n: ENotificationChain): ENotificationChain {
        let notifications = n;
        let oldResource = this.eInternalResource();
        if (oldResource && newResource) {
            let list = oldResource.eContents() as ENotifyingList<EObject>;
            notifications = list.removeWithNotification(this, notifications);
            oldResource.detached(this);
        }
        let eContainer = this.eInternalContainer();
        if (eContainer) {
            if (this.eContainmentFeature().isResolveProxies) {
                let oldContainerResource = eContainer.eResource();
                if (oldContainerResource) {
                    if (!newResource) {
                        oldContainerResource.attached(this);
                    } else if (!oldResource) {
                        oldContainerResource.detached(this);
                    }
                }
            } else {
                notifications = this.eBasicRemoveFromContainer(notifications);
                notifications = this.eBasicSetContainer(null, -1, notifications);
            }
        }
        this.eSetInternalResource(newResource);
        return notifications;
    }

    eContainingFeature(): EStructuralFeature {
        let eContainer = this.eInternalContainer();
        if (isEObjectInternal(eContainer)) {
            let containerFeatureID = eContainer.eInternalContainerFeatureID();
            if (containerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                let feature = eContainer
                    .eClass()
                    .getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID);
                return feature;
            } else {
                let reference = this.eClass().getEStructuralFeature(
                    containerFeatureID
                ) as EReference;
                return reference.eOpposite;
            }
        }
        return null;
    }

    eContainmentFeature(): EReference {
        return this.eObjectContainmentFeature(
            this,
            this.eInternalContainer(),
            this.eInternalContainerFeatureID()
        );
    }

    private eObjectContainmentFeature(
        o: EObject,
        container: EObject,
        containerFeatureID: number
    ): EReference {
        if (container) {
            if (containerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                let feature = container
                    .eClass()
                    .getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID);
                if (isEReference(feature)) {
                    return feature;
                }
            } else {
                let feature = this.eClass().getEStructuralFeature(containerFeatureID);
                if (isEReference(feature)) {
                    return feature;
                }
            }
            throw new Error("The containment feature could not be located");
        }
        return null;
    }

    abstract eContents(): EList<EObject>;
    abstract eCrossReferences(): EList<EObject>;

    eAllContents(): IterableIterator<EObject> {
        return new ETreeIterator<EObject, EObject>(
            this,
            false,
            function (o: EObject): Iterator<EObject> {
                return o.eContents()[Symbol.iterator]();
            }
        );
    }

    eFeatureID(feature: EStructuralFeature): number {
        if (!this.eClass().eAllStructuralFeatures.contains(feature))
            throw new Error("The feature '" + feature.name + "' is not a valid feature");
        return this.eDerivedFeatureID(feature.eContainer(), feature.featureID);
    }

    eDerivedFeatureID(container: EObject, featureID: number): number {
        return featureID;
    }

    eOperationID(operation: EOperation): number {
        if (!this.eClass().eAllOperations.contains(operation)) {
            throw new Error("The operation '" + operation.name + "' is not a valid feature");
        }
        return this.eDerivedOperationID(operation.eContainer(), operation.operationID);
    }

    eDerivedOperationID(container: EObject, operationID: number): number {
        return operationID;
    }

    eGet(feature: EStructuralFeature): any {
        return this.eGetFromFeature(feature, true);
    }

    eGetResolve(feature: EStructuralFeature, resolve: boolean): any {
        return this.eGetFromFeature(feature, resolve);
    }

    private eGetFromFeature(feature: EStructuralFeature, resolve: boolean): any {
        let featureID = this.eFeatureID(feature);
        if (featureID >= 0) {
            return this.eGetFromID(featureID, resolve);
        }
        throw new Error("The feature '" + feature.name + "' is not a valid feature");
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        let feature = this.eClass().getEStructuralFeature(featureID);
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID);
        }
    }

    eSet(feature: EStructuralFeature, newValue: any): void {
        let featureID = this.eFeatureID(feature);
        if (featureID >= 0) {
            this.eSetFromID(featureID, newValue);
        } else {
            throw new Error("The feature '" + feature.name + "' is not a valid feature");
        }
    }

    eSetFromID(featureID: number, newValue: any): void {
        let feature = this.eClass().getEStructuralFeature(featureID);
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID);
        }
    }

    eIsSet(feature: EStructuralFeature): boolean {
        let featureID = this.eFeatureID(feature);
        if (featureID >= 0) {
            return this.eIsSetFromID(featureID);
        }
        throw new Error("The feature '" + feature.name + "' is not a valid feature");
    }

    eIsSetFromID(featureID: number): boolean {
        let feature = this.eClass().getEStructuralFeature(featureID);
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID);
        }
        return false;
    }

    eUnset(feature: EStructuralFeature): void {
        let featureID = this.eFeatureID(feature);
        if (featureID >= 0) {
            this.eUnsetFromID(featureID);
        } else {
            throw new Error("The feature '" + feature.name + "' is not a valid feature");
        }
    }

    eUnsetFromID(featureID: number): void {
        let feature = this.eClass().getEStructuralFeature(featureID);
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID);
        }
    }

    eInvoke(operation: EOperation, args: EList<any>): any {
        let operationID = this.eOperationID(operation);
        if (operationID >= 0) {
            return this.eInvokeFromID(operationID, args);
        }
        throw new Error("The operation '" + operation.name + "' is not a valid operation");
    }

    eInvokeFromID(operationID: number, args: EList<any>): any {
        let operation = this.eClass().getEOperation(operationID);
        if (!operation) {
            throw new Error("Invalid operationID: " + operationID);
        }
    }

    eInverseAdd(otherEnd: EObject, featureID: number, n: ENotificationChain): ENotificationChain {
        let notifications = n;
        if (featureID >= 0) {
            this.eBasicInverseAdd(otherEnd, featureID, notifications);
        } else {
            notifications = this.eBasicRemoveFromContainer(notifications);
            return this.eBasicSetContainer(otherEnd, featureID, notifications);
        }
    }

    eBasicInverseAdd(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain
    ): ENotificationChain {
        return notifications;
    }

    eInverseRemove(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain
    ): ENotificationChain {
        return featureID >= 0
            ? this.eBasicInverseRemove(otherEnd, featureID, notifications)
            : this.eBasicSetContainer(null, featureID, notifications);
    }

    eBasicInverseRemove(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain
    ): ENotificationChain {
        return notifications;
    }

    protected eBasicSetContainer(
        newContainer: EObject,
        newContainerFeatureID: number,
        n: ENotificationChain
    ): ENotificationChain {
        let notifications = n;
        let oldResource = this.eInternalResource();
        let oldContainer = this.eInternalContainer();
        let oldContainerFeatureID = this.eInternalContainerFeatureID();

        let newResource: EResource = null;
        if (oldResource) {
            if (
                newContainer &&
                !this.eObjectContainmentFeature(this, newContainer, newContainerFeatureID)
                    .isResolveProxies
            ) {
                let list = oldResource.eContents() as ENotifyingList<EObject>;
                notifications = list.removeWithNotification(this, notifications);
                this.eSetInternalResource(null);
                newResource = newContainer.eResource();
            } else {
                oldResource = null;
            }
        } else {
            if (oldContainer) {
                oldResource = oldContainer.eResource();
            }
            if (newContainer) {
                newResource = newContainer.eResource();
            }
        }

        if (oldResource && oldResource != newResource) {
            oldResource.detached(this);
        }

        if (newResource && newResource && oldResource) {
            newResource.attached(this);
        }

        // internal set
        this.eSetInternalContainer(newContainer, newContainerFeatureID);

        // notification
        if (this.eNotificationRequired) {
            if (
                oldContainer != null &&
                oldContainerFeatureID >= 0 &&
                oldContainerFeatureID != newContainerFeatureID
            ) {
                let notification = new Notification(
                    this,
                    EventType.SET,
                    oldContainerFeatureID,
                    oldContainer,
                    null
                );
                if (notifications != null) {
                    notifications.add(notification);
                } else {
                    notifications = notification;
                }
            }
            if (newContainerFeatureID >= 0) {
                let notification = new Notification(
                    this,
                    EventType.SET,
                    newContainerFeatureID,
                    oldContainerFeatureID == newContainerFeatureID ? oldContainer : null,
                    newContainer
                );
                if (notifications != null) {
                    notifications.add(notification);
                } else {
                    notifications = notification;
                }
            }
        }
        return notifications;
    }

    eBasicRemoveFromContainer(notifications: ENotificationChain): ENotificationChain {
        if (this.eInternalContainerFeatureID() >= 0)
            return this.eBasicRemoveFromContainerFeature(notifications);
        else {
            let eContainer = this.eInternalContainer();
            if (isEObjectInternal(eContainer))
                return eContainer.eInverseRemove(
                    this,
                    EOPPOSITE_FEATURE_BASE - this.eInternalContainerFeatureID(),
                    notifications
                );
        }
        return notifications;
    }

    eBasicRemoveFromContainerFeature(notifications: ENotificationChain): ENotificationChain {
        let feature = this.eClass().getEStructuralFeature(this.eInternalContainerFeatureID());
        if (isEReference(feature)) {
            let inverseFeature = feature.eOpposite;
            if (inverseFeature) {
                let eContainer = this.eInternalContainer();
                if (isEObjectInternal(eContainer))
                    return eContainer.eInverseRemove(this, inverseFeature.featureID, notifications);
            }
        }
        return notifications;
    }

    eObjectForFragmentSegment(fragment: string): EObject {
        let lastIndex = fragment.length - 1;
        if (lastIndex == -1 || fragment[0] != "@") {
            throw new Error("Expecting @ at index 0 of '" + fragment + "'");
        }

        let index = -1;
        if (fragment && fragment.length > 0 && isNumeric(fragment.charAt(fragment.length - 1))) {
            index = fragment.lastIndexOf(".");
            if (index != -1) {
                let pos = parseInt(fragment.slice(index + 1));
                let eFeatureName = fragment.slice(1, index);
                let eFeature = this.getStructuralFeatureFromName(eFeatureName);
                let list = this.eGetResolve(eFeature, false) as EList<EObject>;
                if (pos < list.size()) {
                    return list.get(pos);
                }
            }
        }
        if (index == -1) {
            let eFeature = this.getStructuralFeatureFromName(fragment);
            return this.eGetResolve(eFeature, false) as EObject;
        }
        return null;
    }

    eURIFragmentSegment(feature: EStructuralFeature, o: EObject): string {
        let s = "@";
        s += feature.name;
        if (feature.isMany) {
            let v = this.eGetResolve(feature, false);
            let i = (v as EList<EObject>).indexOf(o);
            s += "." + i.toString();
        }
        return s;
    }

    private getStructuralFeatureFromName(featureName: string): EStructuralFeature {
        let eFeature = this.eClass().getEStructuralFeatureFromName(featureName);
        if (!eFeature) {
            throw new Error("The feature " + featureName + " is not a valid feature");
        }
        return eFeature;
    }
}
