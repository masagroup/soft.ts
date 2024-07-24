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
    BasicEObjectMap,
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
    URI
} from "./internal.js"

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}

export abstract class AbstractEObject extends AbstractENotifier implements EObjectInternal {
    abstract eInternalContainer(): EObject
    abstract eInternalResource(): EResource
    abstract eInternalContainerFeatureID(): number
    abstract eSetInternalContainer(container: EObject, containerFeatureID: number): void
    abstract eSetInternalResource(resource: EResource): void
    abstract eIsProxy(): boolean
    abstract eProxyURI(): URI
    abstract eSetProxyURI(uri: URI): void

    eDynamicProperties(): EDynamicProperties {
        return null
    }

    eClass(): EClass {
        return this.eStaticClass()
    }

    eStaticClass(): EClass {
        return null
    }

    eStaticFeatureCount(): number {
        return this.eStaticClass().getFeatureCount()
    }

    eResolveProxy(proxy: EObject): EObject {
        return EcoreUtils.resolveInObject(proxy, this)
    }

    eContainer(): EObject {
        let eContainer = this.eInternalContainer()
        if (eContainer && eContainer.eIsProxy()) {
            let resolved = this.eResolveProxy(eContainer)
            if (resolved != eContainer) {
                let notifications = this.eBasicRemoveFromContainer(null)
                let containerFeatureID = this.eInternalContainerFeatureID()
                this.eSetInternalContainer(resolved, containerFeatureID)
                if (notifications) {
                    notifications.dispatch()
                }
                if (this.eNotificationRequired() && containerFeatureID >= EOPPOSITE_FEATURE_BASE) {
                    this.eNotify(new Notification(this, EventType.RESOLVE, containerFeatureID, eContainer, resolved))
                }
            }
            return resolved
        }
        return eContainer
    }

    eContainerFeatureID(): number {
        return this.eInternalContainerFeatureID()
    }

    eResource(): EResource {
        let resource = this.eInternalResource()
        if (!resource) {
            let container = this.eInternalContainer()
            if (container) {
                resource = container.eResource()
            }
        }
        return resource
    }

    eSetResource(newResource: EResource, n: ENotificationChain): ENotificationChain {
        let notifications = n
        let oldResource = this.eInternalResource()
        if (oldResource && newResource) {
            let list = oldResource.eContents() as ENotifyingList<EObject>
            notifications = list.removeWithNotification(this, notifications)
            oldResource.detached(this)
        }
        let eContainer = this.eInternalContainer()
        if (eContainer) {
            if (this.eContainmentFeature().isResolveProxies()) {
                let oldContainerResource = eContainer.eResource()
                if (oldContainerResource) {
                    if (!newResource) {
                        oldContainerResource.attached(this)
                    } else if (!oldResource) {
                        oldContainerResource.detached(this)
                    }
                }
            } else {
                notifications = this.eBasicRemoveFromContainer(notifications)
                notifications = this.eBasicSetContainer(null, -1, notifications)
            }
        }
        this.eSetInternalResource(newResource)
        return notifications
    }

