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
    Collection,
    EAttribute,
    EClass,
    EList,
    ENotification,
    EObject,
    EReference,
    EStore,
    EStoreEObjectImpl,
    EStoreList,
    EStructuralFeature,
    EventType,
    getEcoreFactory,
    getEcorePackage,
    isEStoreProvider
} from "./internal.js"

// MemoryStore is an EStore keeping the values in maps, recording the calls it receives.
class MemoryStore implements EStore {
    values = new Map<EObject, Map<EStructuralFeature, any>>()
    containers = new Map<EObject, [EObject, EStructuralFeature]>()
    calls: string[] = []

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
        let l = m.get(feature)
        if (!l) {
            l = []
            m.set(feature, l)
        }
        return l
    }

    addRoot(object: EObject): void {
        this.calls.push("addRoot")
    }
    removeRoot(object: EObject): void {
        this.calls.push("removeRoot")
    }
    get(object: EObject, feature: EStructuralFeature, index: number): any {
        this.calls.push("get")
        if (feature.isMany()) {
            return this.list(object, feature)[index]
        }
        const m = this.featureValues(object)
        return m.has(feature) ? m.get(feature) : feature.getDefaultValue()
    }
    set(object: EObject, feature: EStructuralFeature, index: number, value: any, needResult: boolean): any {
        this.calls.push("set")
        if (feature.isMany() && index >= 0) {
            const l = this.list(object, feature)
            const old = l[index]
            l[index] = value
            return old
        }
        const m = this.featureValues(object)
        const old = m.get(feature)
        m.set(feature, value)
        return old
    }
    isSet(object: EObject, feature: EStructuralFeature): boolean {
        const m = this.featureValues(object)
        return feature.isMany() ? this.list(object, feature).length > 0 : m.has(feature)
    }
    unSet(object: EObject, feature: EStructuralFeature): void {
        this.calls.push("unSet")
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
        this.calls.push("add")
        this.list(object, feature).splice(index, 0, value)
    }
    addAll(object: EObject, feature: EStructuralFeature, index: number, collection: Collection<any>): void {
        this.calls.push("addAll")
        this.list(object, feature).splice(index, 0, ...collection.toArray())
    }
    remove(object: EObject, feature: EStructuralFeature, index: number, needResult: boolean): any {
        this.calls.push("remove")
        return this.list(object, feature).splice(index, 1)[0]
    }
    move(object: EObject, feature: EStructuralFeature, sourceIndex: number, targetIndex: number, needResult: boolean): any {
        this.calls.push("move")
        const l = this.list(object, feature)
        const [e] = l.splice(sourceIndex, 1)
        l.splice(targetIndex, 0, e)
        return e
    }
    clear(object: EObject, feature: EStructuralFeature): void {
        this.calls.push("clear")
        this.featureValues(object).set(feature, [])
    }
    setContainer(object: EObject, container: EObject, feature: EStructuralFeature): void {
        this.calls.push("setContainer")
        this.containers.set(object, [container, feature])
    }
    getContainer(object: EObject): [EObject, EStructuralFeature] {
        return this.containers.get(object) ?? [null, null]
    }
    toArray(object: EObject, feature: EStructuralFeature): any[] {
        return [...this.list(object, feature)]
    }
}

class TestObject extends EStoreEObjectImpl {
    isCachedValue(featureID: number): boolean {
        return this.isCached(featureID)
    }
}

interface Model {
    parent: EClass
    child: EClass
    name: EAttribute
    count: EAttribute
    tags: EAttribute
    children: EReference
    owner: EReference
}

function createModel(): Model {
    const f = getEcoreFactory()
    const p = getEcorePackage()
    const pkg = f.createEPackage()
    const parent = f.createEClass()
    parent.setName("Parent")
    const child = f.createEClass()
    child.setName("Child")
    pkg.getEClassifiers().add(parent)
    pkg.getEClassifiers().add(child)

    const name = f.createEAttribute()
    name.setName("name")
    name.setEType(p.getEString())
    const count = f.createEAttribute()
    count.setName("count")
    count.setEType(p.getEInt())
    count.setDefaultValueLiteral("5")
    const tags = f.createEAttribute()
    tags.setName("tags")
    tags.setEType(p.getEString())
    tags.setUpperBound(-1)
    tags.setUnique(false)
    const children = f.createEReference()
    children.setName("children")
    children.setEType(child)
    children.setContainment(true)
    children.setUpperBound(-1)
    const owner = f.createEReference()
    owner.setName("owner")
    owner.setEType(parent)
    children.setEOpposite(owner)
    owner.setEOpposite(children)
    parent.getEStructuralFeatures().add(name)
    parent.getEStructuralFeatures().add(count)
    parent.getEStructuralFeatures().add(tags)
    parent.getEStructuralFeatures().add(children)
    child.getEStructuralFeatures().add(owner)
    return { parent, child, name, count, tags, children, owner }
}

function newObject(eClass: EClass, store: EStore): TestObject {
    const o = new TestObject()
    o.setEClass(eClass)
    o.setEStore(store)
    return o
}

