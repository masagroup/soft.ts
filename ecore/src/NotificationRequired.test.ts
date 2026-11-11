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
    BasicEObject,
    EList,
    ENotification,
    EObject,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY
} from "./internal.js"

class RecordingAdapter extends AbstractEAdapter {
    notifications: ENotification[] = []

    notifyChanged(notification: ENotification): void {
        this.notifications.push(notification)
    }
}

function newObject(): { eObject: EObject; values: EList<string> } {
    const f = getEcoreFactory()
    const ePackage = f.createEPackage()
    ePackage.setName("p")
    ePackage.setNsURI("http://p")
    ePackage.setEFactoryInstance(f.createEFactory())
    const eClass = f.createEClass()
    eClass.setName("C")
    ePackage.getEClassifiers().add(eClass)
    const eAttribute = f.createEAttribute()
    eAttribute.setName("values")
    eAttribute.setEType(getEcorePackage().getEString())
    eAttribute.setUpperBound(UNBOUNDED_MULTIPLICITY)
    eClass.getEStructuralFeatures().add(eAttribute)
    const eObject = ePackage.getEFactoryInstance().create(eClass)
    return { eObject, values: eObject.eGet(eAttribute) as EList<string> }
}

describe("notification required", () => {
    // a list write does not create the adapter list of its notifier, which would then require
    // notifications for every later change
    test("listWriteCreatesNoAdapters", () => {
        const { eObject, values } = newObject()
        values.add("a")
        values.set(0, "b")
        values.removeAt(0)
        values.clear()
        expect((eObject as BasicEObject).eBasicAdapters()).toBeNull()

        const adapter = new RecordingAdapter()
        eObject.eAdapters().add(adapter)
        values.add("c")
        expect(adapter.notifications.length).toBe(1)
        expect(adapter.notifications[0].getNewValue()).toBe("c")
    })
})
