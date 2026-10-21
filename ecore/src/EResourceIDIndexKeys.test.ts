// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EAttribute, EClass, EObject, EResourceImpl, getEcoreFactory, getEcorePackage } from "./internal.js"

function newModel(): { eClass: EClass; eID: EAttribute; eChildren: any } {
    const f = getEcoreFactory()
    const p = f.createEPackage()
    p.setName("p")
    p.setNsURI("urn:p")
    const eClass = f.createEClass()
    eClass.setName("Item")
    const eID = f.createEAttribute()
    eID.setName("id")
    eID.setEType(getEcorePackage().getEString())
    eID.setID(true)
    eClass.getEStructuralFeatures().add(eID)
    const eChildren = f.createEReference()
    eChildren.setName("children")
    eChildren.setEType(eClass)
    eChildren.setContainment(true)
    eChildren.setUpperBound(-1)
    eClass.getEStructuralFeatures().add(eChildren)
    p.getEClassifiers().add(eClass)
    return { eClass, eID, eChildren }
}

function newItem(eClass: EClass, eID: EAttribute, id: string): EObject {
    const o = eClass.getEPackage().getEFactoryInstance().create(eClass)
    o.eSet(eID, id)
    return o
}

describe("EResourceImpl id index keys", () => {
    test("lookup", () => {
        const { eClass, eID } = newModel()
        const r = new EResourceImpl()
        const a = newItem(eClass, eID, "a")
        const b = newItem(eClass, eID, "b")
        r.eContents().add(a)
        r.eContents().add(b)
        expect(r.getEObject("a")).toBe(a)
        expect(r.getEObject("b")).toBe(b)
        expect(r.getEObject("c")).toBeNull()
    })

    test("id changed then detached", () => {
        const { eClass, eID } = newModel()
        const r = new EResourceImpl()
        const o = newItem(eClass, eID, "a")
        r.eContents().add(o)
        expect(r.getEObject("a")).toBe(o)
        o.eSet(eID, "b")
        r.eContents().remove(o)
        // the detached object is not found anymore, even with its first id
        o.eSet(eID, "a")
        expect(r.getEObject("a")).toBeNull()
        expect(r.getEObject("b")).toBeNull()
    })

    test("id changed while attached", () => {
        const { eClass, eID } = newModel()
        const r = new EResourceImpl()
        const o = newItem(eClass, eID, "a")
        r.eContents().add(o)
        expect(r.getEObject("a")).toBe(o)
        o.eSet(eID, "b")
        expect(r.getEObject("b")).toBe(o)
        expect(r.getEObject("a")).toBeNull()
    })

    test("children attached and detached", () => {
        const { eClass, eID, eChildren } = newModel()
        const r = new EResourceImpl()
        const root = newItem(eClass, eID, "root")
        r.eContents().add(root)
        expect(r.getEObject("root")).toBe(root)
        const child = newItem(eClass, eID, "child")
        ;(root.eGet(eChildren) as any).add(child)
        expect(r.getEObject("child")).toBe(child)
        ;(root.eGet(eChildren) as any).remove(child)
        expect(r.getEObject("child")).toBeNull()
    })

    test("duplicate ids keep the first object", () => {
        const { eClass, eID } = newModel()
        const r = new EResourceImpl()
        const o1 = newItem(eClass, eID, "a")
        const o2 = newItem(eClass, eID, "a")
        r.eContents().add(o1)
        r.eContents().add(o2)
        expect(r.getEObject("a")).toBe(o1)
        r.eContents().remove(o1)
        expect(r.getEObject("a")).toBe(o2)
    })
})
