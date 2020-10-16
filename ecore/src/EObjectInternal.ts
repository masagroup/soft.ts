// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import {
    EObject,
    EClass,
    EResource,
    ENotificationChain,
    EList,
    EStructuralFeature,
} from "./internal";

export interface EObjectInternal extends EObject {
    eStaticClass(): EClass;

    eInternalResource(): EResource;
    eInternalContainer(): EObject;

    eSetResource(resource: EResource, notifications: ENotificationChain): ENotificationChain;

    eInverseAdd(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain
    ): ENotificationChain;

    eInverseRemove(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain
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
        notifications: ENotificationChain
    ): ENotificationChain;

    eBasicInverseRemove(
        otherEnd: EObject,
        featureID: number,
        notifications: ENotificationChain
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
