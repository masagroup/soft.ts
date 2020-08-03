// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { BasicNotifier } from "./BasicNotifier";
import { EClass } from "./EClass";
import { ECollectionView } from "./ECollectionView";
import { EList } from "./EList";
import { EObject } from "./EObject";
import { EOperation } from "./EOperation";
import { EReference } from "./EReference";
import { EResource } from "./EResource";
import { EStructuralFeature } from "./EStructuralFeature";
import { ENotificationChain } from "./ENOtificationChain";
import { Notification } from "./Notification";
import { EventType, ENotification } from "./ENotification";
import { EObjectInternal } from "./EObjectInternal";
import { EOPPOSITE_FEATURE_BASE } from "./Constants";
import { EAttribute } from "./EAttribute";

export function isEReference(s: EStructuralFeature): s is EReference {
    return "eReferenceType" in s;
}

export function isEAttribute(s: EStructuralFeature): s is EAttribute {
    return "eAttributeType" in s;
}

export class BasicEObject extends BasicNotifier implements EObjectInternal {
    private _eResource: EResource;
    private _eContainer: EObject;
    private _eContainerFeatureID: number;
    private _eProxyURI?: URL;

    constructor() {
        super();
        this._eResource = null;
        this._eContainer = null;
        this._eContainerFeatureID = -1;
    }

    eClass(): EClass {
        return this.eStaticClass();
    }

    eStaticClass(): EClass {
        return null;
    }

    eContainer(): EObject {
        return this._eContainer;
    }

    eContainerFeatureID(): number {
        return this._eContainerFeatureID;
    }

    eResource(): EResource {
        if (this._eResource == null) {
            if (this._eContainer != null) {
                this._eResource = this._eContainer.eResource();
            }
        }
        return this._eResource;
    }

    eDirectResource(): EResource {
        return this._eResource;
    }

    eSetDirectResource(eResource: EResource): void {
        this._eResource = eResource;
    }

    eContainingFeature(): EStructuralFeature {
        if (this._eContainer != null) {
            if (this._eContainerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                let feature = <EStructuralFeature>(
                    this._eContainer
                        .eClass()
                        .getEStructuralFeature(EOPPOSITE_FEATURE_BASE - this._eContainerFeatureID)
                );
                return feature;
            } else {
                let reference = <EReference>(
                    this.eClass().getEStructuralFeature(this._eContainerFeatureID)
                );
                return reference.eOpposite;
            }
        }
        return null;
    }

    eContainmentFeature(): EReference {
        return this.eObjectContainmentFeature(this, this._eContainer, this._eContainerFeatureID);
    }

    private eObjectContainmentFeature(
        o: EObject,
        container: EObject,
        containerFeatureID: number
    ): EReference {
        if (this._eContainer != null) {
            if (this._eContainerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                let feature: EStructuralFeature = this._eContainer
                    .eClass()
                    .getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID);
                if (isEReference(feature)) {
                    return feature;
                }
            } else {
                let feature: EStructuralFeature = this.eClass().getEStructuralFeature(
                    containerFeatureID
                );
                if (isEReference(feature)) {
                    return feature;
                }
            }
            throw new Error("The containment feature could not be located");
        }
        return null;
    }

    eContents(): EList<EObject> {
        return null;
    }

    eAllContents(): ECollectionView<EObject> {
        return null;
    }

    eCrossReferences(): EList<EObject> {
        throw new Error("Method not implemented.");
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

        return this.eDerivedFeatureID(operation.eContainer(), operation.operationID);
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
        if (feature == null) {
            throw new Error("Invalid featureID: " + featureID);
        }
        return null;
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
        if (feature == null) {
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
        if (feature == null) {
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
        if (feature == null) {
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
        if (operation == null) {
            throw new Error("Invalid operationID: " + operationID);
        }
    }

    eSetResource(newResource: EResource, notifications: ENotificationChain): ENotificationChain {
        this.eSetDirectResource(newResource);
        return notifications;
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
        let oldResource = this._eResource;
        let oldContainer = this._eContainer;
        let oldContainerFeatureID = this._eContainerFeatureID;

        // basic set
        this._eContainer = newContainer;
        this._eContainerFeatureID = newContainerFeatureID;

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
        if (this._eContainerFeatureID >= 0)
            return this.eBasicRemoveFromContainerFeature(notifications);
        else {
            if (this._eContainer != null)
                return this.eInverseRemove(
                    this,
                    EOPPOSITE_FEATURE_BASE - this._eContainerFeatureID,
                    notifications
                );
        }
        return notifications;
    }

    eBasicRemoveFromContainerFeature(notifications: ENotificationChain): ENotificationChain {
        let feature = this.eClass().getEStructuralFeature(this._eContainerFeatureID);
        if (isEReference(feature)) {
            let inverseFeature = feature.eOpposite;
            if (this._eContainer != null && inverseFeature != null)
                return this.eInverseRemove(this, inverseFeature.featureID, notifications);
        }
        return notifications;
    }

    eObjectForFragmentSegment(fragment: string): EObject {
        throw new Error("Method not implemented.");
    }

    eURIFragmentSegment(feature: EStructuralFeature, o: EObject): string {
        throw new Error("Method not implemented.");
    }

    eIsProxy(): boolean {
        return this._eProxyURI == undefined;
    }

    eProxyURI(): URL {
        return this._eProxyURI;
    }

    eSetProxyURI(uri: URL): void {
        this._eProxyURI = uri;
    }

    eResolveProxy(proxy: EObject): EObject {
        throw new Error("Method not implemented.");
    }
}
