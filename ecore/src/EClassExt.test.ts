// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import {
    EAttributeExt,
    EClassExt,
    EOperation,
    EOperationExt,
    EReferenceExt,
    getEcoreFactory,
    getEcorePackage,
    ImmutableEList
} from "./internal.js"

function containsSubClass(eSuper: EClassExt, eClass: EClassExt): boolean {
    return eSuper._subClasses.indexOf(eClass) != -1
}

describe("EClassExt", () => {
    test("instance", () => {
        let eClass = new EClassExt()
        eClass.setName("eClass")
        expect(eClass.getName()).toBe("eClass")
        expect(eClass.getEAllAttributes().isEmpty()).toBeTruthy()
    })

    test("superTypes", () => {
        let eClass = new EClassExt()
        let eSuperClass = new EClassExt()
        let eSuperClass2 = new EClassExt()
        let eSuperClass3 = new EClassExt()
        let eSuperClassClass = new EClassExt()

        eClass.getESuperTypes().add(eSuperClass)
        eSuperClass.getESuperTypes().add(eSuperClassClass)

        // test super types getters
        expect(eClass.getESuperTypes().toArray()).toEqual([eSuperClass])
        expect(eClass.getEAllSuperTypes().toArray()).toEqual([eSuperClassClass, eSuperClass])
        expect(containsSubClass(eSuperClass, eClass)).toBeTruthy()

        // remove super class
        eClass.getESuperTypes().remove(eSuperClass)
        expect(containsSubClass(eSuperClass, eClass)).toBeFalsy()

        // add many super classes
        eClass.getESuperTypes().addAll(new ImmutableEList([eSuperClass, eSuperClass2]))
        expect(containsSubClass(eSuperClass, eClass)).toBeTruthy()
        expect(containsSubClass(eSuperClass2, eClass)).toBeTruthy()

        // set super classes
        eClass.getESuperTypes().set(1, eSuperClass3)
        expect(containsSubClass(eSuperClass, eClass)).toBeTruthy()
        expect(containsSubClass(eSuperClass3, eClass)).toBeTruthy()
    })

    test("featuresAdd", () => {
        let eClass = new EClassExt()
        let eAttribute = new EAttributeExt()
        expect(eAttribute.getFeatureID()).toBe(-1)

        eClass.getEStructuralFeatures().add(eAttribute)

        expect(eClass.getFeatureCount()).toBe(1)
        expect(eAttribute.getFeatureID()).toBe(0)
        expect(eAttribute.getEContainingClass()).toBe(eClass)
    })

    test("featuresGetter", () => {
        let eClass = new EClassExt()
        let eAttribute1 = new EAttributeExt()
        let eAttribute2 = new EAttributeExt()
        let eReference1 = new EReferenceExt()
        let eReference2 = new EReferenceExt()

        eClass.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute1, eReference1, eAttribute2, eReference2]))

        // feature ids
        expect(eClass.getFeatureCount()).toBe(4)
        expect(eClass.getEStructuralFeature(0)).toBe(eAttribute1)
        expect(eClass.getEStructuralFeature(1)).toBe(eReference1)
        expect(eClass.getEStructuralFeature(2)).toBe(eAttribute2)
        expect(eClass.getEStructuralFeature(3)).toBe(eReference2)
        expect(eClass.getEStructuralFeature(4)).toBe(null)
        expect(eAttribute1.getFeatureID()).toBe(0)
        expect(eReference1.getFeatureID()).toBe(1)
        expect(eAttribute2.getFeatureID()).toBe(2)
        expect(eReference2.getFeatureID()).toBe(3)
        expect(eClass.getFeatureID(eAttribute1)).toBe(0)
        expect(eClass.getFeatureID(eReference1)).toBe(1)
        expect(eClass.getFeatureID(eAttribute2)).toBe(2)
        expect(eClass.getFeatureID(eReference2)).toBe(3)

        // collections
        expect(eClass.getEAllStructuralFeatures().toArray()).toEqual([
            eAttribute1,
            eReference1,
            eAttribute2,
            eReference2
        ])
        expect(eClass.getEAllAttributes().toArray()).toEqual([eAttribute1, eAttribute2])
        expect(eClass.getEAllReferences().toArray()).toEqual([eReference1, eReference2])
        expect(eClass.getEAttributes().toArray()).toEqual([eAttribute1, eAttribute2])
        expect(eClass.getEReferences().toArray()).toEqual([eReference1, eReference2])

        // insert another attribute front
        let eAttribute3 = new EAttributeExt()
        eClass.getEStructuralFeatures().insert(0, eAttribute3)
        expect(eClass.getEAllAttributes().toArray()).toEqual([eAttribute3, eAttribute1, eAttribute2])
        expect(eClass.getEAttributes().toArray()).toEqual([eAttribute3, eAttribute1, eAttribute2])
        expect(eClass.getFeatureCount()).toBe(5)
        expect(eClass.getEStructuralFeature(0)).toBe(eAttribute3)
        expect(eClass.getEStructuralFeature(1)).toBe(eAttribute1)
        expect(eClass.getEStructuralFeature(2)).toBe(eReference1)
        expect(eClass.getEStructuralFeature(3)).toBe(eAttribute2)
        expect(eClass.getEStructuralFeature(4)).toBe(eReference2)
        expect(eAttribute3.getFeatureID()).toBe(0)
        expect(eAttribute1.getFeatureID()).toBe(1)
        expect(eReference1.getFeatureID()).toBe(2)
        expect(eAttribute2.getFeatureID()).toBe(3)
        expect(eReference2.getFeatureID()).toBe(4)
    })

    test("featuresGettersWithSuperType", () => {
        let eClass = new EClassExt()
        let eSuperClass = new EClassExt()
        eClass.getESuperTypes().add(eSuperClass)

        let eAttribute1 = new EAttributeExt()
        let eAttribute2 = new EAttributeExt()
        let eReference1 = new EReferenceExt()
        let eReference2 = new EReferenceExt()

        eClass.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute1, eReference1]))
        eSuperClass.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute2, eReference2]))

        // collections
        expect(eSuperClass.getEAllStructuralFeatures().toArray()).toEqual([eAttribute2, eReference2])
        expect(eSuperClass.getEAllAttributes().toArray()).toEqual([eAttribute2])
        expect(eSuperClass.getEAttributes().toArray()).toEqual([eAttribute2])
        expect(eSuperClass.getEAllReferences().toArray()).toEqual([eReference2])
        expect(eSuperClass.getEReferences().toArray()).toEqual([eReference2])

        expect(eClass.getEAllStructuralFeatures().toArray()).toEqual([
            eAttribute2,
            eReference2,
            eAttribute1,
            eReference1
        ])
        expect(eClass.getEAllAttributes().toArray()).toEqual([eAttribute2, eAttribute1])
        expect(eClass.getEAttributes().toArray()).toEqual([eAttribute1])
        expect(eClass.getEAllReferences().toArray()).toEqual([eReference2, eReference1])
        expect(eClass.getEReferences().toArray()).toEqual([eReference1])

        eClass.getESuperTypes().remove(eSuperClass)

        expect(eClass.getEAllStructuralFeatures().toArray()).toEqual([eAttribute1, eReference1])
        expect(eClass.getEAllAttributes().toArray()).toEqual([eAttribute1])
        expect(eClass.getEAttributes().toArray()).toEqual([eAttribute1])
        expect(eClass.getEAllReferences().toArray()).toEqual([eReference1])
        expect(eClass.getEReferences().toArray()).toEqual([eReference1])
    })

    test("featuresGetFromName", () => {
        let eClass = new EClassExt()
        let eAttribute1 = new EAttributeExt()
        eAttribute1.setName("MyAttribute1")
        let eAttribute2 = new EAttributeExt()
        eAttribute2.setName("MyAttribute2")
        eClass.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute1, eAttribute2]))
        expect(eClass.getEStructuralFeatureFromName("MyAttribute1")).toBe(eAttribute1)
        expect(eClass.getEStructuralFeatureFromName("MyAttribute2")).toBe(eAttribute2)
        expect(eClass.getEStructuralFeatureFromName("MyAttribute3")).toBe(undefined)
    })

    test("attributeID", () => {
        let eClass = new EClassExt()
        expect(eClass.getEIDAttribute()).toEqual(null)

        let eAttribute = new EAttributeExt()
        eClass.getEStructuralFeatures().add(eAttribute)

        eAttribute.setID(true)
        expect(eClass.getEIDAttribute()).toEqual(eAttribute)

        eAttribute.setID(false)
        expect(eClass.getEIDAttribute()).toEqual(null)
    })

    test("operationsGetter", () => {
        let eClass = new EClassExt()
        let eOperation1 = new EOperationExt()
        let eOperation2 = new EOperationExt()

        eClass.getEOperations().addAll(new ImmutableEList([eOperation1, eOperation2]))

        expect(eClass.getOperationCount()).toBe(2)
        expect(eClass.getEOperation(0)).toBe(eOperation1)
        expect(eClass.getEOperation(1)).toBe(eOperation2)
        expect(eClass.getEOperation(2)).toBe(null)
        expect(eOperation1.getOperationID()).toBe(0)
        expect(eOperation2.getOperationID()).toBe(1)
        expect(eClass.getOperationID(eOperation1)).toBe(0)
        expect(eClass.getOperationID(eOperation2)).toBe(1)

        expect(eClass.getEAllOperations().toArray()).toEqual([eOperation1, eOperation2])
        expect(eClass.getEOperations().toArray()).toEqual([eOperation1, eOperation2])

        let eOperation3 = new EOperationExt()
        eClass.getEOperations().insert(0, eOperation3)

        expect(eClass.getOperationCount()).toBe(3)
        expect(eClass.getEOperation(0)).toBe(eOperation3)
        expect(eClass.getEOperation(1)).toBe(eOperation1)
        expect(eClass.getEOperation(2)).toBe(eOperation2)
        expect(eOperation3.getOperationID()).toBe(0)
        expect(eOperation1.getOperationID()).toBe(1)
        expect(eOperation2.getOperationID()).toBe(2)
        expect(eClass.getOperationID(eOperation3)).toBe(0)
        expect(eClass.getOperationID(eOperation1)).toBe(1)
        expect(eClass.getOperationID(eOperation2)).toBe(2)
    })

    test("operationsGetterWithSuperTypes", () => {
        let eClass = new EClassExt()
        let eSuperClass = new EClassExt()
        eClass.getESuperTypes().add(eSuperClass)

        let eOperation1 = new EOperationExt()
        let eOperation2 = new EOperationExt()

        eClass.getEOperations().add(eOperation1)
        eSuperClass.getEOperations().add(eOperation2)

        expect(eSuperClass.getEAllOperations().toArray()).toEqual([eOperation2])
        expect(eSuperClass.getEOperations().toArray()).toEqual([eOperation2])

        expect(eClass.getEAllOperations().toArray()).toEqual([eOperation2, eOperation1])
        expect(eClass.getEOperations().toArray()).toEqual([eOperation1])

        eClass.getESuperTypes().remove(eSuperClass)

        expect(eClass.getEAllOperations().toArray()).toEqual([eOperation1])
        expect(eClass.getEOperations().toArray()).toEqual([eOperation1])
    })

    test("eAllContainments", () => {
        let eClass = new EClassExt()
        let eSuperClass = new EClassExt()
        eClass.getESuperTypes().add(eSuperClass)

        let eReference0 = new EReferenceExt()
        eReference0.setName("ref0")
        let eReference1 = new EReferenceExt()
        eReference1.setName("ref1")
        eReference1.setContainment(true)
        let eReference2 = new EReferenceExt()
        eReference2.setName("ref2")
        eReference2.setContainment(true)

        eClass.getEStructuralFeatures().addAll(new ImmutableEList([eReference0, eReference1]))
        eSuperClass.getEStructuralFeatures().add(eReference2)

        expect(eClass.getEAllContainments().toArray()).toEqual([eReference2, eReference1])
    })

    test("eContainmentsFeatures", () => {
        let eClass = new EClassExt()

        let eReference0 = new EReferenceExt()
        eReference0.setName("ref0")
        let eReference1 = new EReferenceExt()
        eReference1.setName("ref1")
        eReference1.setContainment(true)
        let eReference2 = new EReferenceExt()
        eReference2.setName("ref2")

        eClass.getEStructuralFeatures().addAll(new ImmutableEList([eReference0, eReference1, eReference2]))

        expect(eClass.getEContainmentFeatures().toArray()).toEqual([eReference1])
        expect(eClass.getECrossReferenceFeatures().toArray()).toEqual([eReference0, eReference2])
    })

    test("isSuperTypeOf", () => {
        let eClass = new EClassExt()
        let eOther = new EClassExt()
        let eSuperClass = new EClassExt()
        eClass.getESuperTypes().add(eSuperClass)

        expect(eClass.isSuperTypeOf(eClass)).toBeTruthy()
        expect(eSuperClass.isSuperTypeOf(eClass)).toBeTruthy()
        expect(eClass.isSuperTypeOf(eSuperClass)).toBeFalsy()
        expect(eOther.isSuperTypeOf(eClass)).toBeFalsy()
    })

    test("getOverride", () => {
        let eClass = new EClassExt()
        let eSuperClass = new EClassExt()
        eClass.getESuperTypes().add(eSuperClass)

        let mockOperation1 = mock<EOperation>()
        let mockOperation2 = mock<EOperation>()
        let operation1 = instance(mockOperation1)
        let operation2 = instance(mockOperation2)

        eClass.getEOperations().add(operation1)
        eSuperClass.getEOperations().add(operation2)

        when(mockOperation1.isOverrideOf(operation2)).thenReturn(true)
        expect(eClass.getOverride(operation2)).toBe(operation1)
    })

    test("eClassEClass", () => {
        expect(getEcorePackage().getEClass()).toEqual(getEcoreFactory().createEClass().eClass())
    })
})
