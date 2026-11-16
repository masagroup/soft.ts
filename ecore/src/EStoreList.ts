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
    checkSameImplementation,
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

// The flags of the feature of a store list, computed once when its state is made.
const OBJECT = 1 << 0
const CONTAINMENT = 1 << 1
const INVERSE = 1 << 2
const OPPOSITE = 1 << 3
const PROXIES = 1 << 4

function featureFlags(feature: EStructuralFeature): number {
    let flags = 0
    if (isEReference(feature)) {
        flags |= OBJECT
        const containment = feature.isContainment()
        const opposite = feature.getEOpposite() != null
        if (containment) flags |= CONTAINMENT
        if (containment || opposite) flags |= INVERSE
        if (opposite) flags |= OPPOSITE
        if (feature.isResolveProxies()) flags |= PROXIES
    }
    return flags
}

// EStoreListState is the state of a store list that the list does not change itself: its
// feature, the flags of the feature, its store and whether it caches its elements. A state is
// never changed once made: setEStore and setCache give the list a new one. It may be shared by
// many lists: see EStoreListSharedState.
class EStoreListState {
    constructor(
        readonly feature: EStructuralFeature,
        readonly flags: number,
        readonly store: EStore,
        readonly cache: boolean
    ) {}

    with(store: EStore, cache: boolean): EStoreListState {
        return new EStoreListState(this.feature, this.flags, store, cache)
    }
}

// EStoreListSharedState is the initial state of the lists of a feature of the objects of a store
// that don't cache their elements and seldom change, as the objects of a read-only view: the lists
// made with it (new EStoreList(owner, shared)) share it, its feature, the flags of the feature,
// its store and the cache, instead of holding a state of their own each. A list keeps it until
// setEStore or setCache gives it a state of its own; its elements and its changes are its own
// whatever its state. Make one per feature and store once the feature is complete: the flags of
// the feature are computed when it is made.
export type EStoreListSharedState = EStoreListState

// newEStoreListSharedState returns the initial state of the lists of feature in store, which must
// not be null.
export function newEStoreListSharedState(store: EStore, feature: EStructuralFeature): EStoreListSharedState {
    if (!store) {
        throw new Error("the shared state of store lists needs a store")
    }
    return new EStoreListState(feature, featureFlags(feature), store, false)
}

// EStoreList is the list of a many-valued feature of an object whose values are held by a store.
// With a cache, the list also keeps its elements: it reads them from the cache, and writes them to
// both. Without cache, every access goes to the store. Without store, the list keeps its elements
// itself. Its feature, store and cache are in its state, which the lists of a feature and a store
// can share (EStoreListSharedState): a list holds its owner, its state, its elements when it keeps
// them, and whether it is set.
export class EStoreList<E> extends AbstractNotifyingList<E> implements EObjectList<E>, EStoreProvider, ECacheProvider {
    private _owner: EObject
    private _s: EStoreListState

    constructor(owner: EObject, shared: EStoreListSharedState)
    constructor(owner: EObject, feature: EStructuralFeature, store: EStore, cache?: boolean)
    constructor(owner: EObject, featureOrShared: EStructuralFeature | EStoreListSharedState, store: EStore = null, cache: boolean = false) {
        super([])
        this._owner = owner
        if (featureOrShared instanceof EStoreListState) {
            this._s = featureOrShared
        } else {
            this._s = new EStoreListState(featureOrShared, featureFlags(featureOrShared), store, false)
        }
        this._isUnique = this._s.feature.isUnique()
        // a store and no cache: no data
        this._v = this._s.store ? null : []
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
        return this._s.feature
    }

    getFeatureID(): number {
        return this._owner.eClass().getFeatureID(this._s.feature)
    }

    protected isUnsettable(): boolean {
        return this._s.feature.isUnsettable()
    }

    // isSet returns true when the list is set (EUnsettableList): for an unsettable feature, as its
    // store tells, or without store when it changed since it was created or unset; else when it is
    // not empty.
    isSet(): boolean {
        if (this.isUnsettable() && this._s.store) {
            return this._s.store.isSet(this._owner, this._s.feature)
        }
        return super.isSet()
    }

    // unset clears the list (EUnsettableList) and, for an unsettable feature, unsets it in the store
    // and notifies UNSET, from the old set state to false.
    unset(): void {
        if (this.isUnsettable() && this._s.store) {
            this.clear()
            const oldIsSet = this.isSet()
            this._isSet = false
            this._s.store.unSet(this._owner, this._s.feature)
            this.createAndDispatchNotification(null, EventType.UNSET, oldIsSet, false)
        } else {
            super.unset()
        }
    }

    getEStore(): EStore {
        return this._s.store
    }

    setEStore(newStore: EStore): void {
        const state = this._s
        const oldStore = state.store
        if (oldStore !== newStore) {
            this._s = state.with(newStore, state.cache)
            if (!newStore) {
                // no more store: the list keeps its elements
                if (!state.cache) {
                    this._v = oldStore ? oldStore.toArray(this._owner, state.feature) : []
                }
            } else if (!state.cache) {
                this._v = null
            }
        }
    }

