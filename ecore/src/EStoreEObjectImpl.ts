// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    BasicEObjectMap,
    ECacheProvider,
    EClass,
    EDynamicProperties,
    EList,
    EMap,
    EObject,
    EObjectImpl,
    EOperation,
    EOPPOSITE_FEATURE_BASE,
    EStore,
    EStoreList,
    EStoreProvider,
    EStructuralFeature,
    isECacheProvider,
    isEReference,
    isMapType,
    NO_INDEX
} from "./internal.js"

// EStoreEObjectImpl is an object whose features are all reflective, and whose values are held by
// a store, when it has one: generated classes with reflective feature delegation extend it. It
// caches the values it reads from its store, until clearCache is called.
export class EStoreEObjectImpl extends EObjectImpl implements EDynamicProperties, EStoreProvider, ECacheProvider {
    private _store: EStore = null
    private _clz: EClass = null
    private _cache: boolean = true
    private _cachedValues: Map<number, any> = new Map()
    private _containerInitialized: boolean = false

    constructor() {
        super()
    }

    eClass(): EClass {
        return this._clz ?? this.eStaticClass()
    }

    setEClass(clz: EClass): void {
        this._clz = clz
    }

    eStaticFeatureCount(): number {
        return 0
    }

    eFeatureID(feature: EStructuralFeature): number {
        return this.eClass().getFeatureID(feature)
    }

    eOperationID(operation: EOperation): number {
        return this.eClass().getOperationID(operation)
    }

    eDynamicProperties(): EDynamicProperties {
        return this
    }

    getEStore(): EStore {
        return this._store
    }

    setEStore(store: EStore): void {
        this._store = store
    }

    setCache(cache: boolean): void {
        if (this._cache != cache) {
            this._cache = cache
            for (const v of this._cachedValues.values()) {
                if (isECacheProvider(v)) {
                    v.setCache(cache)
                }
            }
            if (!cache) {
                this.clearCache()
            }
        }
    }

    isCache(): boolean {
        return this._cache
    }

    // clearCache drops the cached values: they are read again from the store.
    clearCache(): void {
        this._cachedValues.clear()
    }

    eDynamicGet(dynamicFeatureID: number): any {
        let result = this._cachedValues.get(dynamicFeatureID)
        if (result === undefined || result === null) {
            let shouldCache = false
            const feature = this.eDynamicFeature(dynamicFeatureID)
            const store = feature.isTransient() ? null : this.getEStore()
            if (feature.isMany()) {
                result = isMapType(feature) ? this.eCreateMap(feature, store) : this.eCreateList(feature, store)
                shouldCache = true
            } else if (store) {
                result = store.get(this, feature, NO_INDEX)
                shouldCache = this._cache
            }
            if (shouldCache && result !== undefined && result !== null) {
                this._cachedValues.set(dynamicFeatureID, result)
            }
        }
        return result ?? null
    }

    eDynamicSet(dynamicFeatureID: number, newValue: any): void {
        const feature = this.eDynamicFeature(dynamicFeatureID)
        if (!feature.isTransient()) {
            const store = this.getEStore()
            if (store) {
                store.set(this, feature, NO_INDEX, newValue, false)
            }
        }
        if (this._cache || !this.getEStore() || feature.isTransient()) {
            this._cachedValues.set(dynamicFeatureID, newValue)
        }
    }

    eDynamicIsSet(dynamicFeatureID: number): boolean {
        const feature = this.eDynamicFeature(dynamicFeatureID)
        const store = feature.isTransient() ? null : this.getEStore()
        if (store) {
            return store.isSet(this, feature)
        }
        const value = this._cachedValues.get(dynamicFeatureID)
        if (feature.isMany()) {
            return value != null && !(value as EList<any>).isEmpty()
        }
        return value != null
    }

    eDynamicUnset(dynamicFeatureID: number): void {
        this._cachedValues.delete(dynamicFeatureID)
        const feature = this.eDynamicFeature(dynamicFeatureID)
        if (!feature.isTransient()) {
            const store = this.getEStore()
            if (store) {
                store.unSet(this, feature)
            }
        }
    }

    // eCreateList creates the list of a many-valued feature, held by store when there is one.
    protected eCreateList(feature: EStructuralFeature, store: EStore): EList<any> {
        return new EStoreList<any>(this, feature, store, this._cache)
    }

    // eCreateMap creates the map of a map feature. Maps are kept in memory: they are not held by
    // the store.
    protected eCreateMap(feature: EStructuralFeature, store: EStore): EMap<any, any> {
        const eClass = feature.getEType() as EClass
        let reverseFeatureID = -1
        if (isEReference(feature)) {
            const reverseFeature = feature.getEOpposite()
            if (reverseFeature != null) {
                reverseFeatureID = reverseFeature.getFeatureID()
            }
        }
        return new BasicEObjectMap<any, any>(eClass, this, feature.getFeatureID(), reverseFeatureID, feature.isUnsettable())
    }

    eInternalContainer(): EObject {
        this.initializeContainerFromStore()
        return super.eInternalContainer()
    }

    eInternalContainerFeatureID(): number {
        this.initializeContainerFromStore()
        return super.eInternalContainerFeatureID()
    }

    eSetInternalContainer(container: EObject, containerFeatureID: number): void {
        super.eSetInternalContainer(container, containerFeatureID)
        this._containerInitialized = true
        this.setContainerInStore(container, containerFeatureID)
    }

    private eDynamicFeature(dynamicFeatureID: number): EStructuralFeature {
        return this.eClass().getEStructuralFeature(this.eStaticFeatureCount() + dynamicFeatureID)
    }

    private initializeContainerFromStore(): void {
        if (this._containerInitialized) {
            return
        }
        this._containerInitialized = true
        const store = this.getEStore()
        if (store) {
            const [container, feature] = store.getContainer(this)
            if (container && feature) {
                let featureID = EOPPOSITE_FEATURE_BASE - container.eClass().getFeatureID(feature)
                if (isEReference(feature)) {
                    const opposite = feature.getEOpposite()
                    if (opposite) {
                        featureID = this.eClass().getFeatureID(opposite)
                    }
                }
                super.eSetInternalContainer(container, featureID)
            }
        }
    }

    private setContainerInStore(container: EObject, containerFeatureID: number): void {
        const store = this.getEStore()
        if (store) {
            let containerFeature: EStructuralFeature = null
            if (container) {
                if (containerFeatureID <= EOPPOSITE_FEATURE_BASE) {
                    containerFeature = container.eClass().getEStructuralFeature(EOPPOSITE_FEATURE_BASE - containerFeatureID)
                } else {
                    const feature = this.eClass().getEStructuralFeature(containerFeatureID)
                    containerFeature = isEReference(feature) ? feature.getEOpposite() : null
                }
            }
            store.setContainer(this, container, containerFeature)
        }
    }

    // isCached returns whether a value of the feature is cached, for the tests.
    protected isCached(dynamicFeatureID: number): boolean {
        return this._cachedValues.has(dynamicFeatureID)
    }
}

export function isEStoreEObject(o: any): o is EStoreEObjectImpl {
    return o instanceof EStoreEObjectImpl
}