describe("EStoreEObjectImpl", () => {
    test("isEStoreProvider", () => {
        expect(isEStoreProvider(new EStoreEObjectImpl())).toBeTruthy()
    })

    test("withoutStore", () => {
        const m = createModel()
        const o = newObject(m.parent, null)
        expect(o.eGet(m.name)).toBeNull()
        o.eSet(m.name, "a")
        expect(o.eGet(m.name)).toBe("a")
        expect(o.eIsSet(m.name)).toBeTruthy()
        o.eUnset(m.name)
        expect(o.eIsSet(m.name)).toBeFalsy()
        const tags = o.eGet(m.tags) as EList<string>
        tags.add("x")
        expect(tags.toArray()).toEqual(["x"])
        expect(o.eIsSet(m.tags)).toBeTruthy()
    })

    test("getSetThroughStore", () => {
        const m = createModel()
        const store = new MemoryStore()
        const o = newObject(m.parent, store)
        expect(o.eGet(m.name)).toBeNull()
        o.eSet(m.name, "a")
        expect(store.get(o, m.name, -1)).toBe("a")
        expect(o.eGet(m.name)).toBe("a")
        expect(o.eIsSet(m.name)).toBeTruthy()
        o.eUnset(m.name)
        expect(o.eIsSet(m.name)).toBeFalsy()
        expect(store.calls).toContain("unSet")
    })

    test("falsyValueIsNotReplacedByDefault", () => {
        const m = createModel()
        const store = new MemoryStore()
        const o = newObject(m.parent, store)
        expect(o.eGet(m.count)).toBe(5)
        o.eSet(m.count, 0)
        expect(o.eGet(m.count)).toBe(0)
    })

    test("cache", () => {
        const m = createModel()
        const store = new MemoryStore()
        const o = newObject(m.parent, store)
        store.set(o, m.name, -1, "a", false)
        expect(o.eGet(m.name)).toBe("a")
        const id = m.parent.getFeatureID(m.name)
        expect(o.isCachedValue(id)).toBeTruthy()
        // a value changed in the store is read once the cache is cleared
        store.set(o, m.name, -1, "b", false)
        expect(o.eGet(m.name)).toBe("a")
        o.clearCache()
        expect(o.eGet(m.name)).toBe("b")
    })

    test("noCache", () => {
        const m = createModel()
        const store = new MemoryStore()
        const o = newObject(m.parent, store)
        o.setCache(false)
        expect(o.isCache()).toBeFalsy()
        store.set(o, m.name, -1, "a", false)
        expect(o.eGet(m.name)).toBe("a")
        store.set(o, m.name, -1, "b", false)
        expect(o.eGet(m.name)).toBe("b")
    })

    test("listThroughStore", () => {
        const m = createModel()
        const store = new MemoryStore()
        const o = newObject(m.parent, store)
        const tags = o.eGet(m.tags) as EList<string>
        expect(tags).toBeInstanceOf(EStoreList)
        tags.add("a")
        tags.add("b")
        tags.insert(0, "c")
        expect(store.toArray(o, m.tags)).toEqual(["c", "a", "b"])
        expect(tags.toArray()).toEqual(["c", "a", "b"])
        tags.moveTo(0, 2)
        expect(store.toArray(o, m.tags)).toEqual(["a", "b", "c"])
        tags.removeAt(1)
        expect(store.toArray(o, m.tags)).toEqual(["a", "c"])
        tags.set(0, "d")
        expect(store.toArray(o, m.tags)).toEqual(["d", "c"])
        tags.clear()
        expect(store.toArray(o, m.tags)).toEqual([])
        expect(tags.size()).toBe(0)
    })

    test("uncachedList", () => {
        const m = createModel()
        const store = new MemoryStore()
        const o = newObject(m.parent, store)
        const tags = new EStoreList<string>(o, m.tags, store)
        expect(tags.isCache()).toBeFalsy()
        store.add(o, m.tags, 0, "a")
        expect(tags.size()).toBe(1)
        expect(tags.get(0)).toBe("a")
        tags.add("b")
        expect(store.toArray(o, m.tags)).toEqual(["a", "b"])
        expect(tags.removeAt(0)).toBe("a")
        expect(tags.moveTo(0, 0)).toBe("b")
        expect(tags.set(0, "c")).toBe("b")
        expect(tags.toArray()).toEqual(["c"])
        tags.setEStore(null)
        expect(tags.toArray()).toEqual(["c"])
        tags.add("d")
        expect(store.toArray(o, m.tags)).toEqual(["c"])
    })

    test("containment", () => {
        const m = createModel()
        const store = new MemoryStore()
        const p = newObject(m.parent, store)
        const c = newObject(m.child, store)
        const children = p.eGet(m.children) as EList<EObject>
        children.add(c)
        expect(c.eContainer()).toBe(p)
        expect(c.eGet(m.owner)).toBe(p)
        expect(store.getContainer(c)).toEqual([p, m.children])

        // a new object reads its container from the store
        const c2 = newObject(m.child, store)
        store.setContainer(c2, p, m.children)
        expect(c2.eContainer()).toBe(p)
        expect(c2.eContainingFeature()).toBe(m.children)

        children.remove(c)
        expect(c.eContainer()).toBeNull()
        expect(store.getContainer(c)).toEqual([null, null])
    })

    test("notifications", () => {
        const m = createModel()
        const store = new MemoryStore()
        const o = newObject(m.parent, store)
        const notifications: ENotification[] = []
        const adapter = new (class extends AbstractEAdapter {
            notifyChanged(n: ENotification): void {
                notifications.push(n)
            }
        })()
        o.eAdapters().add(adapter)
        o.eSet(m.name, "a")
        const tags = o.eGet(m.tags) as EList<string>
        tags.add("x")
        tags.add("y")
        tags.moveTo(0, 1)
        tags.clear()
        expect(notifications.map((n) => n.getEventType())).toEqual([
            EventType.SET,
            EventType.ADD,
            EventType.ADD,
            EventType.MOVE,
            EventType.REMOVE_MANY
        ])
    })
})
