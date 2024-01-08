// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EClass,
    EList,
    ENotificationChain,
    EObject,
    EResource,
    EStructuralFeature,
} from "./internal";

export interface EDynamicProperties {
    eDynamicGet(dynamicFeatureID: number): any;
    eDynamicSet(dynamicFeatureID: number, newValue: any): void;
    eDynamicUnset(dynamicFeatureID: number): void;
}

export interface EObjectInternal extends EObject {
    eStaticClass(): EClass;

    eDynamicProperties(): EDynamicProperties;

    eInternalResource(): EResource;
    eInternalContainer(): EObject;
    eInternalContainerFeatureID(): number;
    eSetInternalContainer(container: EObject, containerFeatureID: number): void;
    eSetInternalResource(resource: EResource): void;
    eSetResource(resource: EResource, notifications: ENotificationChain): ENotificationChain;

    eInverseAdd(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain,
    ): ENotificationChain;

    eInverseRemove(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain,
    ): ENotificationChain;

    eDerivedFeatureID(container: EObject, featureID: number): number;

    eDerivedOperationID(container: EObject, operationID: number): number;

    eGetFromID(featureID: number, resolve: boolean, core: boolean): any;

    eSetFromID(featureID: number, newValue: any): void;

    eUnsetFromID(featureID: number): void;

    eIsSetFromID(featureID: number): boolean;

    eInvokeFromID(operationID: number, args: EList<any>): any;

    eBasicInverseAdd(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain,
    ): ENotificationChain;

    eBasicInverseRemove(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain,
    ): ENotificationChain;

    eObjectForFragmentSegment(fragment: string): EObject;

    eURIFragmentSegment(feature: EStructuralFeature, o: EObject): string;

    eProxyURI(): URL;

    eSetProxyURI(uri: URL): void;

    eResolveProxy(proxy: EObject): EObject;
}

export function isEObject(o: any): o is EObject {
    return o == undefined ? undefined : typeof o["eClass"] === "function";
}
export function isEObjectInternal(o: any): o is EObjectInternal {
    return o == undefined ? undefined : isEObject(o) && typeof o["eStaticClass"] === "function";
}
