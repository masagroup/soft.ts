// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractEAdapter,
    EAttribute,
    EClass,
    EClassifier,
    EClassImpl,
    EcoreConstants,
    ENotification,
    EOperation,
    EReference,
    EStructuralFeature,
    EventType,
    ImmutableEList,
    isEAttribute,
    isEReference
} from "./internal.js"

export function isEClass(c: EClassifier): c is EClass {
     return c == undefined ? undefined : "isAbstract" in c
}

class ESuperAdapter extends AbstractEAdapter {
    constructor(private _eClass: EClassExt) {
        super()
    }

    notifyChanged(notification: ENotification): void {
        let eventType = notification.getEventType()
        let notifier = notification.getNotifier() as EClassExt
        if (eventType != EventType.REMOVING_ADAPTER) {
            if (notification.getFeatureID() == EcoreConstants.ECLASS__ESUPER_TYPES) {
                switch (eventType) {
                    case EventType.SET:
                    case EventType.RESOLVE: {
                        if (notification.getOldValue() != null) {
                            let eClass = notification.getOldValue() as EClassExt
                            let index = eClass._subClasses.findIndex((c) => c == notifier)
                            if (index != -1) eClass._subClasses.splice(index, 1)
                        }
                        if (notification.getNewValue() != null) {
                            let eClass = notification.getNewValue() as EClassExt
                            eClass._subClasses.push(notifier)
                        }
                        break
                    }
                    case EventType.ADD: {
                        if (notification.getNewValue() != null) {
                            let eClass = notification.getNewValue() as EClassExt
                            eClass._subClasses.push(notifier)
                        }
                        break
                    }
                    case EventType.ADD_MANY: {
                        if (notification.getNewValue() != null) {
                            let classes = notification.getNewValue() as EClassExt[]
                            for (const cls of classes) {
                                cls._subClasses.push(notifier)
                            }
                        }
                        break
                    }
                    case EventType.REMOVE: {
                        if (notification.getOldValue() != null) {
                            let eClass = notification.getOldValue() as EClassExt
                            for (const [i, subClass] of eClass._subClasses.entries()) {
                                if (subClass == notifier) {
                                    eClass._subClasses.splice(i, 1)
                                    break
                                }
                            }
                        }
                        break
                    }
                    case EventType.REMOVE_MANY: {
                        if (notification.getOldValue() != null) {
                            let classes = notification.getOldValue() as EClassExt[]
                            for (const eClass of classes) {
                                for (const [i, subClass] of eClass._subClasses.entries()) {
                                    if (subClass == notifier) {
                                        eClass._subClasses.splice(i, 1)
                                        break
                                    }
                                }
                            }
                        }
                        break
                    }
                }
            }
            this._eClass.setModified(notification.getFeatureID())
        }
    }
}

export class EClassExt extends EClassImpl {
    private _nameToFeatureMap: Map<string, EStructuralFeature>
    private _operationToOverrideMap: Map<EOperation, EOperation>
    private _adapter: ESuperAdapter
    public _subClasses: EClassExt[] = []

    constructor() {
        super()
        this._adapter = new ESuperAdapter(this)
        this.eAdapters().add(this._adapter)
    }

    isSuperTypeOf(someClass: EClass): boolean {
        return someClass == this || (someClass != null && someClass.getEAllSuperTypes().contains(this))
    }

    getFeatureCount(): number {
        return this.getEAllStructuralFeatures().size()
    }

    getEStructuralFeature(featureID: number): EStructuralFeature {
        return featureID >= 0 && featureID < this.getEAllStructuralFeatures().size()
            ? this.getEAllStructuralFeatures().get(featureID)
            : null
    }

    getEStructuralFeatureFromName(featureName: string): EStructuralFeature {
        this.initNameToFeatureMap()
        return this._nameToFeatureMap.get(featureName)
    }

    getFeatureID(feature: EStructuralFeature): number {
        let features = this.getEAllStructuralFeatures()
        let featureID = feature.getFeatureID()
        if (featureID != -1) {
            for (; featureID < features.size(); featureID++) {
                if (features.get(featureID) == feature) return featureID
            }
        }
        return -1
    }

