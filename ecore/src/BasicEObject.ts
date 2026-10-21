// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractENotifierList,
    AbstractEObject,
    EAdapter,
    EClass,
    EList,
    EObject,
    EObjectList,
    EResource,
    EStructuralFeature,
    ImmutableEList,
    isEObjectList,
    URI
} from "./internal.js"

type getFeatureFnType = (c: EClass) => EList<EStructuralFeature>

// live view of the values of the features returned by getFeatureFn: nothing is cached,
// so no adapter is needed to keep it up to date
abstract class AbstractContentsList extends ImmutableEList<EObject> implements EObjectList<EObject> {
    protected _obj: BasicEObject
    protected _getFeatureFn: getFeatureFnType
    private _resolve = false

    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType, resolve: boolean) {
        super()
        this._obj = obj
        this._getFeatureFn = getFeatureFn
        this._resolve = resolve
    }

    get(index: number): EObject {
        if (index >= 0) {
            let i = index
            for (const feature of this._getFeatureFn(this._obj.eClass())) {
                if (this._obj.eIsSet(feature)) {
                    if (feature.isMany()) {
                        const l = this.getList(feature)
                        const size = l.size()
                        if (i < size) {
                            return l.get(i)
                        }
                        i -= size
                    } else {
                        const value = this._obj.eGetResolve(feature, this._resolve)
                        if (value != null) {
                            if (i == 0) {
                                return value
                            }
                            i--
                        }
                    }
                }
            }
        }
        return undefined
    }

    contains(e: EObject): boolean {
        return this.indexOf(e) != -1
    }

    indexOf(e: EObject): number {
        return this.toArray().indexOf(e)
    }

    isEmpty(): boolean {
        for (const feature of this._getFeatureFn(this._obj.eClass())) {
            if (this._obj.eIsSet(feature)) {
                if (feature.isMany()) {
                    if (!this.getList(feature).isEmpty()) {
                        return false
                    }
                } else if (this._obj.eGetResolve(feature, false) != null) {
                    return false
                }
            }
        }
        return true
    }

    size(): number {
        let size = 0
        for (const feature of this._getFeatureFn(this._obj.eClass())) {
            if (this._obj.eIsSet(feature)) {
                if (feature.isMany()) {
                    size += this.getList(feature).size()
                } else if (this._obj.eGetResolve(feature, false) != null) {
                    size++
                }
            }
        }
        return size
    }

    toArray(): EObject[] {
        const v: EObject[] = []
        for (const feature of this._getFeatureFn(this._obj.eClass())) {
            if (this._obj.eIsSet(feature)) {
                if (feature.isMany()) {
                    v.push(...this.getList(feature).toArray())
                } else {
                    const value = this._obj.eGetResolve(feature, this._resolve)
                    if (value != null) {
                        v.push(value)
                    }
                }
            }
        }
        return v
    }

    [Symbol.iterator](): Iterator<EObject, any, undefined> {
        return this.toArray()[Symbol.iterator]()
    }

    abstract getUnResolvedList(): EList<EObject>

    private getList(feature: EStructuralFeature): EList<EObject> {
        const l = this._obj.eGetResolve(feature, this._resolve) as EList<EObject>
        return !this._resolve && isEObjectList<EObject>(l) ? l.getUnResolvedList() : l
    }
}

class ResolvedContentsList extends AbstractContentsList {
    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType) {
        super(obj, getFeatureFn, true)
    }

    getUnResolvedList(): EList<EObject> {
        return new UnResolvedContentsList(this._obj, this._getFeatureFn)
    }
}

class UnResolvedContentsList extends AbstractContentsList {
    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType) {
        super(obj, getFeatureFn, false)
    }

    getUnResolvedList(): EList<EObject> {
        return this
    }
}

function getContainmentFeatures(c: EClass): EList<EStructuralFeature> {
    return c.getEContainmentFeatures()
}

function getCrossReferenceFeatures(c: EClass): EList<EStructuralFeature> {
    return c.getECrossReferenceFeatures()
}

export class BasicEObject extends AbstractEObject {
    private _eResource: EResource = null
    private _eContainer: EObject = null
    private _eContainerFeatureID: number = -1
    private _eProxyURI: URI = null
    private _eContentsList: EList<EObject> = null
    private _eCrossReferencesList: EList<EObject> = null
    private _adapters: EList<EAdapter> = null
    private _deliver: boolean = true

    eAdapters(): EList<EAdapter> {
        if (!this._adapters) {
            this._adapters = new AbstractENotifierList(this)
        }
        return this._adapters
    }

    eDeliver(): boolean {
        return this._deliver
    }

    eSetDeliver(deliver: boolean) {
        this._deliver = deliver
    }

    eBasicAdapters(): EList<EAdapter> {
        return this._adapters
    }

    eInternalContainer(): EObject {
        return this._eContainer
    }

    eInternalContainerFeatureID(): number {
        return this._eContainerFeatureID
    }

    eInternalResource(): EResource {
        return this._eResource
    }

    eSetInternalResource(eResource: EResource): void {
        this._eResource = eResource
    }

    eSetInternalContainer(container: EObject, containerFeatureID: number): void {
        this._eContainer = container
        this._eContainerFeatureID = containerFeatureID
    }

    eContents(): EList<EObject> {
        if (!this._eContentsList) this._eContentsList = new ResolvedContentsList(this, getContainmentFeatures)
        return this._eContentsList
    }

    eCrossReferences(): EList<EObject> {
        if (!this._eCrossReferencesList) this._eCrossReferencesList = new ResolvedContentsList(this, getCrossReferenceFeatures)
        return this._eCrossReferencesList
    }

    eIsProxy(): boolean {
        return this._eProxyURI != null
    }

    eProxyURI(): URI {
        return this._eProxyURI
    }

    eSetProxyURI(uri: URI): void {
        this._eProxyURI = uri
    }
}
