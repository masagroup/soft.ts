// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { AbstractEAdapter, EList, ENotification, EObject, EventType, getEcoreFactory, getEcorePackage } from "./internal.js"

// C has the super types X and Y: the features of Y have an id in C greater than their id in Y
function createModel() {
    const f = getEcoreFactory()
    const ePackage = f.createEPackage()
    ePackage.setName("mi")
    ePackage.setNsURI("http://mi")

    const x = f.createEClass()
    x.setName("X")
    const x1 = f.createEAttribute()
    x1.setName("x1")
    x1.setEType(getEcorePackage().getEString())
    x.getEStructuralFeatures().add(x1)

    const y = f.createEClass()
    y.setName("Y")
    const kids = f.createEReference()
    kids.setName("kids")
    kids.setContainment(true)
    kids.setUpperBound(-1)
    y.getEStructuralFeatures().add(kids)
    const friends = f.createEReference()
    friends.setName("friends")
    friends.setUpperBound(-1)
    y.getEStructuralFeatures().add(friends)

    const c = f.createEClass()
    c.setName("C")
    c.getESuperTypes().add(x)
    c.getESuperTypes().add(y)

    const z = f.createEClass()
    z.setName("Z")
    const parent = f.createEReference()
    parent.setName("parent")
    parent.setEType(c)
    z.getEStructuralFeatures().add(parent)
    const fans = f.createEReference()
    fans.setName("fans")
    fans.setUpperBound(-1)
    fans.setEType(c)
    z.getEStructuralFeatures().add(fans)

    kids.setEType(z)
    friends.setEType(z)
    friends.setEOpposite(fans)
    fans.setEOpposite(friends)

    for (const eClass of [x, y, c, z]) ePackage.getEClassifiers().add(eClass)
    return { ePackage, x, y, c, z, x1, kids, friends, fans }
}

describe("multiple inheritance", () => {
    test("feature ids", () => {
        const { ePackage, c, y, kids } = createModel()
        expect(y.getFeatureID(kids)).toBe(0)
        expect(c.getFeatureID(kids)).toBe(1)
        const o = ePackage.getEFactoryInstance().create(c)
        expect((o as any).eFeatureID(kids)).toBe(1)
    })

    test("containment declared in the second super type", () => {
        const { ePackage, c, z, x1, kids } = createModel()
        const o = ePackage.getEFactoryInstance().create(c)
        const kid = ePackage.getEFactoryInstance().create(z)

        const notifications: ENotification[] = []
        o.eAdapters().add(
            new (class extends AbstractEAdapter {
                notifyChanged(n: ENotification) {
                    notifications.push(n)
                }
            })()
        )
        ;(o.eGet(kids) as EList<EObject>).add(kid)

        expect(kid.eContainer()).toBe(o)
        expect(kid.eContainmentFeature()).toBe(kids)
        expect(notifications.map((n) => [n.getEventType(), n.getFeature()])).toEqual([[EventType.ADD, kids]])
        expect(notifications[0].getFeature()).not.toBe(x1)
        expect(o.eContents().toArray()).toEqual([kid])

        // remove through the container feature of the child
        const other = ePackage.getEFactoryInstance().create(c)
        ;(other.eGet(kids) as EList<EObject>).add(kid)
        expect(kid.eContainer()).toBe(other)
        expect((o.eGet(kids) as EList<EObject>).isEmpty()).toBeTruthy()
    })

    test("opposite declared in the second super type", () => {
        const { ePackage, c, z, friends, fans } = createModel()
        const o = ePackage.getEFactoryInstance().create(c)
        const fan = ePackage.getEFactoryInstance().create(z)

        // from Z: the opposite (friends) has id 1 in Y but 2 in C
        ;(fan.eGet(fans) as EList<EObject>).add(o)
        expect((o.eGet(friends) as EList<EObject>).toArray()).toEqual([fan])

        ;(fan.eGet(fans) as EList<EObject>).remove(o)
        expect((o.eGet(friends) as EList<EObject>).isEmpty()).toBeTruthy()

        // from C
        ;(o.eGet(friends) as EList<EObject>).add(fan)
        expect((fan.eGet(fans) as EList<EObject>).toArray()).toEqual([o])
    })
})
