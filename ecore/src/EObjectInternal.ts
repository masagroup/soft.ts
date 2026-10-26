// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClass, EList, ENotificationChain, EObject, EResource, EStructuralFeature, URI } from "./internal.js"

// NIL is the value a single-valued feature set to null keeps in the EDynamicProperties that tell it
// from an unset feature (EMF DynamicValueHolder.NIL): an unsettable feature, or an attribute whose
// default value is not null. AbstractEObject gives it to the dynamic properties that keep it
// (eDynamicKeepsNil), DynamicEObjectImpl; the store-backed ones get null, and their store tells
// whether the feature is set.
export const NIL: unique symbol = Symbol("NIL")

export interface EDynamicProperties {
    eDynamicGet(dynamicFeatureID: number): any
    eDynamicSet(dynamicFeatureID: number, newValue: any): void
    eDynamicUnset(dynamicFeatureID: number): void
    eDynamicIsSet?(dynamicFeatureID: number): boolean
    // eDynamicKeepsNil returns true when the properties keep NIL, the value of a feature set to null
    eDynamicKeepsNil?(): boolean
}

export interface EObjectInternal extends EObject {
    eStaticClass(): EClass

    eDynamicProperties(): EDynamicProperties

    eInternalResource(): EResource
    eInternalContainer(): EObject
    eInternalContainerFeatureID(): number
    eSetInternalContainer(container: EObject, containerFeatureID: number): void
    eSetInternalResource(resource: EResource): void
    eSetResource(resource: EResource, notifications: ENotificationChain): ENotificationChain

    eInverseAdd(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain
    eInverseRemove(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain
    eBasicInverseAdd(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain
    eBasicInverseRemove(otherEnd: EObject, featureID: number, notifications: ENotificationChain): ENotificationChain

    eDerivedFeatureID(container: EObject, featureID: number): number
    eDerivedOperationID(container: EObject, operationID: number): number

    eGetFromID(featureID: number, resolve: boolean, core: boolean): any
    eGetFromIDAsync(featureID: number, resolve: boolean, core: boolean): Promise<any>
    eSetFromID(featureID: number, newValue: any): void
    eUnsetFromID(featureID: number): void
    eIsSetFromID(featureID: number): boolean
    eInvokeFromID(operationID: number, args: EList<any>): any

    eObjectForFragmentSegment(fragment: string): EObject
    eURIFragmentSegment(feature: EStructuralFeature, o: EObject): string

    eProxyURI(): URI
    eSetProxyURI(uri: URI): void
    eResolveProxy(proxy: EObject): EObject
    eResolveProxyAsync(proxy: EObject): Promise<EObject>
}

export function isEObject(o: any): o is EObject {
    return typeof o === "object" && o !== null && "eClass" in o
}
export function isEObjectInternal(o: any): o is EObjectInternal {
    return typeof o === "object" && o !== null && isEObject(o) && "eStaticClass" in o
}
