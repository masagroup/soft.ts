// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import {
    ETreeIterator,
    ENotification,
    ENotificationChain,
    EObject,
    EObjectList,
    ENotifyingList,
    EObjectInternal,
    EList,
    EClass,
    EOperation,
    EAttribute,
    EReference,
    EResource,
    EStructuralFeature,
    ImmutableEList,
    Adapter,
    Notification,
    BasicNotifier,
    EventType,
    EOPPOSITE_FEATURE_BASE,
} from "./internal";

export function isEReference(s: EStructuralFeature): s is EReference {
    return "eReferenceType" in s;
}

export function isEAttribute(s: EStructuralFeature): s is EAttribute {
    return "eAttributeType" in s;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

type getFeatureFnType = (c: EClass) => EList<EStructuralFeature>;

abstract class AbstractContentsList extends ImmutableEList<EObject>
    implements EObjectList<EObject> {
    protected _obj: BasicEObject;
    protected _getFeatureFn: getFeatureFnType;
    private _initialized = false;
    private _resolve = false;

    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType, resolve: boolean) {
        super();
        this._obj = obj;
        this._getFeatureFn = getFeatureFn;
        this._resolve = resolve;
    }

    get(index: number): EObject {
        this.initialize();
        return super.get(index);
    }

    contains(e: EObject): boolean {
        this.initialize();
        return super.indexOf(e) != -1;
    }

    indexOf(e: EObject): number {
        this.initialize();
        return super.indexOf(e);
    }

    isEmpty(): boolean {
        this.initialize();
        return super.isEmpty();
    }

    size(): number {
        this.initialize();
        return super.size();
    }

    toArray(): EObject[] {
        this.initialize();
        return super.toArray();
    }

    [Symbol.iterator](): Iterator<EObject, any, undefined> {
        this.initialize();
        return super[Symbol.iterator]();
    }

    abstract getUnResolvedList(): EList<EObject>;

    private initialize(): void {
        if (this._initialized) return;

        this._initialized = true;
        let features = this._getFeatureFn(this._obj.eClass());
        for (const feature of features) {
            if (this._obj.eIsSet(feature)) {
                let value = this._obj.eGetResolve(feature, this._resolve);
                if (feature.isMany) {
                    let l = value as EList<EObject>;
                    this._v.push(...l.toArray());
                } else if (value != null) {
                    this._v.push(value);
                }
            }
        }
    }
}

class ResolvedContentsList extends AbstractContentsList {
    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType) {
        super(obj, getFeatureFn, true);
    }

    getUnResolvedList(): EList<EObject> {
        return new UnResolvedContentsList(this._obj, this._getFeatureFn);
    }
}

class UnResolvedContentsList extends AbstractContentsList {
    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType) {
        super(obj, getFeatureFn, false);
    }

    getUnResolvedList(): EList<EObject> {
        return this;
    }
}

class ContentsListAdapter extends Adapter {
    private _obj: BasicEObject;
    private _getFeatureFn: getFeatureFnType;
    private _list: EList<EObject>;

    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType) {
        super();
        this._obj = obj;
        this._getFeatureFn = getFeatureFn;
        obj.eAdapters.add(this);
    }

    notifyChanged(notification: ENotification): void {
        if (this._list) {
            let features = this._getFeatureFn(this._obj.eClass());
            if (features.contains(notification.feature)) delete this._list;
        }
    }

    getList(): EList<EObject> {
        if (!this._list)
            this._list = new ResolvedContentsList(this._obj, this._getFeatureFn);
        return this._list;
    }
}

export class BasicEObject extends BasicNotifier implements EObjectInternal {
    private _eResource: EResource;
    private _eContainer: EObject;
    private _eContainerFeatureID: number = -1;
    private _eProxyURI: URL;
    private _contentsListAdapter: ContentsListAdapter;
    private _crossReferencesListAdapter: ContentsListAdapter;

    constructor() {
        super();
    }

