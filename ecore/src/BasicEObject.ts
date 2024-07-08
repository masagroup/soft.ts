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
    AbstractENotifierList,
    AbstractEObject,
    EAdapter,
    EClass,
    EList,
    ENotification,
    EObject,
    EObjectList,
    EResource,
    EStructuralFeature,
    ImmutableEList,
    URI
} from "./internal.js"

type getFeatureFnType = (c: EClass) => EList<EStructuralFeature>

abstract class AbstractContentsList extends ImmutableEList<EObject> implements EObjectList<EObject> {
    protected _obj: BasicEObject
    protected _getFeatureFn: getFeatureFnType
    private _initialized = false
    private _resolve = false

    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType, resolve: boolean) {
        super()
        this._obj = obj
        this._getFeatureFn = getFeatureFn
        this._resolve = resolve
    }

    get(index: number): EObject {
        this.initialize()
        return super.get(index)
    }

    contains(e: EObject): boolean {
        this.initialize()
        return super.indexOf(e) != -1
    }

    indexOf(e: EObject): number {
        this.initialize()
        return super.indexOf(e)
    }

    isEmpty(): boolean {
        this.initialize()
        return super.isEmpty()
    }

    size(): number {
        this.initialize()
        return super.size()
    }

    toArray(): EObject[] {
        this.initialize()
        return super.toArray()
    }

    [Symbol.iterator](): Iterator<EObject, any, undefined> {
        this.initialize()
        return super[Symbol.iterator]()
    }

    abstract getUnResolvedList(): EList<EObject>

    private initialize(): void {
        if (this._initialized) return

        this._initialized = true
        let features = this._getFeatureFn(this._obj.eClass())
        for (const feature of features) {
            if (this._obj.eIsSet(feature)) {
                let value = this._obj.eGetResolve(feature, this._resolve)
                if (feature.isMany) {
                    let l = value as EList<EObject>
                    this._v.push(...l.toArray())
                } else if (value != null) {
                    this._v.push(value)
                }
            }
        }
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

class ContentsListAdapter extends AbstractEAdapter {
    private _obj: BasicEObject
    private _getFeatureFn: getFeatureFnType
    private _list: EList<EObject>

    constructor(obj: BasicEObject, getFeatureFn: getFeatureFnType) {
        super()
        this._obj = obj
        this._getFeatureFn = getFeatureFn
        obj.eAdapters.add(this)
    }

    notifyChanged(notification: ENotification): void {
        if (this._list) {
            let features = this._getFeatureFn(this._obj.eClass())
            if (features.contains(notification.feature)) delete this._list
        }
    }

    getList(): EList<EObject> {
        if (!this._list) this._list = new ResolvedContentsList(this._obj, this._getFeatureFn)
        return this._list
    }
}

export class BasicEObject extends AbstractEObject {
    private _eResource: EResource = null
    private _eContainer: EObject = null
    private _eContainerFeatureID: number = -1
    private _eProxyURI: URI = null
    private _contentsListAdapter: ContentsListAdapter = null
    private _crossReferencesListAdapter: ContentsListAdapter = null
    private _adapters: EList<EAdapter> = null
    private _deliver: boolean = true

    get eAdapters(): EList<EAdapter> {
        if (!this._adapters) {
            this._adapters = new AbstractENotifierList(this)
        }
        return this._adapters
    }

    get eDeliver(): boolean {
        return this._deliver
    }

    set eDeliver(deliver: boolean) {
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
        if (!this._contentsListAdapter)
            this._contentsListAdapter = new ContentsListAdapter(this, function (c: EClass): EList<EStructuralFeature> {
                return c.eContainmentFeatures
            })
        return this._contentsListAdapter.getList()
    }

    eCrossReferences(): EList<EObject> {
        if (!this._crossReferencesListAdapter)
            this._crossReferencesListAdapter = new ContentsListAdapter(this, function (
                c: EClass
            ): EList<EStructuralFeature> {
                return c.eCrossReferenceFeatures
            })
        return this._crossReferencesListAdapter.getList()
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