    getOperationCount(): number {
        return this.getEAllOperations().size()
    }

    getEOperation(operationID: number): EOperation {
        return operationID >= 0 && operationID < this.getEAllOperations().size()
            ? this.getEAllOperations().get(operationID)
            : null
    }

    getOperationID(operation: EOperation): number {
        let operationID = operation.getOperationID()
        if (operationID != -1) {
            for (; operationID < this.getEAllOperations().size(); operationID++) {
                if (this.getEAllOperations().get(operationID) == operation) return operationID
            }
        }
        return -1
    }

    getOverride(operation: EOperation): EOperation {
        this.initOperationToOverrideMap()
        return this._operationToOverrideMap.get(operation)
    }

    protected initEAttributes(): void {
        this.initEAllAttributes()
    }

    protected initEReferences(): void {
        this.initEAllReferences()
    }

    protected initEContainmentFeatures(): void {
        this.initFeatureSubSet()
    }

    protected initECrossReferenceFeatures(): void {
        this.initFeatureSubSet()
    }

    private initNameToFeatureMap(): void {
        if (this._nameToFeatureMap != null) {
            return
        }
        this.initEAllStructuralFeatures()
        this._nameToFeatureMap = new Map<string, EStructuralFeature>()
        for (const eFeature of this.getEAllStructuralFeatures()) {
            this._nameToFeatureMap.set(eFeature.getName(), eFeature)
        }
    }

    private initOperationToOverrideMap(): void {
        if (this._operationToOverrideMap != null) {
            return
        }
        this.initEAllOperations()
        let size = this.getEAllOperations().size()
        this._operationToOverrideMap = new Map<EOperation, EOperation>()
        for (let i = 0; i < size; i++) {
            for (let j = size - 1; j > i; j--) {
                let oi = this.getEAllOperations().get(i)
                let oj = this.getEAllOperations().get(j)
                if (oj.isOverrideOf(oi)) {
                    this._operationToOverrideMap.set(oi, oj)
                }
            }
        }
    }

    private initFeatureSubSet(): void {
        if (this._eContainmentFeatures != null) {
            return
        }

        this.initEAllStructuralFeatures()
        let containments: EStructuralFeature[] = []
        let crossreferences: EStructuralFeature[] = []
        for (const eFeature of this.getEStructuralFeatures()) {
            if (isEReference(eFeature)) {
                if (eFeature.isContainment()) {
                    if (!eFeature.isDerived()) {
                        containments.push(eFeature)
                    }
                } else if (!eFeature.isContainer()) {
                    if (!eFeature.isDerived()) {
                        crossreferences.push(eFeature)
                    }
                }
            }
        }

        this._eContainmentFeatures = new ImmutableEList<EStructuralFeature>(containments)
        this._eCrossReferenceFeatures = new ImmutableEList<EStructuralFeature>(crossreferences)
    }

    protected initEAllAttributes(): void {
        if (this._eAllAttributes != null) {
            return
        }

        let attributes: EAttribute[] = []
        let allAttributes: EAttribute[] = []
        let eIDAttribute: EAttribute = null
        for (const eSuperType of this.getESuperTypes()) {
            for (const eAttribute of eSuperType.getEAllAttributes()) {
                allAttributes.push(eAttribute)
                if (eAttribute.isID() && !eIDAttribute) {
                    eIDAttribute = eAttribute
                }
            }
        }

        for (const eFeature of this.getEStructuralFeatures()) {
            if (isEAttribute(eFeature)) {
                attributes.push(eFeature)
                allAttributes.push(eFeature)
                if (eFeature.isID() && !eIDAttribute) {
                    eIDAttribute = eFeature
                }
            }
        }

        this._eIDAttribute = eIDAttribute
        this._eAttributes = new ImmutableEList<EAttribute>(attributes)
        this._eAllAttributes = new ImmutableEList<EAttribute>(allAttributes)
    }

