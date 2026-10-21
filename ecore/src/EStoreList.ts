// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractEList,
    AbstractNotifyingList,
    Collection,
    ECacheProvider,
    EList,
    ENotificationChain,
    ENotifier,
    EObject,
    EObjectInternal,
    EObjectList,
    EOPPOSITE_FEATURE_BASE,
    EReference,
    EStore,
    EStoreProvider,
    EStructuralFeature,
    EventType,
    ImmutableEList,
    isECacheProvider,
    isEObjectInternal,
    isEReference,
    NotificationChain
} from "./internal.js"

// EStoreList is the list of a many-valued feature of an object whose values are held by a store.
// With a cache, the list also keeps its elements: it reads them from the cache, and writes them to
// both. Without cache, every access goes to the store. Without store, the list keeps its elements
// itself.
export class EStoreList<E> extends AbstractNotifyingList<E> implements EObjectList<E>, EStoreProvider, ECacheProvider {
    private _owner: EObject
    private _feature: EStructuralFeature
    private _store: EStore
    private _cache: boolean
    private _object: boolean = false
    private _containment: boolean = false
    private _inverse: boolean = false
    private _opposite: boolean = false
    private _proxies: boolean = false
    private _unset: boolean = false

    constructor(owner: EObject, feature: EStructuralFeature, store: EStore, cache: boolean = false) {
        super([])
        this._isUnique = feature.isUnique()
        this._owner = owner
        this._feature = feature
        this._store = store
        this._cache = false
        // a store and no cache: no data
        this._v = store ? null : []
        if (isEReference(feature)) {
            this._object = true
            this._containment = feature.isContainment()
            this._proxies = feature.isResolveProxies()
            this._unset = feature.isUnsettable()
            const reverseFeature = feature.getEOpposite()
            this._inverse = this._containment || reverseFeature != null
            this._opposite = reverseFeature != null
        }
        if (cache) {
            this.setCache(true)
        }
    }

    getOwner(): EObject {
        return this._owner
    }

    getNotifier(): ENotifier {
        return this._owner
    }

    getFeature(): EStructuralFeature {
        return this._feature
    }

    getFeatureID(): number {
        return this._owner.eClass().getFeatureID(this._feature)
    }

    getEStore(): EStore {
        return this._store
    }

    setEStore(newStore: EStore): void {
        const oldStore = this._store
        if (oldStore !== newStore) {
            this._store = newStore
            if (!newStore) {
                // no more store: the list keeps its elements
                if (!this._cache) {
                    this._v = oldStore ? oldStore.toArray(this._owner, this._feature) : []
                }
            } else if (!this._cache) {
                this._v = null
            }
        }
    }

    setCache(cache: boolean): void {
        if (this._cache != cache) {
            this._cache = cache
            let data: E[]
            if (cache) {
                data = this._store ? this._store.toArray(this._owner, this._feature) : this._v
                this._v = data ?? []
            } else {
                data = this._v ?? []
                if (this._store) {
                    this._v = null
                }
            }
            for (const v of data ?? []) {
                if (isECacheProvider(v)) {
                    v.setCache(cache)
                }
            }
        }
    }

    isCache(): boolean {
        return this._cache
    }

    size(): number {
        if (this._v) {
            return this._v.length
        }
        return this._store ? this._store.size(this._owner, this._feature) : 0
    }

    isEmpty(): boolean {
        return this.size() == 0
    }

    toArray(): E[] {
        if (this._v) {
            if (this._proxies) {
                for (let i = this._v.length - 1; i >= 0; i--) {
                    this.resolve(i, this._v[i])
                }
            }
            return this._v
        } else if (this._store) {
            const data = this._store.toArray(this._owner, this._feature) as E[]
            if (this._proxies) {
                for (let i = data.length - 1; i >= 0; i--) {
                    data[i] = this.resolve(i, data[i])
                }
            }
            return data
        }
        return []
    }

    indexOf(e: E): number {
        if (this._v) {
            for (let i = 0; i < this._v.length; i++) {
                const value = this._v[i]
                if (value == e || this.resolve(i, value) == e) {
                    return i
                }
            }
        } else if (this._store) {
            const result = this._store.indexOf(this._owner, this._feature, e)
            if (result >= 0) {
                return result
            }
            if (this._object && this._proxies) {
                const size = this.size()
                for (let i = 0; i < size; i++) {
                    if (this.resolveProxy(this._store.get(this._owner, this._feature, i)) == e) {
                        return i
                    }
                }
            }
        }
        return -1
    }

