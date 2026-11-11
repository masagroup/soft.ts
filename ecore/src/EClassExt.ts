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

export function isEClass(c: any): c is EClass {
    return typeof c === "object" && c !== null && "isAbstract" in c
}

// EClassModifiable is a class whose derived values a change of its features, operations or super
// types invalidates, in the class and in its sub classes: an attribute that becomes, or stops
// being, the ID of its class invalidates the attributes of the class (EAttributeExt.setID).
// Internal to the package: index.ts does not export it.
export interface EClassModifiable {
    setModified(featureID: number): void
}

// EClassSubClasses is a class that knows its sub classes, to invalidate their derived values with
// its own. The super types adapter registers a class with its super types (addSubClass,
// removeSubClass). The values are built the other way, from the super types. Internal to the
// package: index.ts does not export it.
export interface EClassSubClasses extends EClassModifiable {
    getSubClasses(): readonly EClassExt[]
    addSubClass(subClass: EClassExt): void
    removeSubClass(subClass: EClassExt): void
}

class ESuperAdapter extends AbstractEAdapter {
    constructor(private _eClass: EClassExt) {
        super()
    }

    notifyChanged(notification: ENotification): void {
        const eventType = notification.getEventType()
        if (eventType != EventType.REMOVING_ADAPTER) {
            if (notification.getFeatureID() == EcoreConstants.ECLASS__ESUPER_TYPES) {
                const notifier = notification.getNotifier() as EClassExt
                switch (eventType) {
                    case EventType.SET:
                    case EventType.RESOLVE:
                    case EventType.ADD:
                    case EventType.REMOVE: {
                        const oldSuperType = notification.getOldValue() as EClassSubClasses
                        if (oldSuperType != null) {
                            oldSuperType.removeSubClass(notifier)
                        }
                        const newSuperType = notification.getNewValue() as EClassSubClasses
                        if (newSuperType != null) {
                            newSuperType.addSubClass(notifier)
                        }
                        break
                    }
                    case EventType.ADD_MANY: {
                        const newSuperTypes = notification.getNewValue() as EClassSubClasses[]
                        for (const superType of newSuperTypes ?? []) {
                            superType.addSubClass(notifier)
                        }
                        break
                    }
                    case EventType.REMOVE_MANY: {
                        const oldSuperTypes = notification.getOldValue() as EClassSubClasses[]
                        for (const superType of oldSuperTypes ?? []) {
                            superType.removeSubClass(notifier)
                        }
                        break
                    }
                }
            }
            this._eClass.setModified(notification.getFeatureID())
        }
    }
}

// removes the duplicates of a, keeping the first occurrence of each element
function uniqueInPlace<T>(a: T[]): void {
    if (a.length < 2) {
        return
    }
    const seen = new Set<T>()
    let n = 0
    for (const e of a) {
        if (!seen.has(e)) {
            seen.add(e)
            a[n++] = e
        }
    }
    a.length = n
}

// the values derived from the super types of a class whose build is in progress, bits of
// EClassExt._building
const BUILDING_SUPER_TYPES = 1 << 0
const BUILDING_ATTRIBUTES = 1 << 1
const BUILDING_REFERENCES = 1 << 2
const BUILDING_OPERATIONS = 1 << 3
const BUILDING_STRUCTURAL_FEATURES = 1 << 4

export class EClassExt extends EClassImpl implements EClassSubClasses {
    // the derived values whose build is in progress (BUILDING_*): a class among its own super
    // types, directly or through other classes, is an invalid model, but nothing refuses it. The
    // build of a value of such a class reaches the build of the same value of the class, which
    // contributes nothing more and is not built again: its getter returns null, to the builds of
    // its sub classes only (the builds are synchronous), as EMF ends its computations of the
    // classes in progress. The super types loops below skip a null value.
    private _building = 0
    private _eAllStructuralFeaturesArray: EStructuralFeature[] = []
    private _nameToFeatureMap: Map<string, EStructuralFeature>
    private _operationToOverrideMap: Map<EOperation, EOperation>
    private _adapter: ESuperAdapter
    private _subClasses: EClassExt[] = []

    constructor() {
        super()
        this._adapter = new ESuperAdapter(this)
        this.eAdapters().add(this._adapter)
    }

    isSuperTypeOf(someClass: EClass): boolean {
        return someClass == this || (someClass != null && someClass.getEAllSuperTypes().contains(this))
    }

    // features returns all the features of the class as an array: the lookups by ID read it
    // without going through the list
    private features(): readonly EStructuralFeature[] {
        if (this._eAllStructuralFeatures == null && this.getEAllStructuralFeatures() == null) {
            // a cycle of super types: the features are being built
            return []
        }
        return this._eAllStructuralFeaturesArray
    }

    getFeatureCount(): number {
        return this.features().length
    }

    getEStructuralFeature(featureID: number): EStructuralFeature {
        const features = this.features()
        return featureID >= 0 && featureID < features.length ? features[featureID] : null
    }

    getEStructuralFeatureFromName(featureName: string): EStructuralFeature {
        this.initNameToFeatureMap()
        return this._nameToFeatureMap.get(featureName)
    }

