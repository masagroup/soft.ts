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
    EAttribute,
    EClass,
    EcoreUtils,
    EFactoryExt,
    EList,
    EObject,
    EObjectInternal,
    EPackage,
    EReference,
    getEcoreFactory,
    getEcorePackage,
    ImmutableEList,
    URI,
    XMIProcessor,
    XMLProcessor
} from "./internal.js"

function loadPackage(filename: string): EPackage {
    const xmiProcessor = new XMIProcessor()
    const uri = new URI("testdata/" + filename)
    const resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded()).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    const ePackage = resource.eContents().get(0) as EPackage
    ePackage.setEFactoryInstance(new EFactoryExt())
    return ePackage
}

describe("EcoreUtils", () => {
    describe("equals", () => {
        test("null", () => {
            expect(EcoreUtils.equals(null, null)).toBeTruthy()

            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            expect(EcoreUtils.equals(object, null)).toBeFalsy()
            expect(EcoreUtils.equals(null, object)).toBeFalsy()
        })

        test("proxy", () => {
            const mockObject1 = mock<EObjectInternal>()
            const mockObject2 = mock<EObjectInternal>()
            const obj1 = instance(mockObject1)
            const obj2 = instance(mockObject2)

            when(mockObject1.eIsProxy()).thenReturn(true)
            when(mockObject1.eProxyURI()).thenReturn(new URI("file://test"))
            when(mockObject2.eProxyURI()).thenReturn(new URI("file://test"))
            expect(EcoreUtils.equals(obj1, obj2)).toBeTruthy()

            when(mockObject1.eIsProxy()).thenReturn(true)
            when(mockObject1.eProxyURI()).thenReturn(new URI("file://test1"))
            when(mockObject2.eProxyURI()).thenReturn(new URI("file://test2"))
            expect(EcoreUtils.equals(obj1, obj2)).toBeFalsy()

            when(mockObject1.eIsProxy()).thenReturn(true)
            when(mockObject1.eProxyURI()).thenReturn(new URI("file://test"))
            when(mockObject2.eProxyURI()).thenReturn(null)
            expect(EcoreUtils.equals(obj1, obj2)).toBeFalsy()

            when(mockObject1.eIsProxy()).thenReturn(false)
            when(mockObject2.eIsProxy()).thenReturn(true)
            expect(EcoreUtils.equals(obj1, obj2)).toBeFalsy()
        })

        test("class", () => {
            const mockObject1 = mock<EObjectInternal>()
            const mockObject2 = mock<EObjectInternal>()
            const obj1 = instance(mockObject1)
            const obj2 = instance(mockObject2)
            const mockClass1 = mock<EClass>()
            const mockClass2 = mock<EClass>()
            when(mockObject1.eIsProxy()).thenReturn(false)
            when(mockObject1.eClass()).thenReturn(instance(mockClass1))
            when(mockObject2.eIsProxy()).thenReturn(false)
            when(mockObject2.eClass()).thenReturn(instance(mockClass2))
        })
    })

    describe("copy", () => {
        test("null", () => {
            expect(EcoreUtils.copy(null)).toBeNull()
        })

        test("attribute", () => {
            // the meta model
            const ePackage = getEcoreFactory().createEPackage()
            const eFactory = getEcoreFactory().createEFactory()
            const eClass = getEcoreFactory().createEClass()
            ePackage.setEFactoryInstance(eFactory)
            ePackage.getEClassifiers().add(eClass)
            const eAttribute1 = getEcoreFactory().createEAttribute()
            eAttribute1.setName("attribute1")
            eAttribute1.setEType(getEcorePackage().getEInt())
            const eAttribute2 = getEcoreFactory().createEAttribute()
            eAttribute2.setName("attribute2")
            eAttribute2.setEType(getEcorePackage().getEString())
            eClass.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute1, eAttribute2]))

            // the model
            const eObject = eFactory.create(eClass)
            eObject.eSet(eAttribute1, 2)
            eObject.eSet(eAttribute2, "test")

            const eObjectCopy = EcoreUtils.copy(eObject)
            expect(EcoreUtils.equals(eObject, eObjectCopy)).toBeTruthy()

            eObject.eSet(eAttribute2, "test2")
            expect(EcoreUtils.equals(eObject, eObjectCopy)).toBeFalsy()
        })

        test("allAttribute", () => {
            // the meta model
            const ePackage = getEcoreFactory().createEPackage()
            const eFactory = getEcoreFactory().createEFactory()
            const eClass = getEcoreFactory().createEClass()
            ePackage.setEFactoryInstance(eFactory)
            ePackage.getEClassifiers().add(eClass)
            const eAttribute1 = getEcoreFactory().createEAttribute()
            eAttribute1.setName("attribute1")
            eAttribute1.setEType(getEcorePackage().getEInt())
            const eAttribute2 = getEcoreFactory().createEAttribute()
            eAttribute2.setName("attribute2")
            eAttribute2.setEType(getEcorePackage().getEString())
            eClass.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute1, eAttribute2]))

            // the model
            const eObject1 = eFactory.create(eClass)
            eObject1.eSet(eAttribute1, 2)
            eObject1.eSet(eAttribute2, "test")

            const eObject2 = eFactory.create(eClass)
            eObject2.eSet(eAttribute1, 2)
            eObject2.eSet(eAttribute2, "test2")

            const list = new ImmutableEList<EObject>([eObject1, eObject2])
            const listCopy = EcoreUtils.copyAll(list)
            expect(EcoreUtils.equalsAll(list, listCopy)).toBeTruthy()
        })

        test("containment", () => {
            // the meta model
            const ePackage = getEcoreFactory().createEPackage()
            const eFactory = getEcoreFactory().createEFactory()
            const eClass1 = getEcoreFactory().createEClass()
            const eClass2 = getEcoreFactory().createEClass()
            ePackage.setEFactoryInstance(eFactory)
            ePackage.getEClassifiers().addAll(new ImmutableEList<EClass>([eClass1, eClass2]))

            const eAttribute1 = getEcoreFactory().createEAttribute()
            eAttribute1.setName("attribute1")
            eAttribute1.setEType(getEcorePackage().getEInt())
            const eAttribute2 = getEcoreFactory().createEAttribute()
            eAttribute2.setName("attribute2")
            eAttribute2.setEType(getEcorePackage().getEString())
            eClass2.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute1, eAttribute2]))

            const eReference1 = getEcoreFactory().createEReference()
            eReference1.setName("reference1")
            eReference1.setContainment(true)
            eReference1.setEType(eClass2)
            eClass1.getEStructuralFeatures().add(eReference1)

            // the model
            const eObject1 = eFactory.create(eClass1)
            const eObject2 = eFactory.create(eClass2)
            eObject2.eSet(eAttribute1, 2)
            eObject2.eSet(eAttribute2, "test1")
            eObject1.eSet(eReference1, eObject2)

            const eObject1Copy = EcoreUtils.copy(eObject1)
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeTruthy()

            eObject2.eSet(eAttribute2, "test2")
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeFalsy()
        })

        test("references", () => {
            // the meta model
            const ePackage = getEcoreFactory().createEPackage()
            const eFactory = getEcoreFactory().createEFactory()
            const eClass1 = getEcoreFactory().createEClass()
            const eClass2 = getEcoreFactory().createEClass()
            ePackage.setEFactoryInstance(eFactory)
            ePackage.getEClassifiers().addAll(new ImmutableEList<EClass>([eClass1, eClass2]))

            const eAttribute1 = getEcoreFactory().createEAttribute()
            eAttribute1.setName("attribute1")
            eAttribute1.setEType(getEcorePackage().getEInt())
            const eAttribute2 = getEcoreFactory().createEAttribute()
            eAttribute2.setName("attribute2")
            eAttribute2.setEType(getEcorePackage().getEString())
            eClass2.getEStructuralFeatures().addAll(new ImmutableEList([eAttribute1, eAttribute2]))

            const eReference1 = getEcoreFactory().createEReference()
            eReference1.setName("reference1")
            eReference1.setContainment(true)
            eReference1.setEType(eClass2)
            const eReference2 = getEcoreFactory().createEReference()
            eReference2.setName("reference2")
            eReference2.setContainment(false)
            eReference2.setEType(eClass2)
            eClass1.getEStructuralFeatures().addAll(new ImmutableEList<EReference>([eReference1, eReference2]))

            // the model
            const eObject1 = eFactory.create(eClass1)
            const eObject2 = eFactory.create(eClass2)
            eObject2.eSet(eAttribute1, 2)
            eObject2.eSet(eAttribute2, "test")
            eObject1.eSet(eReference1, eObject2)
            eObject1.eSet(eReference2, eObject2)

            const eObject1Copy = EcoreUtils.copy(eObject1)
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeTruthy()

            eObject2.eSet(eAttribute2, "test2")
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeFalsy()
        })

        test("proxy", () => {
            const ePackage = getEcoreFactory().createEPackage()
            const eFactory = getEcoreFactory().createEFactory()
            const eClass = getEcoreFactory().createEClass()
            ePackage.setEFactoryInstance(eFactory)
            ePackage.getEClassifiers().add(eClass)

            // the model
            const eObject = eFactory.create(eClass)
            ;(eObject as EObjectInternal).eSetProxyURI(new URI("file://test"))

            const eObjectCopy = EcoreUtils.copy(eObject)
            expect(EcoreUtils.equals(eObject, eObjectCopy)).toBeTruthy()
        })

        test("real", () => {
            const eClass = getEcorePackage().getEClass()
            const eClassCopy = EcoreUtils.copy(eClass)
            expect(EcoreUtils.equals(eClass, eClassCopy)).toBeTruthy()
        })
    })

    describe("resolveAll", () => {
        const shopPackage = loadPackage("shop.ecore")
        const productClass = shopPackage.getEClassifier("Product") as EClass
        const productAttibuteName = productClass.getEStructuralFeatureFromName("name") as EAttribute
        const orderPackage = loadPackage("orders.ecore")
        const ordersClass = orderPackage.getEClassifier("Orders") as EClass
        const ordersOrderReference = ordersClass.getEStructuralFeatureFromName("order") as EReference
        const orderClass = orderPackage.getEClassifier("Order") as EClass
        const orderNbAttribute = orderClass.getEStructuralFeatureFromName("nb") as EAttribute
        const orderProductReference = orderClass.getEStructuralFeatureFromName("product") as EReference
        const xmlProcessor = new XMLProcessor([shopPackage, orderPackage])

        test("resolveAll", () => {
            const resource = xmlProcessor.loadSync(new URI("testdata/orders.xml"))
            expect(resource).not.toBeNull()
            expect(resource.getErrors().isEmpty()).toBeTruthy()

            const orders = resource.eContents().get(0)
            EcoreUtils.resolveAll(orders)

            const ordersReferences = orders.eGet(ordersOrderReference) as EList<EObject>
            expect(ordersReferences.size()).toBe(10)
            const order = ordersReferences.get(0)
            expect(order.eGet(orderNbAttribute)).toBe(2)
            const product = order.eGetResolve(orderProductReference, false)
            expect(product.eIsProxy()).toBeFalsy()
            expect(product.eGet(productAttibuteName)).toBe("Product 0")
        })

        test("resolveAllAsync", async () => {
            const resource = await xmlProcessor.load(new URI("testdata/orders.xml"))
            expect(resource).not.toBeNull()
            expect(resource.getErrors().isEmpty()).toBeTruthy()

            const orders = resource.eContents().get(0)
            await EcoreUtils.resolveAllAsync(orders)

            const ordersReferences = orders.eGet(ordersOrderReference) as EList<EObject>
            expect(ordersReferences.size()).toBe(10)
            const order = ordersReferences.get(0)
            expect(order.eGet(orderNbAttribute)).toBe(2)
            const product = order.eGetResolve(orderProductReference, false)
            expect(product.eIsProxy()).toBeFalsy()
            expect(product.eGet(productAttibuteName)).toBe("Product 0")
        })
    })
})
