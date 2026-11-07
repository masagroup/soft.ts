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
    EClass,
    EList,
    EObject,
    EObjectInternal,
    EReference,
    EResourceSetImpl,
    getEcoreFactory,
    UNBOUNDED_MULTIPLICITY,
    URI
} from "./internal.js"

// a class with a many reference resolving proxies
function newDynamicManyClasses(): { eClass: EClass; refs: EReference } {
    const f = getEcoreFactory()
    const ePackage = f.createEPackage()
    ePackage.setName("p")
    ePackage.setNsURI("http://p")
    ePackage.setEFactoryInstance(f.createEFactory())
    const eClass = f.createEClass()
    eClass.setName("C")
    ePackage.getEClassifiers().add(eClass)
    const refs = f.createEReference()
    refs.setName("refs")
    refs.setEType(eClass)
    refs.setUpperBound(UNBOUNDED_MULTIPLICITY)
    eClass.getEStructuralFeatures().add(refs)
    return { eClass, refs }
}

// an object of a resource whose many reference holds a proxy to the target of another resource
function newProxyHolder(): { target: EObject; proxy: EObject; eObject: EObject; refs: EReference } {
    const { eClass, refs } = newDynamicManyClasses()
    const eFactory = eClass.getEPackage().getEFactoryInstance()
    const rs = new EResourceSetImpl()
    const target = eFactory.create(eClass)
    rs.createResource(new URI("target.xml")).eContents().add(target)

    const eObject = eFactory.create(eClass)
    const proxy = eFactory.create(eClass) as EObjectInternal
    proxy.eSetProxyURI(new URI("target.xml#/0"))
    ;(eObject.eGet(refs) as EList<EObject>).add(proxy)
    rs.createResource(new URI("source.xml")).eContents().add(eObject)
    return { target, proxy, eObject, refs }
}

describe("DynamicEObject many features", () => {
    // eGetResolve of a many reference without resolve does not resolve its proxies, as the
    // generated getters
    test("getManyWithoutResolve", () => {
        const { target, proxy, eObject, refs } = newProxyHolder()
        const unresolved = eObject.eGetResolve(refs, false) as EList<EObject>
        expect(unresolved.get(0)).toBe(proxy)
        expect(unresolved.indexOf(proxy)).toBe(0)
        expect((eObject.eGet(refs) as EList<EObject>).get(0)).toBe(target)
    })

    // without resolve, the list is not resolved even when it is created by the get
    test("getManyWithoutResolveFirst", () => {
        const { eClass, refs } = newDynamicManyClasses()
        const eObject = eClass.getEPackage().getEFactoryInstance().create(eClass)
        const unresolved = eObject.eGetResolve(refs, false) as EList<EObject>
        const resolved = eObject.eGet(refs) as EList<EObject>
        expect(unresolved).not.toBe(resolved)
        const proxy = eClass.getEPackage().getEFactoryInstance().create(eClass) as EObjectInternal
        proxy.eSetProxyURI(new URI("target.xml#/0"))
        unresolved.add(proxy)
        expect(resolved.size()).toBe(1)
    })

    test("getManyWithoutResolveAsync", async () => {
        const { target, proxy, eObject, refs } = newProxyHolder()
        const unresolved = (await eObject.eGetResolveAsync(refs, false)) as EList<EObject>
        expect(unresolved.get(0)).toBe(proxy)
        expect(((await eObject.eGetAsync(refs)) as EList<EObject>).get(0)).toBe(target)
    })
})
