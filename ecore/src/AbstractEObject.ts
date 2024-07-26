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

    async eResolveProxyAsync(proxy: EObject): Promise<EObject> {
        return EcoreUtils.resolveInObjectAsync(proxy, this)
    }

    eContainer(): EObject {
        const eContainer = this.eInternalContainer()
        if (eContainer && eContainer.eIsProxy()) {
            const resolved = this.eResolveProxy(eContainer)
            if (resolved != eContainer) {
                const notifications = this.eBasicRemoveFromContainer(null)
                const containerFeatureID = this.eInternalContainerFeatureID()
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
            const container = this.eInternalContainer()
            if (container) {
                resource = container.eResource()
            }
        }
        return resource
    }

    eSetResource(newResource: EResource, n: ENotificationChain): ENotificationChain {
        let notifications = n
        const oldResource = this.eInternalResource()
        if (oldResource && newResource) {
            const list = oldResource.eContents() as ENotifyingList<EObject>
            notifications = list.removeWithNotification(this, notifications)
            oldResource.detached(this)
        }
        const eContainer = this.eInternalContainer()
        if (eContainer) {
            if (this.eContainmentFeature().isResolveProxies()) {
                const oldContainerResource = eContainer.eResource()
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
        const eContainer = this.eInternalContainer()
        if (eContainer) {
            const containerFeatureID = this.eInternalContainerFeatureID()
            if (containerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                const feature = eContainer.eClass().getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID)
                return feature
            } else {
                const reference = this.eClass().getEStructuralFeature(containerFeatureID) as EReference
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
                const feature = container.eClass().getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID)
                if (isEReference(feature)) {
                    return feature
                }
            } else {
                const feature = this.eClass().getEStructuralFeature(containerFeatureID)
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

    async eGetAsync(feature: EStructuralFeature): Promise<any> {
        return this.eGetFromFeatureAsync(feature, true)
    }

    eGetResolve(feature: EStructuralFeature, resolve: boolean): any {
        return this.eGetFromFeature(feature, resolve)
    }

    async eGetResolveAsync(feature: EStructuralFeature, resolve: boolean): Promise<any> {
        return this.eGetFromFeatureAsync(feature, resolve)
    }

    private eGetFromFeature(feature: EStructuralFeature, resolve: boolean): any {
        const featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            return this.eGetFromID(featureID, resolve)
        }
        throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
    }

    private async eGetFromFeatureAsync(feature: EStructuralFeature, resolve: boolean): Promise<any> {
        const featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            return this.eGetFromIDAsync(featureID, resolve)
        }
        throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        const feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        const dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            return this.eGetResolve(feature, resolve)
        } else {
            const properties = this.eDynamicProperties()
            if (properties) {
                return this.eDynamicPropertiesGet(properties, feature, dynamicFeatureID, resolve)
            } else {
                throw new Error("EObject doesn't define any dynamic properties")
            }
        }
    }

    async eGetFromIDAsync(featureID: number, resolve: boolean): Promise<any> {
        const feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        const dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            return this.eGetResolveAsync(feature, resolve)
        } else {
            const properties = this.eDynamicProperties()
            if (properties) {
                return this.eDynamicPropertiesGetAsync(properties, feature, dynamicFeatureID, resolve)
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
            const featureID = this.eClass().getFeatureID(dynamicFeature)
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
                    const oldValue = result
                    const newValue = this.eResolveProxy(oldValue)
                    result = newValue
                    if (oldValue != newValue) {
                        properties.eDynamicSet(dynamicFeatureID, newValue)
                        if (isContains(dynamicFeature)) {
                            let notifications: ENotificationChain = null
                            if (!isBidirectional(dynamicFeature)) {
                                const featureID = this.eClass().getFeatureID(dynamicFeature)
                                if (oldValue) {
                                    const oldObject = oldValue as EObjectInternal
                                    notifications = oldObject.eInverseRemove(
                                        this,
                                        EOPPOSITE_FEATURE_BASE - featureID,
                                        notifications
                                    )
                                }
                                if (newValue) {
                                    const newObject = newValue as EObjectInternal
                                    notifications = newObject.eInverseAdd(
                                        this,
                                        EOPPOSITE_FEATURE_BASE - featureID,
                                        notifications
                                    )
                                }
                            } else {
                                const dynamicReference = dynamicFeature as EReference
                                const reverseFeature = dynamicReference.getEOpposite()
                                if (oldValue) {
                                    const oldObject = oldValue as EObjectInternal
                                    const featureID = oldObject.eClass().getFeatureID(reverseFeature)
                                    notifications = oldObject.eInverseRemove(this, featureID, notifications)
                                }
                                if (newValue) {
                                    const newObject = newValue as EObjectInternal
                                    const featureID = newObject.eClass().getFeatureID(reverseFeature)
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

    protected async eDynamicPropertiesGetAsync(
        properties: EDynamicProperties,
        dynamicFeature: EStructuralFeature,
        dynamicFeatureID: number,
        resolve: boolean
    ): Promise<any> {
        if (isContainer(dynamicFeature)) {
            const featureID = this.eClass().getFeatureID(dynamicFeature)
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
                    const oldValue = result
                    const newValue = await this.eResolveProxyAsync(oldValue)
                    result = newValue
                    if (oldValue != newValue) {
                        properties.eDynamicSet(dynamicFeatureID, newValue)
                        if (isContains(dynamicFeature)) {
                            let notifications: ENotificationChain = null
                            if (!isBidirectional(dynamicFeature)) {
                                const featureID = this.eClass().getFeatureID(dynamicFeature)
                                if (oldValue) {
                                    const oldObject = oldValue as EObjectInternal
                                    notifications = oldObject.eInverseRemove(
                                        this,
                                        EOPPOSITE_FEATURE_BASE - featureID,
                                        notifications
                                    )
                                }
                                if (newValue) {
                                    const newObject = newValue as EObjectInternal
                                    notifications = newObject.eInverseAdd(
                                        this,
                                        EOPPOSITE_FEATURE_BASE - featureID,
                                        notifications
                                    )
                                }
                            } else {
                                const dynamicReference = dynamicFeature as EReference
                                const reverseFeature = dynamicReference.getEOpposite()
                                if (oldValue) {
                                    const oldObject = oldValue as EObjectInternal
                                    const featureID = oldObject.eClass().getFeatureID(reverseFeature)
                                    notifications = oldObject.eInverseRemove(this, featureID, notifications)
                                }
                                if (newValue) {
                                    const newObject = newValue as EObjectInternal
                                    const featureID = newObject.eClass().getFeatureID(reverseFeature)
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
        const eClass = feature.getEType() as EClass
        return new BasicEObjectMap<any, any>(eClass)
    }

    private eDynamicPropertiesCreateList(feature: EStructuralFeature): any {
        if (isEAttribute(feature)) {
            return new BasicEList([], feature.isUnique())
        } else if (isEReference(feature)) {
            let inverse = false
            let opposite = false
            let reverseID = -1
            const reverseFeature = feature.getEOpposite()
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
        const featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            this.eSetFromID(featureID, newValue)
        } else {
            throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
        }
    }

    eSetFromID(featureID: number, newValue: any): void {
        const feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        const dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            return this.eSet(feature, newValue)
        } else {
            const properties = this.eDynamicProperties()
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
            const featureID = this.eClass().getFeatureID(dynamicFeature)
            const oldContainer = this.eInternalContainer()
            const newContainer = isEObjectInternal(newValue) ? newValue : null
            if (newContainer != oldContainer || (newContainer && this.eInternalContainerFeatureID() != featureID)) {
                let notifications: ENotificationChain
                if (oldContainer) {
                    notifications = this.eBasicRemoveFromContainer(notifications)
                }
                if (newContainer) {
                    const reverseFeature = (dynamicFeature as EReference).getEOpposite()
                    const featureID = newContainer.eClass().getFeatureID(reverseFeature)
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
            const oldValue = properties.eDynamicGet(dynamicFeatureID)
            if (oldValue != newValue) {
                let notifications: ENotificationChain = null
                const oldObject = isEObjectInternal(oldValue) ? oldValue : null
                const newObject = isEObjectInternal(newValue) ? newValue : null

                if (!isBidirectional(dynamicFeature)) {
                    const featureID = this.eClass().getFeatureID(dynamicFeature)
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
                    const dynamicReference = dynamicFeature as EReference
                    const reverseFeature = dynamicReference.getEOpposite()
                    if (oldObject) {
                        const featureID = oldObject.eClass().getFeatureID(reverseFeature)
                        notifications = oldObject.eInverseRemove(this, featureID, notifications)
                    }
                    if (newObject) {
                        const featureID = newObject.eClass().getFeatureID(reverseFeature)
                        notifications = newObject.eInverseAdd(this, featureID, notifications)
                    }
                }
                // basic set
                properties.eDynamicSet(dynamicFeatureID, newValue)

                // create notification
                if (this.eNotificationRequired()) {
                    const notification = new Notification(this, EventType.SET, dynamicFeature, oldValue, newValue)
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
            const oldValue = properties.eDynamicGet(dynamicFeatureID)
            properties.eDynamicSet(dynamicFeatureID, newValue)

            // notify
            if (this.eNotificationRequired()) {
                this.eNotify(new Notification(this, EventType.SET, dynamicFeature, oldValue, newValue))
            }
        }
    }

    eIsSet(feature: EStructuralFeature): boolean {
        const featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            return this.eIsSetFromID(featureID)
        }
        throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
    }

    eIsSetFromID(featureID: number): boolean {
        const feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        const dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            return this.eIsSet(feature)
        } else {
            const properties = this.eDynamicProperties()
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
            const featureID = this.eClass().getFeatureID(dynamicFeature)
            return this.eInternalContainerFeatureID() == featureID && this.eInternalContainer() != null
        } else {
            return properties.eDynamicGet(dynamicFeatureID) != null
        }
    }

    eUnset(feature: EStructuralFeature): void {
        const featureID = this.eFeatureID(feature)
        if (featureID >= 0) {
            this.eUnsetFromID(featureID)
        } else {
            throw new Error("The feature '" + feature.getName() + "' is not a valid feature")
        }
    }

    eUnsetFromID(featureID: number): void {
        const feature = this.eClass().getEStructuralFeature(featureID)
        if (!feature) {
            throw new Error("Invalid featureID: " + featureID)
        }
        const dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID < 0) {
            this.eUnset(feature)
        } else {
            const properties = this.eDynamicProperties()
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
                const featureID = this.eClass().getFeatureID(dynamicFeature)
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
            const oldValue = properties.eDynamicGet(dynamicFeatureID)
            if (oldValue) {
                let notifications: ENotificationChain = null
                const oldObject = isEObjectInternal(oldValue) ? oldValue : null
                if (!isBidirectional(dynamicFeature)) {
                    if (oldObject) {
                        const featureID = this.eClass().getFeatureID(dynamicFeature)
                        notifications = oldObject.eInverseRemove(
                            this,
                            EOPPOSITE_FEATURE_BASE - featureID,
                            notifications
                        )
                    }
                } else {
                    const dynamicReference = dynamicFeature as EReference
                    const reverseFeature = dynamicReference.getEOpposite()
                    if (oldObject) {
                        const featureID = oldObject.eClass().getFeatureID(reverseFeature)
                        notifications = oldObject.eInverseRemove(this, featureID, notifications)
                    }
                }
                // basic unset
                properties.eDynamicUnset(dynamicFeatureID)

                // create notification
                if (this.eNotificationRequired()) {
                    const eventType = dynamicFeature.isUnsettable ? EventType.UNSET : EventType.SET
                    const notification = new Notification(this, eventType, dynamicFeature, oldValue, null)
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
            const oldValue = properties.eDynamicGet(dynamicFeatureID)
            properties.eDynamicUnset(dynamicFeatureID)
            if (this.eNotificationRequired()) {
                this.eNotify(new Notification(this, EventType.UNSET, dynamicFeature, oldValue, null))
            }
        }
    }

    eInvoke(operation: EOperation, args: EList<any>): any {
        const operationID = this.eOperationID(operation)
        if (operationID >= 0) {
            return this.eInvokeFromID(operationID, args)
        }
        throw new Error("The operation '" + operation.getName() + "' is not a valid operation")
    }

    eInvokeFromID(operationID: number, args: EList<any>): any {
        const operation = this.eClass().getEOperation(operationID)
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
        const feature = this.eClass().getEStructuralFeature(featureID)
        const dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID >= 0) {
            const properties = this.eDynamicProperties()
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
            const list = value as ENotifyingList<EObject>
            return list.addWithNotification(otherEnd, notifications)
        } else if (isContainer(dynamicFeature)) {
            let msgs = notifications
            if (this.eInternalContainer()) {
                msgs = this.eBasicRemoveFromContainer(msgs)
            }
            const featureID = this.eClass().getFeatureID(dynamicFeature)
            return this.eBasicSetContainer(otherEnd, featureID, msgs)
        } else {
            // inverse - opposite
            const oldValue = properties.eDynamicGet(dynamicFeatureID)
            const oldObject = isEObjectInternal(oldValue) ? oldValue : null
            if (oldObject) {
                if (isContains(dynamicFeature)) {
                    const featureID = this.eClass().getFeatureID(dynamicFeature)
                    notifications = oldObject.eInverseRemove(this, EOPPOSITE_FEATURE_BASE - featureID, notifications)
                } else if (isBidirectional(dynamicFeature)) {
                    const dynamicReference = dynamicFeature as EReference
                    const reverseFeature = dynamicReference.getEOpposite()
                    const featureID = oldObject.eClass().getFeatureID(reverseFeature)
                    notifications = oldObject.eInverseRemove(this, featureID, notifications)
                }
            }

            // set current value
            properties.eDynamicSet(dynamicFeatureID, otherEnd)

            // create notification
            if (this.eNotificationRequired()) {
                const notification = new Notification(this, EventType.SET, dynamicFeature, oldValue, otherEnd)
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
        const feature = this.eClass().getEStructuralFeature(featureID)
        const dynamicFeatureID = featureID - this.eStaticFeatureCount()
        if (dynamicFeatureID >= 0) {
            const properties = this.eDynamicProperties()
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
            const value = properties.eDynamicGet(dynamicFeatureID)
            if (value) {
                const list = value as ENotifyingList<EObject>
                return list.removeWithNotification(otherEnd, notifications)
            }
        } else if (isContainer(dynamicFeature)) {
            const featureID = this.eClass().getFeatureID(dynamicFeature)
            return this.eBasicSetContainer(null, featureID, notifications)
        } else {
            const oldValue = properties.eDynamicGet(dynamicFeatureID)
            properties.eDynamicUnset(dynamicFeatureID)

            // create notification
            if (this.eNotificationRequired()) {
                const notification = new Notification(this, EventType.SET, dynamicFeature, oldValue, null)
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
        const oldContainer = this.eInternalContainer()
        const oldContainerFeatureID = this.eInternalContainerFeatureID()

        let newResource: EResource = null
        if (oldResource) {
            if (
                newContainer &&
                !this.eObjectContainmentFeature(this, newContainer, newContainerFeatureID).isResolveProxies()
            ) {
                const list = oldResource.eContents() as ENotifyingList<EObject>
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
                const notification = new Notification(this, EventType.SET, oldContainerFeatureID, oldContainer, null)
                if (notifications != null) {
                    notifications.add(notification)
                } else {
                    notifications = notification
                }
            }
            if (newContainerFeatureID >= 0) {
                const notification = new Notification(
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
            const eContainer = this.eInternalContainer()
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
        const feature = this.eClass().getEStructuralFeature(this.eInternalContainerFeatureID())
        if (isEReference(feature)) {
            const inverseFeature = feature.getEOpposite()
            if (inverseFeature) {
                const eContainer = this.eInternalContainer()
                if (isEObjectInternal(eContainer))
                    return eContainer.eInverseRemove(this, inverseFeature.getFeatureID(), notifications)
            }
        }
        return notifications
    }

    eObjectForFragmentSegment(uriSegment: string): EObject {
        const lastIndex = uriSegment.length - 1
        if (lastIndex == -1 || uriSegment[0] != "@") {
            throw new Error("Expecting @ at index 0 of '" + uriSegment + "'")
        }

        let index = -1
        if (uriSegment && uriSegment.length > 0 && isNumeric(uriSegment.charAt(uriSegment.length - 1))) {
            index = uriSegment.lastIndexOf(".")
            if (index != -1) {
                const pos = parseInt(uriSegment.slice(index + 1))
                const eFeatureName = uriSegment.slice(1, index)
                const eFeature = this.getStructuralFeatureFromName(eFeatureName)
                const list = this.eGetResolve(eFeature, false) as EList<EObject>
                if (pos < list.size()) {
                    return list.get(pos)
                }
            }
        }
        if (index == -1) {
            const eFeature = this.getStructuralFeatureFromName(uriSegment.slice(1))
            return this.eGetResolve(eFeature, false) as EObject
        }
        return null
    }

    eURIFragmentSegment(feature: EStructuralFeature, o: EObject): string {
        let s = "@"
        s += feature.getName()
        if (feature.isMany()) {
            const v = this.eGetResolve(feature, false)
            const i = (v as EList<EObject>).indexOf(o)
            s += "." + i.toString()
        }
        return s
    }

    private getStructuralFeatureFromName(featureName: string): EStructuralFeature {
        const eFeature = this.eClass().getEStructuralFeatureFromName(featureName)
        if (!eFeature) {
            throw new Error("The feature " + featureName + " is not a valid feature")
        }
        return eFeature
    }
}
