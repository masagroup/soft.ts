// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import {
    AbstractEAdapter,
    EClass,
    EList,
    ENotification,
    EObject,
    EResourceImpl,
    EResourceSetImpl,
    EStore,
    EStructuralFeature,
    getEcoreFactory,
    getEcorePackage,
    HybridEObjectImpl,
    ImmutableEList,
    isHybridEObject,
    NO_INDEX,
    URI
} from "./internal.js"

// CountingStore is an EStore keeping the values in maps, counting the reads of single values.
class CountingStore implements EStore {
    values = new Map<EObject, Map<EStructuralFeature, any>>()
    gets = 0

    private featureValues(object: EObject): Map<EStructuralFeature, any> {
        let m = this.values.get(object)
        if (!m) {
            m = new Map()
            this.values.set(object, m)
        }
        return m
    }
    private list(object: EObject, feature: EStructuralFeature): any[] {
        const m = this.featureValues(object)
        if (!m.has(feature)) {
            m.set(feature, [])
        }
        return m.get(feature)
    }
    get(object: EObject, feature: EStructuralFeature, index: number): any {
        if (index == NO_INDEX) {
            this.gets++
            const m = this.featureValues(object)
            return m.has(feature) ? m.get(feature) : feature.getDefaultValue()
        }
        return this.list(object, feature)[index]
    }
    set(object: EObject, feature: EStructuralFeature, index: number, value: any): any {
        if (index == NO_INDEX) {
            const m = this.featureValues(object)
            const old = m.get(feature)
            m.set(feature, value)
            return old
        }
        const l = this.list(object, feature)
        const old = l[index]
        l[index] = value
        return old
    }
    isSet(object: EObject, feature: EStructuralFeature): boolean {
        return this.featureValues(object).has(feature)
    }
    unSet(object: EObject, feature: EStructuralFeature): void {
        this.featureValues(object).delete(feature)
    }
    isEmpty(object: EObject, feature: EStructuralFeature): boolean {
        return this.list(object, feature).length == 0
    }
    size(object: EObject, feature: EStructuralFeature): number {
        return this.list(object, feature).length
    }
    contains(object: EObject, feature: EStructuralFeature, value: any): boolean {
        return this.list(object, feature).includes(value)
    }
    indexOf(object: EObject, feature: EStructuralFeature, value: any): number {
        return this.list(object, feature).indexOf(value)
    }
    lastIndexOf(object: EObject, feature: EStructuralFeature, value: any): number {
        return this.list(object, feature).lastIndexOf(value)
    }
    add(object: EObject, feature: EStructuralFeature, index: number, value: any): void {
        this.list(object, feature).splice(index, 0, value)
    }
    addAll(object: EObject, feature: EStructuralFeature, index: number, c: any): boolean {
        this.list(object, feature).splice(index, 0, ...c)
        return true
    }
    remove(object: EObject, feature: EStructuralFeature, index: number): any {
        return this.list(object, feature).splice(index, 1)[0]
    }
    move(object: EObject, feature: EStructuralFeature, sourceIndex: number, targetIndex: number): any {
        const l = this.list(object, feature)
        const [v] = l.splice(sourceIndex, 1)
        l.splice(targetIndex, 0, v)
        return v
    }
    clear(object: EObject, feature: EStructuralFeature): void {
        this.featureValues(object).set(feature, [])
    }
    toArray(object: EObject, feature: EStructuralFeature): any[] {
        return [...this.list(object, feature)]
    }
    containers = new Map<EObject, [EObject, EStructuralFeature]>()
    getContainer(object: EObject): [EObject, EStructuralFeature] {
        return this.containers.get(object) ?? [null, null]
    }
    setContainer(object: EObject, container: EObject, feature: EStructuralFeature): void {
        this.containers.set(object, [container, feature])
    }
    addRoot(): void {}
    removeRoot(): void {}
    getRoots(): EObject[] {
        return []
    }
}

// hybridClass is a class of a name, a count, a reference and a list of names.
const hybridClass: EClass = (() => {
    const f = getEcoreFactory()
    const c = f.createEClass()
    c.setName("Hybrid")
    const name = f.createEAttribute()
    name.setName("name")
    name.setEType(getEcorePackage().getEString())
    const count = f.createEAttribute()
    count.setName("count")
    count.setEType(getEcorePackage().getEInt())
    const ref = f.createEReference()
    ref.setName("ref")
    ref.setEType(getEcorePackage().getEObject())
    const items = f.createEAttribute()
    items.setName("items")
    items.setUpperBound(-1)
    items.setEType(getEcorePackage().getEString())
    c.getEStructuralFeatures().addAll(new ImmutableEList<EStructuralFeature>([name, count, ref, items]))
    return c
})()

const NAME = 0
const COUNT = 1
const REF = 2
const ITEMS = 3

