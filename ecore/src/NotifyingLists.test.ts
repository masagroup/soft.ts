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
    BasicEObjectList,
    EClass,
    EContentAdapter,
    EcoreUtils,
    EList,
    ENotification,
    EObject,
    EObjectInternal,
    EResource,
    EResourceSetImpl,
    EStoreEObjectImpl,
    EventType,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY,
    URI
} from "./internal.js"

class Recorder extends AbstractEAdapter {
    events: ENotification[] = []

    notifyChanged(notification: ENotification): void {
        if (notification.getEventType() != EventType.REMOVING_ADAPTER) {
            this.events.push(notification)
        }
    }

    eventTypes(): EventType[] {
        return this.events.map((n) => n.getEventType())
    }
}

function record(notifier: EObject | EResource): Recorder {
    const recorder = new Recorder()
    notifier.eAdapters().add(recorder)
    return recorder
}

// a metamodel with
//  A.b (single) <-> B.as (many)
//  A.bs (many) <-> B.mas (many)
//  A.children (containment many of B), A.child (containment single of B)
//  A.refs (many of B, no opposite)
//  A.name, A.names (many) attributes
function newMetaModel() {
    const f = getEcoreFactory()
    const p = f.createEPackage()
    p.setName("p")
    p.setNsURI("http://p")
    p.setNsPrefix("p")
    p.setEFactoryInstance(f.createEFactory())
    const A = f.createEClass()
    A.setName("A")
    const B = f.createEClass()
    B.setName("B")
    const newReference = (name: string, type: EClass, many: boolean, containment: boolean = false) => {
        const r = f.createEReference()
        r.setName(name)
        r.setEType(type)
        if (many) r.setUpperBound(UNBOUNDED_MULTIPLICITY)
        r.setContainment(containment)
        return r
    }
    const newAttribute = (name: string, many: boolean) => {
        const a = f.createEAttribute()
        a.setName(name)
        a.setEType(getEcorePackage().getEString())
        if (many) a.setUpperBound(UNBOUNDED_MULTIPLICITY)
        return a
    }
    const Ab = newReference("b", B, false)
    const Bas = newReference("as", A, true)
    Ab.setEOpposite(Bas)
    Bas.setEOpposite(Ab)
    const Abs = newReference("bs", B, true)
    const Bmas = newReference("mas", A, true)
    Abs.setEOpposite(Bmas)
    Bmas.setEOpposite(Abs)
    const Achildren = newReference("children", B, true, true)
    const Achild = newReference("child", B, false, true)
    const Arefs = newReference("refs", B, true)
    const Aname = newAttribute("name", false)
    const Anames = newAttribute("names", true)
    for (const feature of [Ab, Abs, Achildren, Achild, Arefs, Aname, Anames]) A.getEStructuralFeatures().add(feature)
    for (const feature of [Bas, Bmas]) B.getEStructuralFeatures().add(feature)
    p.getEClassifiers().add(A)
    p.getEClassifiers().add(B)
    const newA = () => p.getEFactoryInstance().create(A)
    const newB = () => p.getEFactoryInstance().create(B)
    return { A, B, Ab, Bas, Abs, Bmas, Achildren, Achild, Arefs, Aname, Anames, newA, newB }
}

function list(o: EObject, feature: any): EList<EObject> {
    return o.eGet(feature) as EList<EObject>
}

// newProxy returns a proxy to o, contained in resource
function newProxy(m: ReturnType<typeof newMetaModel>, resource: EResource, o: EObject): EObject {
    const proxy = m.newB() as EObject as EObjectInternal
    proxy.eSetProxyURI(new URI(resource.getURI().toString() + "#" + resource.getURIFragment(o)))
    return proxy
}

