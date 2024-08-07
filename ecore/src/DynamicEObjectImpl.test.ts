// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { anything, instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import {
    DynamicEObjectImpl,
    EAdapter,
    EClass,
    EList,
    EObject,
    EResourceImpl,
    EResourceSetImpl,
    getEcoreFactory,
    getEcorePackage,
    ImmutableEList,
    URI
} from "./internal.js"

describe("DynamicEObjectImpl", () => {
    test("constructor", () => {
        const o = new DynamicEObjectImpl()
        expect(o).not.toBeNull()
        expect(o.eClass()).toBe(getEcorePackage().getEObject())
    })

    test("mockClass", () => {
        const o = new DynamicEObjectImpl()
        const mockClass = mock<EClass>()
        const mockAdapters = mock<EList<EAdapter>>()
        const eClass = instance(mockClass)
        const eAdapters = instance(mockAdapters)
        when(mockClass.getFeatureCount()).thenReturn(0)
        when(mockClass.eAdapters()).thenReturn(eAdapters)
        when(mockAdapters.add(anything())).thenReturn(true)
        o.setEClass(eClass)
        expect(o.eClass()).toBe(eClass)
    })

    test("eClass", () => {
        const o = new DynamicEObjectImpl()
        const c = getEcoreFactory().createEClass()
        o.setEClass(c)
        expect(o.eClass()).toBe(c)
    })

    test("getSet", () => {
        const c = getEcoreFactory().createEClass()
        const a = getEcoreFactory().createEAttribute()
        c.getEStructuralFeatures().add(a)

        const o = new DynamicEObjectImpl()
        o.setEClass(c)
        expect(o.eClass()).toBe(c)
        expect(o.eGet(a)).toBeNull()

        o.eSet(a, 1)
        expect(o.eGet(a)).toBe(1)
    })

    test("unset", () => {
        const c = getEcoreFactory().createEClass()
        const a = getEcoreFactory().createEAttribute()
        c.getEStructuralFeatures().add(a)

        const o = new DynamicEObjectImpl()
        o.setEClass(c)
        expect(o.eClass()).toBe(c)
        expect(o.eGet(a)).toBeNull()

        o.eUnset(a)
        expect(o.eGet(a)).toBe(null)
    })

    test("container", () => {
        const r1 = getEcoreFactory().createEReference()
        r1.setContainment(true)
        r1.setName("ref")

        const r2 = getEcoreFactory().createEReference()
        r2.setEOpposite(r1)
        r2.setName("parent")

        const c1 = getEcoreFactory().createEClass()
        c1.getEStructuralFeatures().add(r1)

        const c2 = getEcoreFactory().createEClass()
        c2.getEStructuralFeatures().add(r2)

        const o1 = new DynamicEObjectImpl()
        o1.setEClass(c1)

        const o2 = new DynamicEObjectImpl()
        o2.setEClass(c2)

        expect(o2.eIsSet(r2)).toBeFalsy()
        expect(o1.eIsSet(r1)).toBeFalsy()

        o2.eSet(r2, o1)
        expect(o2.eGet(r2)).toBe(o1)
        expect(o2.eGetResolve(r2, false)).toBe(o1)
        expect(o1.eGet(r1)).toBe(o2)
        expect(o1.eGetResolve(r1, false)).toBe(o2)
        expect(o2.eIsSet(r2)).toBeTruthy()
        expect(o1.eIsSet(r1)).toBeTruthy()

        o2.eUnset(r2)
        expect(o2.eGet(r2)).toBeNull()
        expect(o1.eGet(r1)).toBeNull()
        expect(o2.eIsSet(r2)).toBeFalsy()
        expect(o1.eIsSet(r1)).toBeFalsy()
    })

    test("proxy", () => {
        const c1 = getEcoreFactory().createEClass()
        const c2 = getEcoreFactory().createEClass()
        const c3 = getEcoreFactory().createEClass()

        const r1 = getEcoreFactory().createEReference()
        r1.setContainment(true)
        r1.setName("r1")
        r1.setLowerBound(0)
        r1.setUpperBound(-1)
        r1.setEType(c2)

        const r3 = getEcoreFactory().createEReference()
        r3.setName("r3")
        r3.setEType(c2)
        r3.setResolveProxies(true)

        c1.getEStructuralFeatures().add(r1)
        c1.setName("c1")

        c2.setName("c2")

        c3.getEStructuralFeatures().add(r3)
        c3.setName("c3")

        // model - a container object with two children and another object
        // with one of these child reference
        const o1 = new DynamicEObjectImpl()
        o1.setEClass(c1)

        const o1c1 = new DynamicEObjectImpl()
        o1c1.setEClass(c2)

        const o1c2 = new DynamicEObjectImpl()
        o1c2.setEClass(c2)

        expect(o1.eGet(r1)).not.toBeNull()
        const o1cs = o1.eGet(r1) as EList<EObject>
        o1cs.addAll(new ImmutableEList<EObject>([o1c1, o1c2]))

        const o3 = new DynamicEObjectImpl()
        o3.setEClass(c3)

        // add to resource to enable proxy resolution
        const resource = new EResourceImpl()
        resource.setURI(new URI("file:///" + __dirname + "/r.txt"))
        resource.eContents().addAll(new ImmutableEList<EObject>([o1, o3]))

        const resourceSet = new EResourceSetImpl()
        resourceSet.getResources().add(resource)

        const oproxy = new DynamicEObjectImpl()
        oproxy.eSetProxyURI(new URI("file:///" + __dirname + "/r.txt#//@r1.1"))

        expect(o3.eIsSet(r3)).toBeFalsy()

        o3.eSet(r3, oproxy)
        expect(o3.eGetResolve(r3, false)).toBe(oproxy)
        expect(o3.eGetResolve(r3, true)).toBe(o1c2)
        expect(o3.eIsSet(r3)).toBeTruthy()

        o3.eUnset(r3)
        expect(o3.eGet(r3)).toBeNull()
        expect(o3.eIsSet(r3)).toBeFalsy()
    })
})