    protected initEAllReferences(): void {
        if (this._eAllReferences != null) {
            return
        }

        let references: EReference[] = []
        let allReferences: EReference[] = []
        for (const eSuperType of this.getESuperTypes()) {
            allReferences.push(...eSuperType.getEAllReferences().toArray())
        }

        for (const eFeature of this.getEStructuralFeatures()) {
            if (isEReference(eFeature)) {
                references.push(eFeature)
                allReferences.push(eFeature)
            }
        }

        this._eReferences = new ImmutableEList<EReference>(references)
        this._eAllReferences = new ImmutableEList<EReference>(allReferences)
    }

    protected initEAllContainments(): void {
        if (this._eAllContainments != null) {
            return
        }

        let allContainments: EReference[] = []
        for (const eReference of this.getEAllReferences()) {
            if (eReference.isContainment()) {
                allContainments.push(eReference)
            }
        }

        this._eAllContainments = new ImmutableEList<EReference>(allContainments)
    }

    protected initEAllOperations(): void {
        if (this._eAllOperations != null) {
            return
        }

        this._operationToOverrideMap = null

        let allOperations: EOperation[] = []
        for (const eSuperType of this.getESuperTypes()) {
            allOperations.push(...eSuperType.getEAllOperations().toArray())
        }

        let operationID = allOperations.length
        for (const eOperation of this.getEOperations()) {
            eOperation.setOperationID(operationID++)
            allOperations.push(eOperation)
        }

        this._eAllOperations = new ImmutableEList<EOperation>(allOperations)
    }

    protected initEAllStructuralFeatures(): void {
        if (this._eAllStructuralFeatures != null) {
            return
        }

        this._eCrossReferenceFeatures = null
        this._eContainmentFeatures = null
        this._nameToFeatureMap = null

        let allFeatures: EStructuralFeature[] = []
        for (const eSuperType of this.getESuperTypes()) {
            allFeatures.push(...eSuperType.getEAllStructuralFeatures().toArray())
        }

        let featureID = allFeatures.length
        for (const eFeature of this.getEStructuralFeatures()) {
            eFeature.setFeatureID(featureID++)
            allFeatures.push(eFeature)
        }

        this._eAllStructuralFeatures = new ImmutableEList<EStructuralFeature>(allFeatures)
    }

    protected initEAllSuperTypes(): void {
        if (this._eAllSuperTypes != null) {
            return
        }

        let allSuperTypes: EClass[] = []
        for (const eSuperType of this.getESuperTypes()) {
            allSuperTypes.push(...eSuperType.getEAllSuperTypes().toArray())
            allSuperTypes.push(eSuperType)
        }

        this._eAllSuperTypes = new ImmutableEList<EClass>(allSuperTypes)
    }

    protected initEIDAttribute(): void {
        this.initEAllAttributes()
    }

    setModified(featureID: number): void {
        switch (featureID) {
            case EcoreConstants.ECLASS__ESTRUCTURAL_FEATURES: {
                this._eAllAttributes = null
                this._eAllStructuralFeatures = null
                this._eAllReferences = null
                this._eAllContainments = null
                break
            }
            case EcoreConstants.ECLASS__EATTRIBUTES: {
                this._eAllAttributes = null
                this._eAllStructuralFeatures = null
                this._eAllContainments = null
                break
            }
            case EcoreConstants.ECLASS__EREFERENCES: {
                this._eAllStructuralFeatures = null
                this._eAllReferences = null
                this._eAllContainments = null
                break
            }
            case EcoreConstants.ECLASS__EOPERATIONS: {
                this._eAllOperations = null
                this._eAllContainments = null
                break
            }
            case EcoreConstants.ECLASS__ESUPER_TYPES: {
                this._eAllSuperTypes = null
                this._eAllAttributes = null
                this._eAllOperations = null
                this._eAllStructuralFeatures = null
                this._eAllReferences = null
                this._eAllContainments = null
                break
            }
        }
        for (const subClass of this._subClasses) {
            subClass.setModified(featureID)
        }
    }
}
