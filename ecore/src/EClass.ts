// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EAttribute, EClassifier, EList, EOperation, EReference, EStructuralFeature } from "./internal"

export interface EClass extends EClassifier {
    // Attributes
    isAbstract: boolean
    isInterface: boolean

    // References
    readonly eStructuralFeatures: EList<EStructuralFeature>
    readonly eAttributes: EList<EAttribute>
    readonly eReferences: EList<EReference>
    readonly eSuperTypes: EList<EClass>
    readonly eOperations: EList<EOperation>
    readonly eContainmentFeatures: EList<EStructuralFeature>
    readonly eCrossReferenceFeatures: EList<EStructuralFeature>
    readonly eAllAttributes: EList<EAttribute>
    readonly eAllReferences: EList<EReference>
    readonly eAllContainments: EList<EReference>
    readonly eAllCrossReferences: EList<EReference>
    readonly eAllOperations: EList<EOperation>
    readonly eAllStructuralFeatures: EList<EStructuralFeature>
    readonly eAllSuperTypes: EList<EClass>
    readonly eIDAttribute: EAttribute

    // Operations
    isSuperTypeOf(someClass: EClass): boolean
    getFeatureCount(): number
    getEStructuralFeature(featureID: number): EStructuralFeature
    getEStructuralFeatureFromName(featureName: string): EStructuralFeature
    getFeatureID(feature: EStructuralFeature): number
    getOperationCount(): number
    getEOperation(operationID: number): EOperation
    getOperationID(operation: EOperation): number
    getOverride(operation: EOperation): EOperation
    getFeatureType(feature: EStructuralFeature): EClassifier
}