    getFeatureID(feature: EStructuralFeature): number {
        const features = this.features()
        let featureID = feature.getFeatureID()
        if (featureID != -1) {
            for (; featureID < features.length; featureID++) {
                if (features[featureID] == feature) return featureID
            }
        }
        return -1
    }

    getOperationCount(): number {
        return this.getEAllOperations().size()
    }

    getEOperation(operationID: number): EOperation {
        return operationID >= 0 && operationID < this.getEAllOperations().size() ? this.getEAllOperations().get(operationID) : null
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
        // recomputing all structural features resets the map, so it must come first: a
        // modification of a super type invalidates the features, not the map
        this.initEAllStructuralFeatures()
        if (this._nameToFeatureMap != null) {
            return
        }
        this._nameToFeatureMap = new Map<string, EStructuralFeature>()
        for (const eFeature of this.getEAllStructuralFeatures()) {
            this._nameToFeatureMap.set(eFeature.getName(), eFeature)
        }
    }

    private initOperationToOverrideMap(): void {
        // recomputing all operations resets the map, so it must come first
        this.initEAllOperations()
        if (this._operationToOverrideMap != null) {
            return
        }
        const size = this.getEAllOperations().size()
        this._operationToOverrideMap = new Map<EOperation, EOperation>()
        for (let i = 0; i < size; i++) {
            for (let j = size - 1; j > i; j--) {
                const oi = this.getEAllOperations().get(i)
                const oj = this.getEAllOperations().get(j)
                if (oj.isOverrideOf(oi)) {
                    this._operationToOverrideMap.set(oi, oj)
                }
            }
        }
    }