describe("Notifying lists", () => {
    describe("opposites", () => {
        test("many to many add and remove", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b = m.newB()
            const ra = record(a)
            const rb = record(b)
            list(a, m.Abs).add(b)
            expect(list(a, m.Abs).toArray()).toEqual([b])
            expect(list(b, m.Bmas).toArray()).toEqual([a])
            expect(ra.eventTypes()).toEqual([EventType.ADD])
            expect(rb.eventTypes()).toEqual([EventType.ADD])

            list(b, m.Bmas).remove(a)
            expect(list(a, m.Abs).isEmpty()).toBeTruthy()
            expect(list(b, m.Bmas).isEmpty()).toBeTruthy()
            expect(ra.eventTypes()).toEqual([EventType.ADD, EventType.REMOVE])
            expect(rb.eventTypes()).toEqual([EventType.ADD, EventType.REMOVE])
        })

        test("many to many set", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b1 = m.newB()
            const b2 = m.newB()
            list(a, m.Abs).add(b1)
            const r1 = record(b1)
            const r2 = record(b2)
            list(a, m.Abs).set(0, b2)
            expect(list(a, m.Abs).toArray()).toEqual([b2])
            expect(list(b1, m.Bmas).isEmpty()).toBeTruthy()
            expect(list(b2, m.Bmas).toArray()).toEqual([a])
            expect(r1.eventTypes()).toEqual([EventType.REMOVE])
            expect(r2.eventTypes()).toEqual([EventType.ADD])
        })

        test("single to many", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b = m.newB()
            const rb = record(b)
            list(b, m.Bas).add(a)
            expect(a.eGet(m.Ab)).toBe(b)
            expect(list(b, m.Bas).toArray()).toEqual([a])
            expect(rb.eventTypes()).toEqual([EventType.ADD])

            a.eSet(m.Ab, null)
            expect(list(b, m.Bas).isEmpty()).toBeTruthy()
            expect(rb.eventTypes()).toEqual([EventType.ADD, EventType.REMOVE])
        })

        test("resolve sends only RESOLVE", () => {
            const m = newMetaModel()
            const rs = new EResourceSetImpl()
            const resource = rs.createResource(new URI("file:///r.xmi"))
            const a = m.newA()
            const b = m.newB()
            resource.eContents().add(a)
            resource.eContents().add(b)
            const bs = list(a, m.Abs)
            // a proxy, without inverse
            ;(bs as any)._v.push(newProxy(m, resource, b))
            const ra = record(a)
            expect(bs.get(0)).toBe(b)
            expect(ra.eventTypes()).toEqual([EventType.RESOLVE])
            expect(list(b, m.Bmas).isEmpty()).toBeTruthy()
        })
    })

    test("eInverseAdd returns the notifications", () => {
        const m = newMetaModel()
        const a = m.newA() as EObject as EObjectInternal
        const b = m.newB()
        record(a)
        const notifications = a.eInverseAdd(b, m.A.getFeatureID(m.Ab), null)
        expect(notifications).not.toBeNull()
        expect(notifications).not.toBeUndefined()
        expect(a.eGet(m.Ab)).toBe(b)
    })

    describe("clear", () => {
        test("containment", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b1 = m.newB()
            const b2 = m.newB()
            const children = list(a, m.Achildren)
            children.add(b1)
            children.add(b2)
            const ra = record(a)
            children.clear()
            expect(children.isEmpty()).toBeTruthy()
            expect(b1.eContainer()).toBeNull()
            expect(b2.eContainer()).toBeNull()
            expect(ra.eventTypes()).toEqual([EventType.REMOVE_MANY])
            expect(ra.events[0].getOldValue()).toEqual([b1, b2])
        })

        test("single element", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b = m.newB()
            list(a, m.Abs).add(b)
            const ra = record(a)
            const rb = record(b)
            list(a, m.Abs).clear()
            expect(list(b, m.Bmas).isEmpty()).toBeTruthy()
            expect(ra.eventTypes()).toEqual([EventType.REMOVE])
            expect(rb.eventTypes()).toEqual([EventType.REMOVE])
        })

        test("empty", () => {
            const m = newMetaModel()
            const a = m.newA()
            const ra = record(a)
            list(a, m.Abs).clear()
            expect(ra.eventTypes()).toEqual([EventType.REMOVE_MANY])
        })

        test("resource contents", () => {
            const m = newMetaModel()
            const rs = new EResourceSetImpl()
            const resource = rs.createResource(new URI("file:///r.xmi"))
            const a = m.newA()
            resource.eContents().add(a)
            const rr = record(resource)
            resource.eContents().clear()
            expect(a.eResource()).toBeNull()
            expect(rr.eventTypes()).toContain(EventType.REMOVE)
        })
    })

    describe("move", () => {
        test("notification", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b1 = m.newB()
            const b2 = m.newB()
            const children = list(a, m.Achildren)
            children.add(b1)
            children.add(b2)
            const ra = record(a)
            expect(children.moveTo(0, 1)).toBe(b1)
            expect(children.toArray()).toEqual([b2, b1])
            expect(ra.eventTypes()).toEqual([EventType.MOVE])
            expect(ra.events[0].getOldValue()).toBe(0)
            expect(ra.events[0].getNewValue()).toBe(b1)
            expect(ra.events[0].getPosition()).toBe(1)

            children.moveTo(1, 1)
            expect(ra.events.length).toBe(1)
        })

        test("out of bounds", () => {
            const m = newMetaModel()
            const a = m.newA()
            const children = list(a, m.Achildren)
            children.add(m.newB())
            children.add(m.newB())
            expect(() => children.moveTo(0, 2)).toThrow(RangeError)
        })
    })

    describe("reflective many-valued features", () => {
        test("eSet keeps the list", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b1 = m.newB()
            const b2 = m.newB()
            const children = list(a, m.Achildren)
            const old = m.newB()
            children.add(old)
            a.eSet(m.Achildren, [b1, b2])
            expect(a.eGet(m.Achildren)).toBe(children)
            expect(children.toArray()).toEqual([b1, b2])
            expect(b1.eContainer()).toBe(a)
            expect(old.eContainer()).toBeNull()

            // set the same list
            a.eSet(m.Achildren, children)
            expect(children.toArray()).toEqual([b1, b2])

            a.eSet(m.Anames, ["x", "y"])
            expect((a.eGet(m.Anames) as EList<string>).toArray()).toEqual(["x", "y"])
        })

        test("eUnset clears the list", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b = m.newB()
            const children = list(a, m.Achildren)
            children.add(b)
            a.eUnset(m.Achildren)
            expect(a.eGet(m.Achildren)).toBe(children)
            expect(children.isEmpty()).toBeTruthy()
            expect(b.eContainer()).toBeNull()
            expect(a.eIsSet(m.Achildren)).toBeFalsy()
        })

        test("copy", () => {
            const m = newMetaModel()
            const a = m.newA()
            const b = m.newB()
            list(a, m.Achildren).add(b)
            a.eSet(m.Ab, b)
            const c = EcoreUtils.copy(a)
            const children = list(c, m.Achildren)
            expect(children.size()).toBe(1)
            expect(children.get(0)).not.toBe(b)
            expect(children.get(0).eContainer()).toBe(c)
            expect(c.eGet(m.Ab)).toBe(children.get(0))
            expect(list(b, m.Bas).toArray()).toEqual([a])
        })
    })

    test("eUnset of a non unsettable reference sends SET", () => {
        const m = newMetaModel()
        const a = m.newA()
        a.eSet(m.Achild, m.newB())
        const ra = record(a)
        a.eUnset(m.Achild)
        expect(ra.eventTypes()).toEqual([EventType.SET])
    })

    test("unresolved list", () => {
        const m = newMetaModel()
        const rs = new EResourceSetImpl()
        const resource = rs.createResource(new URI("file:///r.xmi"))
        const a = m.newA()
        const b = m.newB()
        resource.eContents().add(a)
        resource.eContents().add(b)
        const proxy = newProxy(m, resource, b)
        const refs = list(a, m.Arefs) as BasicEObjectList<EObject>
        const unresolved = refs.getUnResolvedList()
        unresolved.add(proxy)
        expect(refs.size()).toBe(1)
        expect(unresolved.get(0)).toBe(proxy)
        expect(unresolved.toArray()).toEqual([proxy])
        expect(unresolved.indexOf(proxy)).toBe(0)
        // not resolved
        expect((refs as any)._v[0]).toBe(proxy)

        unresolved.clear()
        expect(refs.isEmpty()).toBeTruthy()
    })
})