    setCache(cache: boolean): void {
        const state = this._s
        if (state.cache != cache) {
            this._s = state.with(state.store, cache)
            const store = state.store
            let data: E[]
            if (cache) {
                data = store ? store.toArray(this._owner, state.feature) : this._v
                this._v = data ?? []
            } else {
                data = this._v ?? []
                if (store) {
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
        return this._s.cache
    }

    size(): number {
        if (this._v) {
            return this._v.length
        }
        return this._s.store ? this._s.store.size(this._owner, this._s.feature) : 0
    }

    isEmpty(): boolean {
        return this.size() == 0
    }

    toArray(): E[] {
        if (this._v) {
            if ((this._s.flags & PROXIES) != 0) {
                for (let i = this._v.length - 1; i >= 0; i--) {
                    this.resolve(i, this._v[i])
                }
            }
            return this._v
        } else if (this._s.store) {
            const data = this._s.store.toArray(this._owner, this._s.feature) as E[]
            if ((this._s.flags & PROXIES) != 0) {
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
        } else if (this._s.store) {
            const result = this._s.store.indexOf(this._owner, this._s.feature, e)
            if (result >= 0) {
                return result
            }
            if (this.resolvesProxies()) {
                const size = this.size()
                for (let i = 0; i < size; i++) {
                    if (this.resolveProxy(this._s.store.get(this._owner, this._s.feature, i)) == e) {
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
            // a clear of an empty list sets an unsettable list, as EMF
            this.didChange()
            return
        }
        if (this._s.store) {
            this._s.store.clear(this._owner, this._s.feature)
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
                if (this._s.store) {
                    this._s.store.move(this._owner, this._s.feature, from, to, false)
                }
            }
        } else if (from != to) {
            e = this._s.store.move(this._owner, this._s.feature, from, to, true)
        } else {
            e = this._s.store.get(this._owner, this._s.feature, from)
        }
        if (from != to) {
            this.didMove(from, to, e)
            this.didChange()
            this.createAndDispatchNotification(null, EventType.MOVE, from, e, to)
        }
        return e
    }

    getUnResolvedList(): EList<E> {
        if (this.resolvesProxies()) {
            return new UnResolvedEStoreList<E>(this)
        }
        return this
    }

    // getRaw returns the element at index, without resolving it.
    getRaw(index: number): E {
        if (this._v) {
            return this._v[index]
        } else if (this._s.store) {
            return this._s.store.get(this._owner, this._s.feature, index)
        }
        return null
    }

    // getRawArray returns the elements, without resolving them.
    getRawArray(): E[] {
        if (this._v) {
            return [...this._v]
        } else if (this._s.store) {
            return this._s.store.toArray(this._owner, this._s.feature)
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
        if (this._s.store) {
            // the store gets its own copy: c belongs to the caller
            this._s.store.addAll(this._owner, this._s.feature, index, new ImmutableEList(elements))
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
        if (this._s.store) {
            this._s.store.add(this._owner, this._s.feature, index, e)
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
            if (this._s.store) {
                this._s.store.remove(this._owner, this._s.feature, index, false)
            }
        } else {
            oldObject = this._s.store.remove(this._owner, this._s.feature, index, true)
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
            if (this._s.store) {
                this._s.store.set(this._owner, this._s.feature, index, e, false)
            }
        } else {
            oldObject = this._s.store.set(this._owner, this._s.feature, index, e, true)
        }
        this.didSet(index, e, oldObject)
        this.didChange()
        return oldObject
    }

    protected inverseAdd(e: E, notifications: ENotificationChain): ENotificationChain {
        checkSameImplementation(this._owner, e)
        if ((this._s.flags & INVERSE) != 0 && isEObjectInternal(e)) {
            if ((this._s.flags & OPPOSITE) != 0) {
                const inverseReference = (this._s.feature as EReference).getEOpposite()
                const inverseFeatureID = e.eClass().getFeatureID(inverseReference)
                return e.eInverseAdd(this._owner, inverseFeatureID, notifications)
            } else {
                return e.eInverseAdd(this._owner, EOPPOSITE_FEATURE_BASE - this.getFeatureID(), notifications)
            }
        }
        return notifications
    }

    protected inverseRemove(e: E, notifications: ENotificationChain): ENotificationChain {
        if ((this._s.flags & INVERSE) != 0 && isEObjectInternal(e)) {
            if ((this._s.flags & OPPOSITE) != 0) {
                const inverseReference = (this._s.feature as EReference).getEOpposite()
                const inverseFeatureID = e.eClass().getFeatureID(inverseReference)
                return e.eInverseRemove(this._owner, inverseFeatureID, notifications)
            } else {
                return e.eInverseRemove(this._owner, EOPPOSITE_FEATURE_BASE - this.getFeatureID(), notifications)
            }
        }
        return notifications
    }

    private resolve(index: number, object: E): E {
        if (this.resolvesProxies()) {
            const resolved = this.resolveProxy(object)
            if (resolved != object) {
                // only the cache is updated: the store keeps the proxies
                if (this._v) {
                    this._v[index] = resolved
                }
                let notifications: ENotificationChain = null
                if ((this._s.flags & CONTAINMENT) != 0) {
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

    // resolvesProxies reports whether the elements are objects whose proxies the list resolves.
    private resolvesProxies(): boolean {
        return (this._s.flags & (OBJECT | PROXIES)) == (OBJECT | PROXIES)
    }

    private resolveProxy(e: E): E {
        const o = e as any as EObject
        if ((this._s.flags & PROXIES) != 0 && o && o.eIsProxy()) {
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