    eContainingFeature(): EStructuralFeature {
        let eContainer = this.eInternalContainer()
        if (eContainer) {
            let containerFeatureID = this.eInternalContainerFeatureID()
            if (containerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                let feature = eContainer.eClass().getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID)
                return feature
            } else {
                let reference = this.eClass().getEStructuralFeature(containerFeatureID) as EReference
                return reference.getEOpposite()
            }
        }
        return null
    }

    eContainmentFeature(): EReference {
        return this.eObjectContainmentFeature(this, this.eInternalContainer(), this.eInternalContainerFeatureID())
    }

    private eObjectContainmentFeature(o: EObject, container: EObject, containerFeatureID: number): EReference {
        if (container) {
            if (containerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                let feature = container.eClass().getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID)
                if (isEReference(feature)) {
                    return feature
                }
            } else {
                let feature = this.eClass().getEStructuralFeature(containerFeatureID)
                if (isEReference(feature)) {
                    return feature
                }
            }
            throw new Error("The containment feature could not be located")
        }
        return null
    }

    abstract eContents(): EList<EObject>
    abstract eCrossReferences(): EList<EObject>

    eAllContents(): IterableIterator<EObject> {
        return new ETreeIterator<EObject, EObject>(this, false, function (o: EObject): Iterator<EObject> {
            return o.eContents()[Symbol.iterator]()
        })
    }

    eFeatureID(feature: EStructuralFeature): number {
        if (!this.eClass().getEAllStructuralFeatures().contains(feature))
            throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
        return this.eDerivedFeatureID(feature.eContainer(), feature.getFeatureID())
    }

    eDerivedFeatureID(container: EObject, featureID: number): number {
        return featureID
    }

    eOperationID(operation: EOperation): number {
        if (!this.eClass().getEAllOperations().contains(operation)) {
            throw new Error("The operation '" + operation.getName() + "' is not a valid feature")
        }
        return this.eDerivedOperationID(operation.eContainer(), operation.getOperationID())
    }

    eDerivedOperationID(container: EObject, operationID: number): number {
        return operationID
    }

    eGet(feature: EStructuralFeature): any {
        return this.eGetFromFeature(feature, true)
    }

    eGetResolve(feature: EStructuralFeature, resolve: boolean): any {
        return this.eGetFromFeature(feature, resolve)
    }

    private eGetFromFeature(feature: EStructuralFeature, resolve: boolean): any {
        let featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            return this.eGetFromID(featureID, resolve)
        }
        throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        let feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        let dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            return this.eGetResolve(feature, resolve)
        } else {
            let properties = this.eDynamicProperties()
            if (properties) {
                return this.eDynamicPropertiesGet(properties, feature, dynamicFeatureID, resolve)
            } else {
                throw new Error("EObject doesn't define any dynamic properties")
            }
        }
    }

    protected eDynamicPropertiesGet(
        properties: EDynamicProperties,
        dynamicFeature: EStructuralFeature,
        dynamicFeatureID: number,
        resolve: boolean
    ): any {
        if (isContainer(dynamicFeature)) {
            let featureID = this.eClass().getFeatureID(dynamicFeature)
            if (this.eInternalContainerFeatureID() == featureID) {
                return resolve ? this.eContainer() : this.eInternalContainer()
            }
        } else {
            let result = properties.eDynamicGet(dynamicFeatureID)
            if (!result) {
                if (dynamicFeature.isMany()) {
                    if (isMapType(dynamicFeature)) {
                        result = this.eDynamicPropertiesCreateMap(dynamicFeature)
                    } else {
                        result = this.eDynamicPropertiesCreateList(dynamicFeature)
                    }
                    properties.eDynamicSet(dynamicFeatureID, result)
                } else if (dynamicFeature.getDefaultValue()) {
                    result = dynamicFeature.getDefaultValue()
                }
            } else if (resolve && isProxy(dynamicFeature)) {
                if (isEObject(result)) {
                    let oldValue = result
                    let newValue = this.eResolveProxy(oldValue)
                    result = newValue
                    if (oldValue != newValue) {
                        properties.eDynamicSet(dynamicFeatureID, newValue)
                        if (isContains(dynamicFeature)) {
                            let notifications: ENotificationChain = null
                            if (!isBidirectional(dynamicFeature)) {
                                let featureID = this.eClass().getFeatureID(dynamicFeature)
                                if (oldValue) {
                                    let oldObject = oldValue as EObjectInternal
                                    notifications = oldObject.eInverseRemove(
                                        this,
                                        EOPPOSITE_FEATURE_BASE - featureID,
                                        notifications
                                    )
                                }
                                if (newValue) {
                                    let newObject = newValue as EObjectInternal
                                    notifications = newObject.eInverseAdd(
                                        this,
                                        EOPPOSITE_FEATURE_BASE - featureID,
                                        notifications
                                    )
                                }
                            } else {
                                let dynamicReference = dynamicFeature as EReference
                                let reverseFeature = dynamicReference.getEOpposite()
                                if (oldValue) {
                                    let oldObject = oldValue as EObjectInternal
                                    let featureID = oldObject.eClass().getFeatureID(reverseFeature)
                                    notifications = oldObject.eInverseRemove(this, featureID, notifications)
                                }
                                if (newValue) {
                                    let newObject = newValue as EObjectInternal
                                    let featureID = newObject.eClass().getFeatureID(reverseFeature)
                                    notifications = newObject.eInverseAdd(this, featureID, notifications)
                                }
                            }
                            if (notifications) {
                                notifications.dispatch()
                            }
                        }
                        if (this.eNotificationRequired()) {
                            this.eNotify(new Notification(this, EventType.RESOLVE, dynamicFeature, oldValue, newValue))
                        }
                    }
                }
            }
            return result
        }
        return null
    }

    private eDynamicPropertiesCreateMap(feature: EStructuralFeature): any {
        let eClass = feature.getEType() as EClass
        return new BasicEObjectMap<any, any>(eClass)
    }

    private eDynamicPropertiesCreateList(feature: EStructuralFeature): any {
        if (isEAttribute(feature)) {
            return new BasicEList([], feature.isUnique())
        } else if (isEReference(feature)) {
            let inverse = false
            let opposite = false
            let reverseID = -1
            let reverseFeature = feature.getEOpposite()
            if (reverseFeature) {
                reverseID = reverseFeature.getFeatureID()
                inverse = true
                opposite = true
            } else if (feature.isContainment()) {
                inverse = true
                opposite = false
            }
            return new BasicEObjectList(
                this,
                feature.getFeatureID(),
                reverseID,
                feature.isContainment(),
                inverse,
                opposite,
                feature.isResolveProxies(),
                feature.isUnsettable()
            )
        }
        return null
    }

    eSet(feature: EStructuralFeature, newValue: any): void {
        let featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            this.eSetFromID(featureID, newValue)
        } else {
            throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
        }
    }

    eSetFromID(featureID: number, newValue: any): void {
        let feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        let dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            return this.eSet(feature, newValue)
        } else {
            let properties = this.eDynamicProperties()
            if (properties) {
                return this.eDynamicPropertiesSet(properties, feature, dynamicFeatureID, newValue)
            } else {
                throw new Error("EObject doesn't define any dynamic properties")
            }
        }
    }

    protected eDynamicPropertiesSet(
        properties: EDynamicProperties,
        dynamicFeature: EStructuralFeature,
        dynamicFeatureID: number,
        newValue: any
    ) {
        if (isContainer(dynamicFeature)) {
            // container
            let featureID = this.eClass().getFeatureID(dynamicFeature)
            let oldContainer = this.eInternalContainer()
            let newContainer = isEObjectInternal(newValue) ? newValue : null
            if (newContainer != oldContainer || (newContainer && this.eInternalContainerFeatureID() != featureID)) {
                let notifications: ENotificationChain
                if (oldContainer) {
                    notifications = this.eBasicRemoveFromContainer(notifications)
                }
                if (newContainer) {
                    let reverseFeature = (dynamicFeature as EReference).getEOpposite()
                    let featureID = newContainer.eClass().getFeatureID(reverseFeature)
                    notifications = newContainer.eInverseAdd(this, featureID, notifications)
                }
                notifications = this.eBasicSetContainer(newContainer, featureID, notifications)
                if (notifications) {
                    notifications.dispatch()
                }
            } else if (this.eNotificationRequired()) {
                this.eNotify(new Notification(this, EventType.SET, dynamicFeature, newValue, newValue))
            }
        } else if (isBidirectional(dynamicFeature) || isContains(dynamicFeature)) {
            // inverse - opposite
            let oldValue = properties.eDynamicGet(dynamicFeatureID)
            if (oldValue != newValue) {
                let notifications: ENotificationChain = null
                let oldObject = isEObjectInternal(oldValue) ? oldValue : null
                let newObject = isEObjectInternal(newValue) ? newValue : null

                if (!isBidirectional(dynamicFeature)) {
                    let featureID = this.eClass().getFeatureID(dynamicFeature)
                    if (oldObject) {
                        notifications = oldObject.eInverseRemove(
                            this,
                            EOPPOSITE_FEATURE_BASE - featureID,
                            notifications
                        )
                    }
                    if (newObject) {
                        notifications = newObject.eInverseAdd(this, EOPPOSITE_FEATURE_BASE - featureID, notifications)
                    }
                } else {
                    let dynamicReference = dynamicFeature as EReference
                    let reverseFeature = dynamicReference.getEOpposite()
                    if (oldObject) {
                        let featureID = oldObject.eClass().getFeatureID(reverseFeature)
                        notifications = oldObject.eInverseRemove(this, featureID, notifications)
                    }
                    if (newObject) {
                        let featureID = newObject.eClass().getFeatureID(reverseFeature)
                        notifications = newObject.eInverseAdd(this, featureID, notifications)
                    }
                }
                // basic set
                properties.eDynamicSet(dynamicFeatureID, newValue)

                // create notification
                if (this.eNotificationRequired()) {
                    let notification = new Notification(this, EventType.SET, dynamicFeature, oldValue, newValue)
                    if (notifications) {
                        notifications.add(notification)
                    } else {
                        notifications = notification
                    }
                }

                // notify
                if (notifications) {
                    notifications.dispatch()
                }
            }
        } else {
            // basic set
            let oldValue = properties.eDynamicGet(dynamicFeatureID)
            properties.eDynamicSet(dynamicFeatureID, newValue)

            // notify
            if (this.eNotificationRequired()) {
                this.eNotify(new Notification(this, EventType.SET, dynamicFeature, oldValue, newValue))
            }
        }
    }

    eIsSet(feature: EStructuralFeature): boolean {
        let featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            return this.eIsSetFromID(featureID)
        }
        throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
    }

    eIsSetFromID(featureID: number): boolean {
        let feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        let dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            return this.eIsSet(feature)
        } else {
            let properties = this.eDynamicProperties()
            if (properties) {
                return this.eDynamicPropertiesIsSet(properties, feature, dynamicFeatureID)
            } else {
                throw new Error("EObject doesn't define any dynamic properties")
            }
        }
    }

    protected eDynamicPropertiesIsSet(
        properties: EDynamicProperties,
        dynamicFeature: EStructuralFeature,
        dynamicFeatureID: number
    ): boolean {
        if (isContainer(dynamicFeature)) {
            let featureID = this.eClass().getFeatureID(dynamicFeature)
            return this.eInternalContainerFeatureID() == featureID && this.eInternalContainer() != null
        } else {
            return properties.eDynamicGet(dynamicFeatureID) != null
        }
    }

    eUnset(feature: EStructuralFeature): void {
        let featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            this.eUnsetFromID(featureID)
        } else {
            throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
        }
    }

    eUnsetFromID(featureID: number): void {
        let feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        let dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            this.eUnset(feature)
        } else {
            let properties = this.eDynamicProperties()
            if (properties) {
                this.eDynamicPropertiesUnset(properties, feature, dynamicFeatureID)
            } else {
                throw new Error("EObject doesn't define any dynamic properties")
            }
        }
    }

    protected eDynamicPropertiesUnset(
        properties: EDynamicProperties,
        dynamicFeature: EStructuralFeature,
        dynamicFeatureID: number
    ) {
        if (isContainer(dynamicFeature)) {
            if (this.eInternalContainer()) {
                let featureID = this.eClass().getFeatureID(dynamicFeature)
                let notifications = this.eBasicRemoveFromContainer(null)
                notifications = this.eBasicSetContainer(null, featureID, notifications)
                if (notifications) {
                    notifications.dispatch()
                }
            } else if (this.eNotificationRequired()) {
                this.eNotify(new Notification(this, EventType.SET, dynamicFeature, null, null))
            }
        } else if (isBidirectional(dynamicFeature) || isContains(dynamicFeature)) {
            // inverse - opposite
            let oldValue = properties.eDynamicGet(dynamicFeatureID)
            if (oldValue) {
                let notifications: ENotificationChain = null
                let oldObject = isEObjectInternal(oldValue) ? oldValue : null
                if (!isBidirectional(dynamicFeature)) {
                    if (oldObject) {
                        let featureID = this.eClass().getFeatureID(dynamicFeature)
                        notifications = oldObject.eInverseRemove(
                            this,
                            EOPPOSITE_FEATURE_BASE - featureID,
                            notifications
                        )
                    }
                } else {
                    let dynamicReference = dynamicFeature as EReference
                    let reverseFeature = dynamicReference.getEOpposite()
                    if (oldObject) {
                        let featureID = oldObject.eClass().getFeatureID(reverseFeature)
                        notifications = oldObject.eInverseRemove(this, featureID, notifications)
                    }
                }
                // basic unset
                properties.eDynamicUnset(dynamicFeatureID)

                // create notification
                if (this.eNotificationRequired()) {
                    let eventType = dynamicFeature.isUnsettable ? EventType.UNSET : EventType.SET
                    let notification = new Notification(this, eventType, dynamicFeature, oldValue, null)
                    if (notifications) {
                        notifications.add(notification)
                    } else {
                        notifications = notification
                    }
                }

                // notify
                if (notifications) {
                    notifications.dispatch()
                }
            }
        } else {
            let oldValue = properties.eDynamicGet(dynamicFeatureID)
            properties.eDynamicUnset(dynamicFeatureID)
            if (this.eNotificationRequired()) {
                this.eNotify(new Notification(this, EventType.UNSET, dynamicFeature, oldValue, null))
            }
        }
    }

    eInvoke(operation: EOperation, args: EList<any>): any {
        let operationID = this.eOperationID(operation)
        if (operationID >= 0) {
            return this.eInvokeFromID(operationID, args)
        }
        throw new Error("The operation '" + operation.getName() + "' is not a valid operation")
    }

    eInvokeFromID(operationID: number, args: EList<any>): any {
        let operation = this.eClass().getEOperation(operationID)
        if (!operation) {
            throw new Error("Invalid operationID: " + operationID)
        }
    }

    eInverseAdd(otherEnd: EObject, featureID: number, n: ENotificationChain): ENotificationChain {
        let notifications = n
        if (featureID >= 0) {
            this.eBasicInverseAdd(otherEnd, featureID, notifications)
        } else {
            notifications = this.eBasicRemoveFromContainer(notifications)
            return this.eBasicSetContainer(otherEnd, featureID, notifications)
        }
    }

    eBasicInverseAdd(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain {
        let feature = this.eClass().getEStructuralFeature(featureID)
        let dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID >= 0) {
            let properties = this.eDynamicProperties()
            if (properties) {
                return this.eDynamicPropertiesInverseAdd(properties, otherEnd, feature, dynamicFeatureID, notifications)
            } else {
                throw new Error("EObject doesn't define any dynamic properties")
            }
        }
        return notifications
    }

    protected eDynamicPropertiesInverseAdd(
        properties: EDynamicProperties,
        otherEnd: EObject,
        dynamicFeature: EStructuralFeature,
        dynamicFeatureID: number,
        notifications: ENotificationChain
    ): ENotificationChain {
        if (dynamicFeature.isMany()) {
            let value = properties.eDynamicGet(dynamicFeatureID)
            if (!value) {
                value = this.eDynamicPropertiesCreateList(dynamicFeature)
                properties.eDynamicSet(dynamicFeatureID, value)
            }
            let list = value as ENotifyingList<EObject>
            return list.addWithNotification(otherEnd, notifications)
        } else if (isContainer(dynamicFeature)) {
            let msgs = notifications
            if (this.eInternalContainer()) {
                msgs = this.eBasicRemoveFromContainer(msgs)
            }
            let featureID = this.eClass().getFeatureID(dynamicFeature)
            return this.eBasicSetContainer(otherEnd, featureID, msgs)
        } else {
            // inverse - opposite
            let oldValue = properties.eDynamicGet(dynamicFeatureID)
            let oldObject = isEObjectInternal(oldValue) ? oldValue : null
            if (oldObject) {
                if (isContains(dynamicFeature)) {
                    let featureID = this.eClass().getFeatureID(dynamicFeature)
                    notifications = oldObject.eInverseRemove(this, EOPPOSITE_FEATURE_BASE - featureID, notifications)
                } else if (isBidirectional(dynamicFeature)) {
                    let dynamicReference = dynamicFeature as EReference
                    let reverseFeature = dynamicReference.getEOpposite()
                    let featureID = oldObject.eClass().getFeatureID(reverseFeature)
                    notifications = oldObject.eInverseRemove(this, featureID, notifications)
                }
            }

            // set current value
            properties.eDynamicSet(dynamicFeatureID, otherEnd)

            // create notification
            if (this.eNotificationRequired()) {
                let notification = new Notification(this, EventType.SET, dynamicFeature, oldValue, otherEnd)
                if (notifications) {
                    notifications.add(notification)
                } else {
                    notifications = notification
                }
            }
        }
        return notifications
    }

    eInverseRemove(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain {
        return featureID >= 0
            ? this.eBasicInverseRemove(otherEnd, featureID, notifications)
            : this.eBasicSetContainer(null, featureID, notifications)
    }

    eBasicInverseRemove(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain {
        let feature = this.eClass().getEStructuralFeature(featureID)
        let dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID >= 0) {
            let properties = this.eDynamicProperties()
            if (properties) {
                return this.eDynamicPropertiesInverseRemove(
                    properties,
                    otherEnd,
                    feature,
                    dynamicFeatureID,
                    notifications
                )
            } else {
                throw new Error("EObject doesn't define any dynamic properties")
            }
        }
        return notifications
    }

    protected eDynamicPropertiesInverseRemove(
        properties: EDynamicProperties,
        otherEnd: EObject,
        dynamicFeature: EStructuralFeature,
        dynamicFeatureID: number,
        notifications: ENotificationChain
    ): ENotificationChain {
        if (dynamicFeature.isMany()) {
            let value = properties.eDynamicGet(dynamicFeatureID)
            if (value) {
                let list = value as ENotifyingList<EObject>
                return list.removeWithNotification(otherEnd, notifications)
            }
        } else if (isContainer(dynamicFeature)) {
            let featureID = this.eClass().getFeatureID(dynamicFeature)
            return this.eBasicSetContainer(null, featureID, notifications)
        } else {
            let oldValue = properties.eDynamicGet(dynamicFeatureID)
            properties.eDynamicUnset(dynamicFeatureID)

            // create notification
            if (this.eNotificationRequired()) {
                let notification = new Notification(this, EventType.SET, dynamicFeature, oldValue, null)
                if (notifications) {
                    notifications.add(notification)
                } else {
                    notifications = notification
                }
            }
        }
        return notifications
    }

    protected eBasicSetContainer(
        newContainer: EObject,
        newContainerFeatureID: number,
        n: ENotificationChain
    ): ENotificationChain {
        let notifications = n
        let oldResource = this.eInternalResource()
        let oldContainer = this.eInternalContainer()
        let oldContainerFeatureID = this.eInternalContainerFeatureID()

        let newResource: EResource = null
        if (oldResource) {
            if (
                newContainer &&
                !this.eObjectContainmentFeature(this, newContainer, newContainerFeatureID).isResolveProxies()
            ) {
                let list = oldResource.eContents() as ENotifyingList<EObject>
                notifications = list.removeWithNotification(this, notifications)
                this.eSetInternalResource(null)
                newResource = newContainer.eResource()
            } else {
                oldResource = null
            }
        } else {
            if (oldContainer) {
                oldResource = oldContainer.eResource()
            }
            if (newContainer) {
                newResource = newContainer.eResource()
            }
        }

        if (oldResource && oldResource != newResource) {
            oldResource.detached(this)
        }

        if (newResource && newResource != oldResource) {
            newResource.attached(this)
        }

        // internal set
        this.eSetInternalContainer(newContainer, newContainerFeatureID)

        // notification
        if (this.eNotificationRequired()) {
            if (oldContainer != null && oldContainerFeatureID >= 0 && oldContainerFeatureID != newContainerFeatureID) {
                let notification = new Notification(this, EventType.SET, oldContainerFeatureID, oldContainer, null)
                if (notifications != null) {
                    notifications.add(notification)
                } else {
                    notifications = notification
                }
            }
            if (newContainerFeatureID >= 0) {
                let notification = new Notification(
                    this,
                    EventType.SET,
                    newContainerFeatureID,
                    oldContainerFeatureID == newContainerFeatureID ? oldContainer : null,
                    newContainer
                )
                if (notifications != null) {
                    notifications.add(notification)
                } else {
                    notifications = notification
                }
            }
        }
        return notifications
    }

    protected eBasicRemoveFromContainer(notifications: ENotificationChain): ENotificationChain {
        if (this.eInternalContainerFeatureID() >= 0) return this.eBasicRemoveFromContainerFeature(notifications)
        else {
            let eContainer = this.eInternalContainer()
            if (isEObjectInternal(eContainer))
                return eContainer.eInverseRemove(
                    this,
                    EOPPOSITE_FEATURE_BASE - this.eInternalContainerFeatureID(),
                    notifications
                )
        }
        return notifications
    }

    protected eBasicRemoveFromContainerFeature(notifications: ENotificationChain): ENotificationChain {
        let feature = this.eClass().getEStructuralFeature(this.eInternalContainerFeatureID())
        if (isEReference(feature)) {
            let inverseFeature = feature.getEOpposite()
            if (inverseFeature) {
                let eContainer = this.eInternalContainer()
                if (isEObjectInternal(eContainer))
                    return eContainer.eInverseRemove(this, inverseFeature.getFeatureID(), notifications)
            }
        }
        return notifications
    }

    eObjectForFragmentSegment(uriSegment: string): EObject {
        let lastIndex = uriSegment.length - 1
        if (lastIndex == -1 || uriSegment[0] != "@") {
            throw new Error("Expecting @ at index 0 of '" + uriSegment + "'")
        }

        let index = -1
        if (uriSegment && uriSegment.length > 0 && isNumeric(uriSegment.charAt(uriSegment.length - 1))) {
            index = uriSegment.lastIndexOf(".")
            if (index != -1) {
                let pos = parseInt(uriSegment.slice(index + 1))
                let eFeatureName = uriSegment.slice(1, index)
                let eFeature = this.getStructuralFeatureFromName(eFeatureName)
                let list = this.eGetResolve(eFeature, false) as EList<EObject>
                if (pos < list.size()) {
                    return list.get(pos)
                }
            }
        }
        if (index == -1) {
            let eFeature = this.getStructuralFeatureFromName(uriSegment.slice(1))
            return this.eGetResolve(eFeature, false) as EObject
        }
        return null
    }

    eURIFragmentSegment(feature: EStructuralFeature, o: EObject): string {
        let s = "@"
        s += feature.getName()
        if (feature.isMany()) {
            let v = this.eGetResolve(feature, false)
            let i = (v as EList<EObject>).indexOf(o)
            s += "." + i.toString()
        }
        return s
    }

    private getStructuralFeatureFromName(featureName: string): EStructuralFeature {
        let eFeature = this.eClass().getEStructuralFeatureFromName(featureName)
        if (!eFeature) {
            throw new Error("The feature " + featureName + " is not a valid feature")
        }
        return eFeature
    }
}
