// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EClassImpl } from "./EClassImpl";
import { EClass } from "./EClass";
import { EStructuralFeature } from "./EStructuralFeature";
import { EOperation } from "./EOperation";
import { EList } from "./EList";
import { isEReference, isEAttribute } from "./BasicEObject";
import { ImmutableEList } from "./ImmutableEList";
import { EAttribute } from "./EAttribute";
import { EReference } from "./EReference";

export class EClassExt extends EClassImpl {
    private _nameToFeatureMap: Map<string, EStructuralFeature>;
    private _operationToOverrideMap: Map<EOperation, EOperation>;
    private _containmentFeatures: EList<EStructuralFeature>;
    private _crossReferenceFeatures: EList<EStructuralFeature>;
    constructor() {
        super();
    }

    isSuperTypeOf(someClass: EClass): boolean {
        return someClass == this || (someClass != null && someClass.eAllSuperTypes.contains(this));
    }

    getFeatureCount(): number {
        return this.eAllStructuralFeatures.size();
    }

    getEStructuralFeature(featureID: number): EStructuralFeature {
        return featureID >= 0 && featureID < this.eAllStructuralFeatures.size()
            ? this.eAllStructuralFeatures.get(featureID)
            : null;
    }

    getEStructuralFeatureFromName(featureName: string): EStructuralFeature {
        this.initNameToFeatureMap();
        return this._nameToFeatureMap.get(featureName);
    }

    getFeatureID(feature: EStructuralFeature): number {
        let featureID = feature.featureID;
        if (featureID != -1) {
            for (; featureID < this.eAllStructuralFeatures.size(); featureID++) {
                if (this.eAllStructuralFeatures.get(featureID) == feature) return featureID;
            }
        }
        return -1;
    }

    getOperationCount(): number {
        return this.eAllOperations.size();
    }

    getOperation(operationID: number): EOperation {
        return operationID >= 0 && operationID < this.eAllOperations.size()
            ? this.eAllOperations.get(operationID)
            : null;
    }

    getOperationID(operation: EOperation): number {
        let operationID = operation.operationID;
        if (operationID != -1) {
            for (; operationID < this.eAllOperations.size(); operationID++) {
                if (this.eAllOperations.get(operationID) == operation) return operationID;
            }
        }
        return -1;
    }

    getOverride(operation: EOperation): EOperation {
        this.initOperationToOverrideMap();
        return this._operationToOverrideMap.get(operation);
    }

    protected initEAttributes(): void {
        this.initEAllAttributes();
    }

    protected initEReferences(): void {
        this.initEAllReferences();
    }

    protected initEContainmentFeatures(): void {
        this.initFeatureSubSet();
    }

    protected initECrossReferenceFeatures(): void {
        this.initFeatureSubSet();
    }

    private initNameToFeatureMap(): void {
        if (this._nameToFeatureMap != null) {
            return;
        }

        this._nameToFeatureMap = new Map<string, EStructuralFeature>();
        for (const eFeature of this.eAllStructuralFeatures) {
            this._nameToFeatureMap.set(eFeature.name, eFeature);
        }
    }

    private initOperationToOverrideMap(): void {
        if (this._operationToOverrideMap != null) {
            return;
        }

        let size = this.eAllOperations.size();
        this._operationToOverrideMap = new Map<EOperation, EOperation>();
        for (let i = 0; i < size; i++) {
            for (let j = size - 1; j > i; j--) {
                let oi = this.eAllOperations.get(i);
                let oj = this.eAllOperations.get(i);
                if (oj.isOverrideOf(oi)) {
                    this._operationToOverrideMap.set(oi, oj);
                }
            }
        }
    }

    private initFeatureSubSet(): void {
        this.initEAllStructuralFeatures();

        if (this._containmentFeatures != null) {
            return;
        }

        let containments: EStructuralFeature[] = [];
        let crossreferences: EStructuralFeature[] = [];
        for (const eFeature of this.eStructuralFeatures) {
            if (isEReference(eFeature)) {
                if (eFeature.isContainment) {
                    if (!eFeature.isDerived) {
                        containments.push(eFeature);
                    }
                } else if (!eFeature.isContainer) {
                    if (!eFeature.isDerived) {
                        crossreferences.push(eFeature);
                    }
                }
            }
        }

        this._eContainmentFeatures = new ImmutableEList<EStructuralFeature>(containments);
        this._eCrossReferenceFeatures = new ImmutableEList<EStructuralFeature>(crossreferences);
    }

    protected initEAllAttributes() : void {
        if ( this._eAllAttributes != null ) {
            return;
        }

        let attributes : EAttribute[] = [];
        let allAttributes : EAttribute[] = [];
        let eIDAttribute : EAttribute = null;
        for (const eSuperType of this.eSuperTypes ) {
            for (const eAttribute of eSuperType.eAllAttributes) {
                allAttributes.push(eAttribute);
                if (eAttribute.isID && this._eIDAttribute == null )
                    eIDAttribute = eAttribute;
            }
        }

        for (const eFeature of this.eStructuralFeatures) {
            if ( isEAttribute(eFeature) ) {
                attributes.push(eFeature);
                allAttributes.push(eFeature);
                if (eFeature.isID && this._eIDAttribute == null )
                    eIDAttribute = eFeature;
            }
        }

        this._eIDAttribute = eIDAttribute;
        this._eAttributes = new ImmutableEList<EAttribute>(attributes);
        this._eAllAttributes = new ImmutableEList<EAttribute>(allAttributes);
    }

    protected initEAllReferences() : void {
        if (this._eAllReferences != null ) {
            return;
        }

        let references : EReference[] = [];
        let allReferences : EReference[] = [];
        for (const eSuperType of this.eSuperTypes ) {
            allReferences.push(...eSuperType.eAllReferences.toArray());
        }

        for (const eFeature of this.eStructuralFeatures ) {
            if ( isEReference(eFeature) ) {
                references.push(eFeature);
                allReferences.push(eFeature);
            }
        }

        this._eReferences = new ImmutableEList<EReference>(references);
        this._eAllReferences = new ImmutableEList<EReference>(allReferences);
    }
}