    eClass(): EClass {
        return this.eStaticClass();
    }

    eStaticClass(): EClass {
        return null;
    }

    eInternalContainer(): EObject {
        return this._eContainer;
    }

    eContainer(): EObject {
        let eContainer = this._eContainer;
        if (eContainer && eContainer.eIsProxy()) {
            let resolved = this.eResolveProxy(eContainer);
            if (resolved != eContainer) {
                let notifications = this.eBasicRemoveFromContainer(null);
                this._eContainer = resolved;
                if (notifications) {
                    notifications.dispatch();
                }
                if (
                    this.eNotificationRequired &&
                    this._eContainerFeatureID >= EOPPOSITE_FEATURE_BASE
                ) {
                    this.eNotify(
                        new Notification(
                            this,
                            EventType.RESOLVE,
                            this._eContainerFeatureID,
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
        return this._eContainerFeatureID;
    }

    eResource(): EResource {
        if (!this._eResource) {
            if (this._eContainer) {
                this._eResource = this._eContainer.eResource();
            }
        }
        return this._eResource;
    }

    eInternalResource(): EResource {
        return this._eResource;
    }

    eSetInternalResource(eResource: EResource): void {
        this._eResource = eResource;
    }

    eSetResource(newResource: EResource, n: ENotificationChain): ENotificationChain {
        let notifications = n;
        let oldResource = this.eInternalResource();
        if (oldResource && newResource) {
            let list = oldResource.eContents() as ENotifyingList<EObject>;
            notifications = list.removeWithNotification(this, notifications);
            oldResource.detached(this);
        }
        if (this._eContainer) {
            if (this.eContainmentFeature().isResolveProxies) {
                let oldContainerResource = this._eContainer.eResource();
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
        if (this._eContainer) {
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
        if (this._eContainer) {
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
        if (!this._contentsListAdapter)
            this._contentsListAdapter = new ContentsListAdapter(this, function (
                c: EClass
            ): EList<EStructuralFeature> {
                return c.eContainmentFeatures;
            });
        return this._contentsListAdapter.getList();
    }

    eAllContents(): IterableIterator<EObject> {
        return new ETreeIterator<EObject, EObject>(this, false, function (
            o: EObject
        ): Iterator<EObject> {
            return o.eContents()[Symbol.iterator]();
        });
    }

    eCrossReferences(): EList<EObject> {
        if (!this._crossReferencesListAdapter)
            this._crossReferencesListAdapter = new ContentsListAdapter(this, function (
                c: EClass
            ): EList<EStructuralFeature> {
                return c.eCrossReferenceFeatures;
            });
        return this._crossReferencesListAdapter.getList();
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
        if (!feature) {
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
        let oldResource = this._eResource;
        let oldContainer = this._eContainer;
        let oldContainerFeatureID = this._eContainerFeatureID;

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
        let index = -1;
        if ( fragment && fragment.length > 0 && isNumeric(fragment.charAt(fragment.length-1))) {
            index = fragment.lastIndexOf(".");
            if ( index != -1 ) {
                let pos = parseInt(fragment.slice(index+1));
                let eFeatureName = fragment.slice(1,index);
                let eFeature = this.getStructuralFeatureFromName(eFeatureName);
                let list = this.eGetResolve(eFeature,false) as EList<EObject>;
                if ( pos < list.size() ) {
                    return list.get(pos);
                }
            }
        }
        if ( index == -1) {
            let eFeature = this.getStructuralFeatureFromName(fragment);
            return this.eGetResolve(eFeature,false) as EObject;
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
	    return s
    }

    private getStructuralFeatureFromName( featureName : string ) : EStructuralFeature {
        let eFeature = this.eClass().getEStructuralFeatureFromName(featureName);
        if (!eFeature) {
            throw new Error("The feature " + featureName + " is not a valid feature");
        }
	    return eFeature;
    }

    eIsProxy(): boolean {
        return this._eProxyURI != null;
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
