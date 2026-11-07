// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EAttribute, EAttributeExt, EClass, EClassExt, EOperation, EOperationExt } from "./internal.js"

// newCycleClass returns a class with one attribute and one operation, both named after the class
function newCycleClass(name: string): [EClassExt, EAttribute, EOperation] {
    const eClass = new EClassExt()
    eClass.setName(name)
    const eAttribute = new EAttributeExt()
    eAttribute.setName(name + "Attribute")
    eClass.getEStructuralFeatures().add(eAttribute)
    const eOperation = new EOperationExt()
    eOperation.setName(name + "Operation")
    eClass.getEOperations().add(eOperation)
    return [eClass, eAttribute, eOperation]
}

// readDerived reads every value derived from the super types of eClass
function readDerived(eClass: EClass) {
    eClass.getEAllSuperTypes()
    eClass.getEAllStructuralFeatures()
    eClass.getEAllAttributes()
    eClass.getEAllReferences()
    eClass.getEAllContainments()
    eClass.getEAllCrossReferences()
    eClass.getEAllOperations()
    eClass.getEContainmentFeatures()
    eClass.getECrossReferenceFeatures()
    eClass.getEIDAttribute()
    eClass.getFeatureCount()
    eClass.getOperationCount()
    eClass.getEStructuralFeatureFromName("")
    eClass.isSuperTypeOf(eClass)
}

describe("EClassExt super types cycle", () => {
    // A class among its own super types is invalid, but neither its modification nor the reads of
    // its derived values recurse without end: the class inherits from itself nothing more than it has.
    test("self", () => {
        const [eClass, eAttribute, eOperation] = newCycleClass("a")
        readDerived(eClass)

        eClass.getESuperTypes().add(eClass)
        readDerived(eClass)
        expect(eClass.getEAllSuperTypes().toArray()).toEqual([eClass])
        expect(eClass.getEAllStructuralFeatures().toArray()).toEqual([eAttribute])
        expect(eClass.getEAllAttributes().toArray()).toEqual([eAttribute])
        expect(eClass.getEAllOperations().toArray()).toEqual([eOperation])
        expect(eClass.getFeatureID(eAttribute)).toBe(0)

        // modified in the cycle
        const eAttribute2 = new EAttributeExt()
        eAttribute2.setName("aAttribute2")
        eClass.getEStructuralFeatures().add(eAttribute2)
        eAttribute2.setID(true)
        expect(eClass.getEAllAttributes().toArray()).toEqual([eAttribute, eAttribute2])
        expect(eClass.getEIDAttribute()).toBe(eAttribute2)

        // the cycle removed
        eClass.getESuperTypes().remove(eClass)
        expect(eClass.getEAllSuperTypes().isEmpty()).toBeTruthy()
        expect(eClass.getEAllStructuralFeatures().toArray()).toEqual([eAttribute, eAttribute2])
    })

    // a -> b -> a, and c -> a: every class of the cycle or above it is read and modified in any order
    describe.each([
        ["a first", [0, 1, 2]],
        ["b first", [1, 0, 2]],
        ["c first", [2, 1, 0]]
    ])("two classes, %s", (_, order) => {
        test("read, modified, cycle removed", () => {
            const [a, aAttribute] = newCycleClass("a")
            const [b, bAttribute] = newCycleClass("b")
            const [c, cAttribute] = newCycleClass("c")
            const classes = [a, b, c]
            c.getESuperTypes().add(a)
            a.getESuperTypes().add(b)
            for (const i of order) {
                readDerived(classes[i])
            }

            // the edge closing the cycle, added once the values are built
            b.getESuperTypes().add(a)
            for (const i of order) {
                readDerived(classes[i])
            }
            expect(a.getEAllSuperTypes().contains(b)).toBeTruthy()
            expect(b.getEAllSuperTypes().contains(a)).toBeTruthy()
            expect(c.getEAllSuperTypes().contains(a)).toBeTruthy()
            expect(c.getEAllSuperTypes().contains(b)).toBeTruthy()
            expect(c.getEAllStructuralFeatures().contains(cAttribute)).toBeTruthy()

            // modified in the cycle: the sub classes are invalidated
            const aAttribute2 = new EAttributeExt()
            aAttribute2.setName("aAttribute2")
            a.getEStructuralFeatures().add(aAttribute2)
            expect(c.getEAllAttributes().contains(aAttribute2)).toBeTruthy()
            expect(c.getEStructuralFeatureFromName("aAttribute2")).toBe(aAttribute2)

            // the cycle removed: the values are the ones of an acyclic hierarchy again
            b.getESuperTypes().remove(a)
            expect(c.getEAllSuperTypes().toArray()).toEqual([b, a])
            expect(c.getEAllStructuralFeatures().toArray()).toEqual([bAttribute, aAttribute, aAttribute2, cAttribute])
            expect(c.getFeatureID(cAttribute)).toBe(3)
            expect(b.getEAllSuperTypes().isEmpty()).toBeTruthy()
        })
    })

    // the cycle closed by the first add, before any value is built
    test("closed before any read", () => {
        const [a] = newCycleClass("a")
        const [b] = newCycleClass("b")
        a.getESuperTypes().add(b)
        b.getESuperTypes().add(a)
        readDerived(b)
        readDerived(a)
        expect(a.isSuperTypeOf(b)).toBeTruthy()
        expect(b.isSuperTypeOf(a)).toBeTruthy()
    })
})

describe("EClassExt super types lattice", () => {
    // Each class of a lattice inherits from the two classes before it: a modification of the first
    // one reaches the last one through an exponential number of paths, and invalidates each class
    // once. The modification is synchronous: a timeout cannot interrupt it, the elapsed time is
    // checked instead.
    test("a modification visits each class once", () => {
        const classes: EClassExt[] = []
        for (let i = 0; i < 64; i++) {
            const eClass = new EClassExt()
            for (const j of [i - 1, i - 2]) {
                if (j >= 0) {
                    eClass.getESuperTypes().add(classes[j])
                }
            }
            classes.push(eClass)
        }
        const last = classes[classes.length - 1]
        expect(last.getEAllSuperTypes().size()).toBe(63)

        const start = performance.now()
        const eAttribute = new EAttributeExt()
        eAttribute.setName("attribute")
        classes[0].getEStructuralFeatures().add(eAttribute)
        expect(last.getEAllAttributes().toArray()).toEqual([eAttribute])
        expect(performance.now() - start).toBeLessThan(1000)
    })
})