    clear(): void {
        const elements = this.getRawArray()
        if (elements.length == 0) {
            return
        }
        if (this._store) {
            this._store.clear(this._owner, this._feature)
        }
        if (this._v) {
            this._v = []
        }
        this.didClear(elements)
        this.didChange()
        let notifications: ENotificationChain = new NotificationChain()
        for (const e of elements) {
            notifications = this.inverseRemove(e, notifications)
        }
        if (elements.length == 1) {
            this.createAndDispatchNotification(notifications, EventType.REMOVE, elements[0], null, 0)
        } else {
            this.createAndDispatchNotification(notifications, EventType.REMOVE_MANY, elements, null, -1)
        }
    }

    removeAt(index: number): E {
        const size = this.size()
        if (index < 0 || index >= size) throw new RangeError("Index out of bounds: index=" + index + " size=" + size)
        const oldObject = this.basicRemove(index)
        const notifications = this.inverseRemove(oldObject, null)
        this.createAndDispatchNotification(notifications, EventType.REMOVE, oldObject, null, index)
        return oldObject
    }

    moveTo(from: number, to: number): E {
        const size = this.size()
        if (from < 0 || from >= size || to < 0 || to >= size) {
            throw new RangeError("Index out of bounds: from=" + from + " to=" + to + " size=" + size)
        }
        let e: E
        if (this._v) {
            e = this._v[from]
            if (from != to) {
                this._v.splice(from, 1)
                this._v.splice(to, 0, e)
                if (this._store) {
                    this._store.move(this._owner, this._feature, from, to, false)
                }
            }
        } else if (from != to) {
            e = this._store.move(this._owner, this._feature, from, to, true)
        } else {
            e = this._store.get(this._owner, this._feature, from)
        }
        if (from != to) {
            this.didMove(from, to, e)
            this.didChange()
            this.createAndDispatchNotification(null, EventType.MOVE, from, e, to)
        }
        return e
    }

    getUnResolvedList(): EList<E> {
        if (this._object && this._proxies) {
            return new UnResolvedEStoreList<E>(this)
        }
        return this
    }

    // getRaw returns the element at index, without resolving it.
    getRaw(index: number): E {
        if (this._v) {
            return this._v[index]
        } else if (this._store) {
            return this._store.get(this._owner, this._feature, index)
        }
        return null
    }

    // getRawArray returns the elements, without resolving them.
    getRawArray(): E[] {
        if (this._v) {
            return [...this._v]
        } else if (this._store) {
            return this._store.toArray(this._owner, this._feature)
        }
        return []
    }

    protected doGet(index: number): E {
        return this.resolve(index, this.getRaw(index))
    }

    protected doAdd(e: E): void {
        this.doInsert(this.size(), e)
    }

    protected doAddAll(c: Collection<E>): boolean {
        return this.doInsertAll(this.size(), c)
    }

    protected doInsert(index: number, e: E): void {
        this.basicInsert(index, e)
        const notifications = this.inverseAdd(e, null)
        this.createAndDispatchNotification(notifications, EventType.ADD, null, e, index)
    }

    protected doInsertAll(index: number, c: Collection<E>): boolean {
        if (c.isEmpty()) {
            return false
        }
        const elements = c.toArray()
        if (this._v) {
            this._v.splice(index, 0, ...elements)
        }
        if (this._store) {
            // the store gets its own copy: c belongs to the caller
            this._store.addAll(this._owner, this._feature, index, new ImmutableEList(elements))
        }
        for (let i = 0; i < elements.length; i++) {
            this.didAdd(index + i, elements[i])
            this.didChange()
        }
        let notifications: ENotificationChain = new NotificationChain()
        for (const e of elements) {
            notifications = this.inverseAdd(e, notifications)
        }
        if (elements.length == 1) {
            this.createAndDispatchNotification(notifications, EventType.ADD, null, elements[0], index)
        } else {
            this.createAndDispatchNotification(notifications, EventType.ADD_MANY, null, elements, index)
        }
        return true
    }

    protected doSet(index: number, newObject: E): E {
        const oldObject = this.basicSet(index, newObject)
        if (newObject != oldObject) {
            let notifications: ENotificationChain = null
            notifications = this.inverseRemove(oldObject, notifications)
            notifications = this.inverseAdd(newObject, notifications)
            this.createAndDispatchNotification(notifications, EventType.SET, oldObject, newObject, index)
        }
        return oldObject
    }

    // perform* are used by addWithNotification, removeWithNotification and setWithNotification

    protected performAdd(e: E): void {
        this.basicInsert(this.size(), e)
    }

    protected performInsert(index: number, e: E): void {
        this.basicInsert(index, e)
    }

    protected performRemove(index: number): E {
        return this.basicRemove(index)
    }

    protected performSet(index: number, e: E): E {
        return this.basicSet(index, e)
    }

