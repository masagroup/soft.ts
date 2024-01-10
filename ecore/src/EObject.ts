// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClass, EList, ENotifier, EOperation, EReference, EResource, EStructuralFeature } from "./internal";

export interface EObject extends ENotifier {
    // Operations
    eClass(): EClass;
    eIsProxy(): boolean;
    eResource(): EResource;
    eContainer(): EObject;
    eContainingFeature(): EStructuralFeature;
    eContainmentFeature(): EReference;
    eContents(): EList<EObject>;
    eAllContents(): IterableIterator<EObject>;
    eCrossReferences(): EList<EObject>;
    eGet(feature: EStructuralFeature): any;
    eGetResolve(feature: EStructuralFeature, resolve: boolean): any;
    eSet(feature: EStructuralFeature, newValue: any): void;
    eIsSet(feature: EStructuralFeature): boolean;
    eUnset(feature: EStructuralFeature): void;
    eInvoke(operation: EOperation, args: EList<any>): any;
}