    private initFeatureSubSet(): void {
        // recomputing all structural features resets the subsets, so it must come first
        this.initEAllStructuralFeatures()
        if (this._eContainmentFeatures != null) {
            return
        }

        // like EMF's EClassImpl, the subsets are computed from all structural features,
        // inherited ones included, so that eContents / eCrossReferences visit inherited references
        const containments: EStructuralFeature[] = []
        const crossreferences: EStructuralFeature[] = []
        for (const eFeature of this._eAllStructuralFeatures) {
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
        if (this._eAllAttributes != null || this._building & BUILDING_ATTRIBUTES) {
            return
        }
        this._building |= BUILDING_ATTRIBUTES
        try {
            const attributes: EAttribute[] = []
            const allAttributes: EAttribute[] = []
            let eIDAttribute: EAttribute = null
            for (const eSuperType of this.getESuperTypes()) {
                for (const eAttribute of eSuperType.getEAllAttributes() ?? []) {
                    allAttributes.push(eAttribute)
                    if (eAttribute.isID() && !eIDAttribute) {
                        eIDAttribute = eAttribute
                    }
                }
            }
            uniqueInPlace(allAttributes)

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
        } finally {
            this._building &= ~BUILDING_ATTRIBUTES
        }
    }

    protected initEAllReferences(): void {
        if (this._eAllReferences != null || this._building & BUILDING_REFERENCES) {
            return
        }
        this._building |= BUILDING_REFERENCES
        try {
            const references: EReference[] = []
            const allReferences: EReference[] = []
            for (const eSuperType of this.getESuperTypes()) {
                const superValues = eSuperType.getEAllReferences()
                if (superValues) {
                    allReferences.push(...superValues.toArray())
                }
            }
            uniqueInPlace(allReferences)

            for (const eFeature of this.getEStructuralFeatures()) {
                if (isEReference(eFeature)) {
                    references.push(eFeature)
                    allReferences.push(eFeature)
                }
            }

            this._eReferences = new ImmutableEList<EReference>(references)
            this._eAllReferences = new ImmutableEList<EReference>(allReferences)
        } finally {
            this._building &= ~BUILDING_REFERENCES
        }
    }

    protected initEAllContainments(): void {
        if (this._eAllContainments != null) {
            return
        }

        const allContainments: EReference[] = []
        for (const eReference of this.getEAllReferences()) {
            if (eReference.isContainment()) {
                allContainments.push(eReference)
            }
        }

        this._eAllContainments = new ImmutableEList<EReference>(allContainments)
    }

    protected initEAllCrossReferences(): void {
        if (this._eAllCrossReferences != null) {
            return
        }

        const allCrossReferences: EReference[] = []
        for (const eReference of this.getEAllReferences()) {
            if (!eReference.isContainment() && !eReference.isContainer()) {
                allCrossReferences.push(eReference)
            }
        }

        this._eAllCrossReferences = new ImmutableEList<EReference>(allCrossReferences)
    }

    protected initEAllOperations(): void {
        if (this._eAllOperations != null || this._building & BUILDING_OPERATIONS) {
            return
        }
        this._building |= BUILDING_OPERATIONS
        try {
            this._operationToOverrideMap = null

            const allOperations: EOperation[] = []
            for (const eSuperType of this.getESuperTypes()) {
                const superValues = eSuperType.getEAllOperations()
                if (superValues) {
                    allOperations.push(...superValues.toArray())
                }
            }
            uniqueInPlace(allOperations)

            let operationID = allOperations.length
            for (const eOperation of this.getEOperations()) {
                eOperation.setOperationID(operationID++)
                allOperations.push(eOperation)
            }

            this._eAllOperations = new ImmutableEList<EOperation>(allOperations)
        } finally {
            this._building &= ~BUILDING_OPERATIONS
        }
    }

    protected initEAllStructuralFeatures(): void {
        if (this._eAllStructuralFeatures != null || this._building & BUILDING_STRUCTURAL_FEATURES) {
            return
        }
        this._building |= BUILDING_STRUCTURAL_FEATURES
        try {
            this._eCrossReferenceFeatures = null
            this._eContainmentFeatures = null
            this._nameToFeatureMap = null

            const allFeatures: EStructuralFeature[] = []
            for (const eSuperType of this.getESuperTypes()) {
                const superValues = eSuperType.getEAllStructuralFeatures()
                if (superValues) {
                    allFeatures.push(...superValues.toArray())
                }
            }
            // a feature inherited through several super types (diamond) is kept once
            uniqueInPlace(allFeatures)

            let featureID = allFeatures.length
            for (const eFeature of this.getEStructuralFeatures()) {
                eFeature.setFeatureID(featureID++)
                allFeatures.push(eFeature)
            }

            this._eAllStructuralFeaturesArray = allFeatures
            this._eAllStructuralFeatures = new ImmutableEList<EStructuralFeature>(allFeatures)
        } finally {
            this._building &= ~BUILDING_STRUCTURAL_FEATURES
        }
    }

    protected initEAllSuperTypes(): void {
        if (this._eAllSuperTypes != null || this._building & BUILDING_SUPER_TYPES) {
            return
        }
        this._building |= BUILDING_SUPER_TYPES
        try {
            const allSuperTypes: EClass[] = []
            for (const eSuperType of this.getESuperTypes()) {
                const superTypes = eSuperType.getEAllSuperTypes()
                if (superTypes) {
                    allSuperTypes.push(...superTypes.toArray())
                }
                allSuperTypes.push(eSuperType)
            }
            uniqueInPlace(allSuperTypes)

            this._eAllSuperTypes = new ImmutableEList<EClass>(allSuperTypes)
        } finally {
            this._building &= ~BUILDING_SUPER_TYPES
        }
    }

    protected initEIDAttribute(): void {
        this.initEAllAttributes()
    }

    getSubClasses(): readonly EClassExt[] {
        return this._subClasses
    }

    addSubClass(subClass: EClassExt): void {
        this._subClasses.push(subClass)
    }

    // removeSubClass removes subClass once: a class may list a super type twice
    removeSubClass(subClass: EClassExt): void {
        const index = this._subClasses.indexOf(subClass)
        if (index != -1) {
            this._subClasses.splice(index, 1)
        }
    }

    // setModified invalidates the values derived from featureID, in this class and its sub classes
    setModified(featureID: number): void {
        this.setModifiedFrom(featureID, null)
    }

    // setModifiedFrom is setModified in a sub class, visited holding the classes invalidated
    // already by this modification: a class inheriting from the modified one through several super
    // types (a diamond) or through a cycle of super types is invalidated once, and the recursion
    // ends. A lattice of diamonds no longer costs a number of visits exponential in its depth.
    private setModifiedFrom(featureID: number, visited: Set<EClassExt>): void {
        if (visited) {
            if (visited.has(this)) {
                return
            }
            visited.add(this)
        }
        switch (featureID) {
            case EcoreConstants.ECLASS__ESTRUCTURAL_FEATURES: {
                this._eAllAttributes = null
                this._eAllStructuralFeatures = null
                this._eAllReferences = null
                this._eAllContainments = null
                this._eAllCrossReferences = null
                break
            }
            case EcoreConstants.ECLASS__EATTRIBUTES: {
                this._eAllAttributes = null
                this._eAllStructuralFeatures = null
                this._eAllContainments = null
                this._eAllCrossReferences = null
                break
            }
            case EcoreConstants.ECLASS__EREFERENCES: {
                this._eAllStructuralFeatures = null
                this._eAllReferences = null
                this._eAllContainments = null
                this._eAllCrossReferences = null
                break
            }
            case EcoreConstants.ECLASS__EOPERATIONS: {
                this._eAllOperations = null
                this._eAllContainments = null
                this._eAllCrossReferences = null
                break
            }
            case EcoreConstants.ECLASS__ESUPER_TYPES: {
                this._eAllSuperTypes = null
                this._eAllAttributes = null
                this._eAllOperations = null
                this._eAllStructuralFeatures = null
                this._eAllReferences = null
                this._eAllContainments = null
                this._eAllCrossReferences = null
                break
            }
        }
        if (this._subClasses.length > 0) {
            if (!visited) {
                visited = new Set<EClassExt>([this])
            }
            for (const subClass of this._subClasses) {
                subClass.setModifiedFrom(featureID, visited)
            }
        }
    }
}