    // basicInsert inserts e at index in the cache and the store, without notification.
    protected basicInsert(index: number, e: E): void {
        if (this._v) {
            this._v.splice(index, 0, e)
        }
        if (this._store) {
            this._store.add(this._owner, this._feature, index, e)
        }
        this.didAdd(index, e)
        this.didChange()
    }

    // basicRemove removes the element at index from the cache and the store, without
    // notification, and returns it.
    protected basicRemove(index: number): E {
        let oldObject: E
        if (this._v) {
            oldObject = this._v[index]
            this._v.splice(index, 1)
            if (this._store) {
                this._store.remove(this._owner, this._feature, index, false)
            }
        } else {
            oldObject = this._store.remove(this._owner, this._feature, index, true)
        }
        this.didRemove(index, oldObject)
        this.didChange()
        return oldObject
    }

    // basicSet sets e at index in the cache and the store, without notification, and returns the
    // element replaced.
    protected basicSet(index: number, e: E): E {
        let oldObject: E
        if (this._v) {
            oldObject = this._v[index]
            this._v[index] = e
            if (this._store) {
                this._store.set(this._owner, this._feature, index, e, false)
            }
        } else {
            oldObject = this._store.set(this._owner, this._feature, index, e, true)
        }
        this.didSet(index, e, oldObject)
        this.didChange()
        return oldObject
    }

    protected inverseAdd(e: E, notifications: ENotificationChain): ENotificationChain {
        if (this._inverse && isEObjectInternal(e)) {
            if (this._opposite) {
                const inverseReference = (this._feature as EReference).getEOpposite()
                const inverseFeatureID = e.eClass().getFeatureID(inverseReference)
                return e.eInverseAdd(this._owner, inverseFeatureID, notifications)
            } else {
                return e.eInverseAdd(this._owner, EOPPOSITE_FEATURE_BASE - this.getFeatureID(), notifications)
            }
        }
        return notifications
    }

    protected inverseRemove(e: E, notifications: ENotificationChain): ENotificationChain {
        if (this._inverse && isEObjectInternal(e)) {
            if (this._opposite) {
                const inverseReference = (this._feature as EReference).getEOpposite()
                const inverseFeatureID = e.eClass().getFeatureID(inverseReference)
                return e.eInverseRemove(this._owner, inverseFeatureID, notifications)
            } else {
                return e.eInverseRemove(this._owner, EOPPOSITE_FEATURE_BASE - this.getFeatureID(), notifications)
            }
        }
        return notifications
    }

    private resolve(index: number, object: E): E {
        if (this._object && this._proxies) {
            const resolved = this.resolveProxy(object)
            if (resolved != object) {
                // only the cache is updated: the store keeps the proxies
                if (this._v) {
                    this._v[index] = resolved
                }
                let notifications: ENotificationChain = null
                if (this._containment) {
                    notifications = this.inverseRemove(object, notifications)
                    if (isEObjectInternal(resolved) && resolved.eInternalContainer() == null) {
                        notifications = this.inverseAdd(resolved, notifications)
                    }
                }
                this.createAndDispatchNotification(notifications, EventType.RESOLVE, object, resolved, index)
            }
            return resolved
        }
        return object
    }

    private resolveProxy(e: E): E {
        const o = e as any as EObject
        if (this._proxies && o && o.eIsProxy()) {
            return (this._owner as EObjectInternal).eResolveProxy(o) as any as E
        }
        return e
    }
}

// UnResolvedEStoreList is the view of an EStoreList whose elements are not resolved.
class UnResolvedEStoreList<E> extends AbstractEList<E> implements EObjectList<E> {
    constructor(private _delegate: EStoreList<E>) {
        super(true)
    }

    getUnResolvedList(): EList<E> {
        return this
    }

    size(): number {
        return this._delegate.size()
    }

    toArray(): E[] {
        return this._delegate.getRawArray()
    }

    removeAt(index: number): E {
        return this._delegate.removeAt(index)
    }

    moveTo(from: number, to: number): E {
        return this._delegate.moveTo(from, to)
    }

    clear(): void {
        this._delegate.clear()
    }

    protected doGet(index: number): E {
        return this._delegate.getRaw(index)
    }

    protected doAdd(e: E): void {
        this._delegate.add(e)
    }

    protected doAddAll(c: Collection<E>): boolean {
        return this._delegate.addAll(c)
    }

    protected doInsert(index: number, e: E): void {
        this._delegate.insert(index, e)
    }

    protected doInsertAll(index: number, c: Collection<E>): boolean {
        return this._delegate.insertAll(index, c)
    }

    protected doSet(index: number, e: E): E {
        return this._delegate.set(index, e)
    }
}