// HybridTest is a class as soft.gen generates it with storage=hybrid.
class HybridTest extends HybridEObjectImpl {
    private _h0 = 0
    private _name: string = null
    private _count: number = 0
    private _ref: EObject = null
    private _items: EList<string> = null

    eStaticClass(): EClass {
        return hybridClass
    }

    getName(): string {
        if (this._h0 & 0x1) {
            return this._name
        }
        const value = this.eBaseGetFromID(NAME, true) as string
        this._name = value
        this._h0 |= 0x1
        return value
    }
    setName(newName: string): void {
        this.eSetFromID(NAME, newName)
    }

    getCount(): number {
        if (this._h0 & 0x2) {
            return this._count
        }
        const value = this.eBaseGetFromID(COUNT, true) as number
        this._count = value
        this._h0 |= 0x2
        return value
    }
    setCount(newCount: number): void {
        this.eSetFromID(COUNT, newCount)
    }

    getRef(): EObject {
        if (this._h0 & 0x4 && !this._ref?.eIsProxy()) {
            return this._ref
        }
        const value = this.eBaseGetFromID(REF, true) as EObject
        if (!value?.eIsProxy()) {
            this._ref = value
            this._h0 |= 0x4
        }
        return value
    }
    setRef(newRef: EObject): void {
        this.eSetFromID(REF, newRef)
    }

    getItems(): EList<string> {
        if (this._h0 & 0x8) {
            return this._items
        }
        const value = this.eBaseGetFromID(ITEMS, true) as EList<string>
        this._items = value
        this._h0 |= 0x8
        return value
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case NAME:
                return this.getName()
            case COUNT:
                return this.getCount()
            case REF:
                if (!resolve) {
                    break
                }
                return this.getRef()
            case ITEMS:
                return this.getItems()
        }
        return super.eGetFromID(featureID, resolve)
    }

    eClearFields(): void {
        this._h0 = 0
        super.eClearFields()
    }

    eClearField(featureID: number): void {
        switch (featureID) {
            case NAME:
                this._h0 &= ~0x1
                return
            case COUNT:
                this._h0 &= ~0x2
                return
            case REF:
                this._h0 &= ~0x4
                return
            case ITEMS:
                this._h0 &= ~0x8
                return
        }
        super.eClearField(featureID)
    }
}

function newHybrid(store: EStore | null): HybridTest {
    const o = new HybridTest()
    if (store) {
        o.setEStore(store)
    }
    return o
}

// nodeClass is a class of a containment, child, its container opposite, parent, and two opposite
// references, peer and peerOf.
const nodeClass: EClass = (() => {
    const f = getEcoreFactory()
    const c = f.createEClass()
    c.setName("Node")
    const ref = (name: string) => {
        const r = f.createEReference()
        r.setName(name)
        r.setEType(c)
        return r
    }
    const [child, parent, peer, peerOf] = [ref("child"), ref("parent"), ref("peer"), ref("peerOf")]
    child.setContainment(true)
    child.setEOpposite(parent)
    parent.setEOpposite(child)
    peer.setEOpposite(peerOf)
    peerOf.setEOpposite(peer)
    c.getEStructuralFeatures().addAll(new ImmutableEList<EStructuralFeature>([child, parent, peer, peerOf]))
    return c
})()

// HybridNode is nodeClass as soft.gen generates it with storage=hybrid: a field per reference but
// the container one, parent, read from the container of the object.
class HybridNode extends HybridEObjectImpl {
    private _h0 = 0
    private _refs: EObject[] = [null, null, null, null]

    eStaticClass(): EClass {
        return nodeClass
    }

    private ref(id: number): any {
        const bit = 1 << id
        if (this._h0 & bit && !this._refs[id]?.eIsProxy()) {
            return this._refs[id]
        }
        const value = this.eBaseGetFromID(id, true) as EObject
        if (!value?.eIsProxy()) {
            this._refs[id] = value
            this._h0 |= bit
        }
        return value
    }
    getChild(): HybridNode {
        return this.ref(0)
    }
    getParent(): HybridNode {
        return this.eGetFromID(1, true)
    }
    getPeer(): HybridNode {
        return this.ref(2)
    }
    getPeerOf(): HybridNode {
        return this.ref(3)
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        if (resolve && featureID >= 0 && featureID < 4 && featureID != 1) {
            return this.ref(featureID)
        }
        return super.eGetFromID(featureID, resolve)
    }

    eClearFields(): void {
        this._h0 = 0
        super.eClearFields()
    }

    eClearField(featureID: number): void {
        if (featureID >= 0 && featureID < 4 && featureID != 1) {
            this._h0 &= ~(1 << featureID)
            return
        }
        super.eClearField(featureID)
    }
}

function newNode(store: EStore | null): HybridNode {
    const o = new HybridNode()
    if (store) {
        o.setEStore(store)
    }
    return o
}