describe("Notifiers", () => {
    test("adapter removing itself", () => {
        const m = newMetaModel()
        const a = m.newA()
        class Once extends AbstractEAdapter {
            notifyChanged(notification: ENotification): void {
                if (notification.getEventType() != EventType.REMOVING_ADAPTER) a.eAdapters().remove(this)
            }
        }
        a.eAdapters().add(new Once())
        const ra = record(a)
        a.eSet(m.Aname, "x")
        expect(ra.eventTypes()).toEqual([EventType.SET])
    })

    test("content adapter with cross resource containment", () => {
        const m = newMetaModel()
        m.Achildren.setResolveProxies(true)
        const rs = new EResourceSetImpl()
        const r1 = rs.createResource(new URI("file:///r1.xmi"))
        const r2 = rs.createResource(new URI("file:///r2.xmi"))
        const a = m.newA()
        const b = m.newB()
        r1.eContents().add(a)
        list(a, m.Achildren).add(b)
        r2.eContents().add(b)
        expect(b.eContainer()).toBe(a)
        expect(b.eResource()).toBe(r2)
        const adapter = new EContentAdapter()
        r2.eAdapters().add(adapter)
        expect(b.eAdapters().contains(adapter)).toBeTruthy()
        expect(() => r2.eContents().remove(b)).not.toThrow()
        expect(b.eAdapters().contains(adapter)).toBeFalsy()
    })

    test("resolveAllAsync sends only RESOLVE", async () => {
        const m = newMetaModel()
        m.Arefs.setResolveProxies(false)
        const rs = new EResourceSetImpl()
        const resource = rs.createResource(new URI("file:///r.xmi"))
        const a = m.newA()
        const b = m.newB()
        resource.eContents().add(a)
        resource.eContents().add(b)
        list(a, m.Arefs).add(newProxy(m, resource, b))
        const ra = record(a)
        await EcoreUtils.resolveAllAsync(a)
        expect(list(a, m.Arefs).get(0)).toBe(b)
        expect(ra.eventTypes()).toEqual([EventType.RESOLVE])
    })
})

describe("EStoreEObjectImpl without store", () => {
    test("setCache(false) keeps values", () => {
        const m = newMetaModel()
        const o = new EStoreEObjectImpl()
        o.setEClass(m.A)
        o.eSet(m.Aname, "hello")
        list(o, m.Arefs).add(m.newB())
        o.setCache(true)
        o.setCache(false)
        expect(o.eGet(m.Aname)).toBe("hello")
        expect(list(o, m.Arefs).size()).toBe(1)
        o.clearCache()
        expect(o.eGet(m.Aname)).toBe("hello")
        expect(list(o, m.Arefs).size()).toBe(1)
    })
})
