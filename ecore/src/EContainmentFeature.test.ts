// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EList, EObject, getEcoreFactory } from "./internal.js"

// Parent.children / Parent.child are containments whose opposite is Child.parent / Child.single
function createModel() {
    const f = getEcoreFactory()
    const ePackage = f.createEPackage()
    ePackage.setName("cf")
    ePackage.setNsURI("http://cf")

    const parentClass = f.createEClass()
    parentClass.setName("Parent")
    const childClass = f.createEClass()
    childClass.setName("Child")

    const children = f.createEReference()
    children.setName("children")
    children.setContainment(true)
    children.setUpperBound(-1)
    children.setEType(childClass)
    parentClass.getEStructuralFeatures().add(children)

    const child = f.createEReference()
    child.setName("child")
    child.setContainment(true)
    child.setEType(childClass)
    parentClass.getEStructuralFeatures().add(child)

    const parent = f.createEReference()
    parent.setName("parent")
    parent.setEType(parentClass)
    childClass.getEStructuralFeatures().add(parent)

    const single = f.createEReference()
    single.setName("single")
    single.setEType(parentClass)
    childClass.getEStructuralFeatures().add(single)

    children.setEOpposite(parent)
    parent.setEOpposite(children)
    child.setEOpposite(single)
    single.setEOpposite(child)

    ePackage.getEClassifiers().add(parentClass)
    ePackage.getEClassifiers().add(childClass)
    return { ePackage, parentClass, childClass, children, child, parent, single }
}

describe("eContainmentFeature", () => {
    test("bidirectional many containment", () => {
        const { ePackage, parentClass, childClass, children, parent } = createModel()
        const p = ePackage.getEFactoryInstance().create(parentClass)
        const c = ePackage.getEFactoryInstance().create(childClass)
        ;(p.eGet(children) as EList<EObject>).add(c)
        expect(c.eContainer()).toBe(p)
        expect(c.eContainmentFeature()).toBe(children)
        expect(c.eContainingFeature()).toBe(children)

        c.eSet(parent, null)
        expect(c.eContainer()).toBeNull()
        expect(c.eContainmentFeature()).toBeNull()
    })

    test("bidirectional single containment set from the container side", () => {
        const { ePackage, parentClass, childClass, child } = createModel()
        const p = ePackage.getEFactoryInstance().create(parentClass)
        const c = ePackage.getEFactoryInstance().create(childClass)
        p.eSet(child, c)
        expect(c.eContainer()).toBe(p)
        expect(c.eContainmentFeature()).toBe(child)
    })

    test("bidirectional single containment set from the child side", () => {
        const { ePackage, parentClass, childClass, child, single } = createModel()
        const p = ePackage.getEFactoryInstance().create(parentClass)
        const c = ePackage.getEFactoryInstance().create(childClass)
        c.eSet(single, p)
        expect(p.eGet(child)).toBe(c)
        expect(c.eContainmentFeature()).toBe(child)
    })
})