describe("HybridEObjectImpl", () => {
    test("a getter reads the store once", () => {
        const store = new CountingStore()
        const o = newHybrid(store)
        store.set(o, hybridClass.getEStructuralFeature(NAME), NO_INDEX, "a")
        expect(o.getName()).toBe("a")
        expect(o.getName()).toBe("a")
        expect(store.gets).toBe(1)
        expect(o.getCount(), "the default value of a value the store does not have").toBe(0)
        expect(isHybridEObject(o)).toBe(true)
    })

    test("a set is read back, from the store once", () => {
        const store = new CountingStore()
        const o = newHybrid(store)
        o.setCount(3)
        expect(store.values.get(o).get(hybridClass.getEStructuralFeature(COUNT)), "in the store").toBe(3)
        expect(o.getCount()).toBe(3)
        o.setCount(4)
        expect(o.getCount(), "the field cleared by the set").toBe(4)
        const gets = store.gets
        expect(o.getCount()).toBe(4)
        expect(store.gets).toBe(gets)
    })

    test("a cleared cache reads the store again", () => {
        const store = new CountingStore()
        const o = newHybrid(store)
        o.setName("a")
        expect(o.getName()).toBe("a")
        store.values.get(o).set(hybridClass.getEStructuralFeature(NAME), "changed in the store")
        expect(o.getName(), "the field until the cache is cleared").toBe("a")
        o.clearCache()
        expect(o.getName()).toBe("changed in the store")
    })

    test("an unset clears the field", () => {
        const store = new CountingStore()
        const o = newHybrid(store)
        o.setName("a")
        expect(o.getName()).toBe("a")
        o.eUnset(hybridClass.getEStructuralFeature(NAME))
        expect(o.getName(), "the default value of a string").toBeNull()
        expect(o.eIsSet(hybridClass.getEStructuralFeature(NAME))).toBe(false)
    })

    test("a new store, or a change of caching, clears the fields", () => {
        const o = newHybrid(new CountingStore())
        const mask = () => (o as unknown as { _h0: number })._h0
        expect(o.getName()).toBeNull()
        expect(mask()).not.toBe(0)
        o.setEStore(new CountingStore())
        expect(mask(), "a new store").toBe(0)
        expect(o.getName()).toBeNull()
        expect(mask()).not.toBe(0)
        o.setCache(false)
        expect(mask(), "no cache").toBe(0)
    })

    test("the reflective methods go through the typed fields", () => {
        const store = new CountingStore()
        const o = newHybrid(store)
        const name = hybridClass.getEStructuralFeature(NAME)
        const items = hybridClass.getEStructuralFeature(ITEMS)
        o.eSet(name, "b")
        expect(o.getName()).toBe("b")
        expect(o.eGet(name)).toBe("b")
        expect(o.eIsSet(items), "an empty list is not set").toBe(false)
        o.getItems().add("x")
        expect(o.eIsSet(items)).toBe(true)
        expect(o.eGet(items), "one list").toBe(o.getItems())
        expect(store.toArray(o, items)).toEqual(["x"])
    })

    test("without store, the object keeps its values", () => {
        const o = newHybrid(null)
        expect(o.getName()).toBeNull()
        o.setName("a")
        expect(o.getName()).toBe("a")
        o.clearCache()
        expect(o.getName(), "without store the values are not dropped").toBe("a")
    })

    // A reference read while its proxy does not resolve is resolved again by the next read, and an
    // object published then made a proxy is resolved by the next read too.
    test("a proxy is resolved at each read", () => {
        for (const withStore of [false, true]) {
            const rs = new EResourceSetImpl()
            const a = rs.createResource(new URI("a.xml")) as EResourceImpl
            const o = newHybrid(withStore ? new CountingStore() : null)
            a.eContents().add(o)
            const b = rs.createResource(new URI("b.xml")) as EResourceImpl
            b.basicSetLoaded(true, null)

            const proxy = newHybrid(null)
            proxy.eSetProxyURI(new URI("b.xml#/0"))
            o.setRef(proxy)
            expect(o.getRef(), `store ${withStore}: b.xml has no object yet`).toBe(proxy)

            const target = newHybrid(null)
            b.eContents().add(target)
            expect(o.getRef(), `store ${withStore}: resolved by the next read`).toBe(target)

            const object = newHybrid(null)
            o.setRef(object)
            expect(o.getRef()).toBe(object)
            object.eSetProxyURI(new URI("b.xml#/0"))
            expect(o.getRef(), `store ${withStore}: a published object made a proxy is resolved`).toBe(target)
        }
    })

    test("a set notifies its adapters, the same value too", () => {
        const o = newHybrid(new CountingStore())
        const notifications: ENotification[] = []
        const adapter = new (class extends AbstractEAdapter {
            notifyChanged(n: ENotification): void {
                notifications.push(n)
            }
        })()
        o.eAdapters().add(adapter)
        o.setName("a")
        o.setName("a")
        o.setName("b")
        expect(notifications.map((n) => [n.getOldValue(), n.getNewValue()])).toEqual([
            [null, "a"],
            ["a", "a"],
            ["a", "b"]
        ])
        expect(o.getName()).toBe("b")
        o.eUnset(hybridClass.getEStructuralFeature(NAME))
        expect(notifications.length).toBe(4)
        expect(o.getName()).toBeNull()
    })

    test("a dynamic subclass keeps the typed fields of its static features", () => {
        const f = getEcoreFactory()
        const sub = f.createEClass()
        sub.setName("Sub")
        sub.getESuperTypes().add(hybridClass)
        const extra = f.createEAttribute()
        extra.setName("extra")
        extra.setEType(getEcorePackage().getEString())
        sub.getEStructuralFeatures().add(extra)
        for (const withStore of [false, true]) {
            const o = newHybrid(withStore ? new CountingStore() : null)
            o.setEClass(sub)
            o.setName("n")
            o.eSet(extra, "e")
            expect(o.getName(), `store ${withStore}`).toBe("n")
            expect(o.eGet(sub.getEStructuralFeatureFromName("name"))).toBe("n")
            expect(o.eGet(extra), `store ${withStore}`).toBe("e")
            expect(o.eIsSet(extra)).toBe(true)
            o.eUnset(extra)
            expect(o.eIsSet(extra)).toBe(false)
            expect(o.getName(), `store ${withStore}: the static field is kept`).toBe("n")
        }
    })

    test("an object keeps its values when its store goes", () => {
        const store = new CountingStore()
        const o = newHybrid(store)
        o.setName("a")
        o.getItems().add("x")
        expect(o.getName()).toBe("a")
        o.setEStore(null)
        expect(o.getName()).toBe("a")
        expect(o.getItems().toArray()).toEqual(["x"])
        o.setName("b")
        expect(o.getName()).toBe("b")
        expect(store.values.get(o).get(hybridClass.getEStructuralFeature(NAME)), "the store is left").toBe("a")
    })

    test("a list is unset and set reflectively", () => {
        const o = newHybrid(new CountingStore())
        const items = hybridClass.getEStructuralFeature(ITEMS)
        const list = o.getItems()
        list.add("x")
        o.eUnset(items)
        expect(o.eIsSet(items)).toBe(false)
        expect(o.getItems(), "the same list").toBe(list)
        expect(list.size()).toBe(0)
        o.eSet(items, ["y", "z"])
        expect(o.getItems().toArray()).toEqual(["y", "z"])
    })

    // The typed fields cache the values whatever the caching of the object: they are dropped by
    // the changes made through the object, a cleared cache, a new store or a change of caching.
    test("the typed fields cache the values when the object does not", () => {
        const store = new CountingStore()
        const o = newHybrid(store)
        o.setCache(false)
        o.setName("a")
        expect(o.getName()).toBe("a")
        store.values.get(o).set(hybridClass.getEStructuralFeature(NAME), "changed in the store")
        expect(o.getName(), "the field").toBe("a")
        o.clearCache()
        expect(o.getName()).toBe("changed in the store")
    })

    test("containments and opposites keep the fields of both ends", () => {
        for (const withStore of [false, true]) {
            const store = withStore ? new CountingStore() : null
            const [a, b, c] = [newNode(store), newNode(store), newNode(store)]
            const feature = (name: string) => nodeClass.getEStructuralFeatureFromName(name)
            expect(a.getChild()).toBeNull()
            expect(b.getChild()).toBeNull()
            expect(b.getPeerOf()).toBeNull()

            a.eSet(feature("child"), c)
            expect(a.getChild(), `store ${withStore}`).toBe(c)
            expect(c.eContainer()).toBe(a)
            expect(c.getParent()).toBe(a)
            b.eSet(feature("child"), c)
            expect(b.getChild(), `store ${withStore}: moved`).toBe(c)
            expect(c.getParent(), `store ${withStore}: moved`).toBe(b)
            expect(a.getChild(), `store ${withStore}: moved away`).toBeNull()
            expect(a.eIsSet(feature("child"))).toBe(false)

            a.eSet(feature("peer"), b)
            expect(a.getPeer()).toBe(b)
            expect(b.getPeerOf(), `store ${withStore}: inverse`).toBe(a)
            c.eSet(feature("peer"), b)
            expect(b.getPeerOf(), `store ${withStore}: inverse replaced`).toBe(c)
            expect(a.getPeer(), `store ${withStore}: old end cleared`).toBeNull()
            b.eUnset(feature("peerOf"))
            expect(c.getPeer(), `store ${withStore}: unset clears the other end`).toBeNull()
        }
    })
})
