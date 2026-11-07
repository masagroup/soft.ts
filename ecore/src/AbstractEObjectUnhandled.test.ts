// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EClass, EObjectImpl, getEcoreFactory, getEcorePackage } from "./internal.js"

// a class whose static features no generated method handles: its class has one attribute
class Unhandled extends EObjectImpl {
    constructor(private _eStaticClass: EClass) {
        super()
    }

    eStaticClass(): EClass {
        return this._eStaticClass
    }
}

// A static feature that the generated eSetFromID, eIsSetFromID or eUnsetFromID of a class does not
// handle, an unchangeable feature such as the package of a classifier or the derived attributes of
// a class, throws: it recursed between eSet and eSetFromID until the stack overflowed. A malformed
// XMI document setting such a feature failed decoding with a RangeError.
describe("AbstractEObject unhandled static feature", () => {
    test.each([
        ["ePackage", getEcorePackage().getEClassifier_EPackage()],
        ["eAllAttributes", getEcorePackage().getEClass_EAllAttributes()]
    ])("%s", (_, feature) => {
        const eClass = getEcoreFactory().createEClass()
        expect(() => eClass.eSet(feature, null)).toThrow(new Error("The feature '" + feature.getName() + "' cannot be set"))
        expect(() => eClass.eUnset(feature)).toThrow(new Error("The feature '" + feature.getName() + "' cannot be unset"))
    })

    test("isSet", () => {
        const eStaticClass = getEcoreFactory().createEClass()
        const eAttribute = getEcoreFactory().createEAttribute()
        eAttribute.setName("attribute")
        eAttribute.setEType(getEcorePackage().getEString())
        eStaticClass.getEStructuralFeatures().add(eAttribute)
        const eObject = new Unhandled(eStaticClass)
        expect(() => eObject.eIsSet(eAttribute)).toThrow(new Error("The feature 'attribute' cannot be checked"))
        expect(() => eObject.eSet(eAttribute, "value")).toThrow(new Error("The feature 'attribute' cannot be set"))
        expect(() => eObject.eUnset(eAttribute)).toThrow(new Error("The feature 'attribute' cannot be unset"))
    })
})
