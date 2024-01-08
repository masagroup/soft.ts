// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, when } from "ts-mockito";
import {
    EClass,
    EcoreUtils,
    EObject,
    EObjectInternal,
    EReference,
    getEcoreFactory,
    getEcorePackage,
    ImmutableEList,
} from "./internal";

describe("EcoreUtils", () => {
    describe("equals", () => {
        test("null", () => {
            expect(EcoreUtils.equals(null, null)).toBeTruthy();

            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            expect(EcoreUtils.equals(object, null)).toBeFalsy();
            expect(EcoreUtils.equals(null, object)).toBeFalsy();
        });

        test("proxy", () => {
            let mockObject1 = mock<EObjectInternal>();
            let mockObject2 = mock<EObjectInternal>();
            let obj1 = instance(mockObject1);
            let obj2 = instance(mockObject2);

            when(mockObject1.eIsProxy()).thenReturn(true);
            when(mockObject1.eProxyURI()).thenReturn(new URL("file://test"));
            when(mockObject2.eProxyURI()).thenReturn(new URL("file://test"));
            expect(EcoreUtils.equals(obj1, obj2)).toBeTruthy();

            when(mockObject1.eIsProxy()).thenReturn(true);
            when(mockObject1.eProxyURI()).thenReturn(new URL("file://test1"));
            when(mockObject2.eProxyURI()).thenReturn(new URL("file://test2"));
            expect(EcoreUtils.equals(obj1, obj2)).toBeFalsy();

            when(mockObject1.eIsProxy()).thenReturn(true);
            when(mockObject1.eProxyURI()).thenReturn(new URL("file://test"));
            when(mockObject2.eProxyURI()).thenReturn(null);
            expect(EcoreUtils.equals(obj1, obj2)).toBeFalsy();

            when(mockObject1.eIsProxy()).thenReturn(false);
            when(mockObject2.eIsProxy()).thenReturn(true);
            expect(EcoreUtils.equals(obj1, obj2)).toBeFalsy();
        });

        test("class", () => {
            let mockObject1 = mock<EObjectInternal>();
            let mockObject2 = mock<EObjectInternal>();
            let obj1 = instance(mockObject1);
            let obj2 = instance(mockObject2);
            let mockClass1 = mock<EClass>();
            let mockClass2 = mock<EClass>();
            when(mockObject1.eIsProxy()).thenReturn(false);
            when(mockObject1.eClass()).thenReturn(instance(mockClass1));
            when(mockObject2.eIsProxy()).thenReturn(false);
            when(mockObject2.eClass()).thenReturn(instance(mockClass2));
        });
    });

    describe("copy", () => {
        test("null", () => {
            expect(EcoreUtils.copy(null)).toBeNull();
        });

        test("attribute", () => {
            // the meta model
            let ePackage = getEcoreFactory().createEPackage();
            let eFactory = getEcoreFactory().createEFactory();
            let eClass = getEcoreFactory().createEClass();
            ePackage.eFactoryInstance = eFactory;
            ePackage.eClassifiers.add(eClass);
            let eAttribute1 = getEcoreFactory().createEAttribute();
            eAttribute1.name = "attribute1";
            eAttribute1.eType = getEcorePackage().getEInt();
            let eAttribute2 = getEcoreFactory().createEAttribute();
            eAttribute2.name = "attribute2";
            eAttribute2.eType = getEcorePackage().getEString();
            eClass.eStructuralFeatures.addAll(new ImmutableEList([eAttribute1, eAttribute2]));

            // the model
            let eObject = eFactory.create(eClass);
            eObject.eSet(eAttribute1, 2);
            eObject.eSet(eAttribute2, "test");

            let eObjectCopy = EcoreUtils.copy(eObject);
            expect(EcoreUtils.equals(eObject, eObjectCopy)).toBeTruthy();

            eObject.eSet(eAttribute2, "test2");
            expect(EcoreUtils.equals(eObject, eObjectCopy)).toBeFalsy();
        });

        test("allAttribute", () => {
            // the meta model
            let ePackage = getEcoreFactory().createEPackage();
            let eFactory = getEcoreFactory().createEFactory();
            let eClass = getEcoreFactory().createEClass();
            ePackage.eFactoryInstance = eFactory;
            ePackage.eClassifiers.add(eClass);
            let eAttribute1 = getEcoreFactory().createEAttribute();
            eAttribute1.name = "attribute1";
            eAttribute1.eType = getEcorePackage().getEInt();
            let eAttribute2 = getEcoreFactory().createEAttribute();
            eAttribute2.name = "attribute2";
            eAttribute2.eType = getEcorePackage().getEString();
            eClass.eStructuralFeatures.addAll(new ImmutableEList([eAttribute1, eAttribute2]));

            // the model
            let eObject1 = eFactory.create(eClass);
            eObject1.eSet(eAttribute1, 2);
            eObject1.eSet(eAttribute2, "test");

            let eObject2 = eFactory.create(eClass);
            eObject2.eSet(eAttribute1, 2);
            eObject2.eSet(eAttribute2, "test2");

            let list = new ImmutableEList<EObject>([eObject1, eObject2]);
            let listCopy = EcoreUtils.copyAll(list);
            expect(EcoreUtils.equalsAll(list, listCopy)).toBeTruthy();
        });

        test("containment", () => {
            // the meta model
            let ePackage = getEcoreFactory().createEPackage();
            let eFactory = getEcoreFactory().createEFactory();
            let eClass1 = getEcoreFactory().createEClass();
            let eClass2 = getEcoreFactory().createEClass();
            ePackage.eFactoryInstance = eFactory;
            ePackage.eClassifiers.addAll(new ImmutableEList<EClass>([eClass1, eClass2]));

            let eAttribute1 = getEcoreFactory().createEAttribute();
            eAttribute1.name = "attribute1";
            eAttribute1.eType = getEcorePackage().getEInt();
            let eAttribute2 = getEcoreFactory().createEAttribute();
            eAttribute2.name = "attribute2";
            eAttribute2.eType = getEcorePackage().getEString();
            eClass2.eStructuralFeatures.addAll(new ImmutableEList([eAttribute1, eAttribute2]));

            let eReference1 = getEcoreFactory().createEReference();
            eReference1.name = "reference1";
            eReference1.isContainment = true;
            eReference1.eType = eClass2;
            eClass1.eStructuralFeatures.add(eReference1);

            // the model
            let eObject1 = eFactory.create(eClass1);
            let eObject2 = eFactory.create(eClass2);
            eObject2.eSet(eAttribute1, 2);
            eObject2.eSet(eAttribute2, "test1");
            eObject1.eSet(eReference1, eObject2);

            let eObject1Copy = EcoreUtils.copy(eObject1);
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeTruthy();

            eObject2.eSet(eAttribute2, "test2");
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeFalsy();
        });

        test("references", () => {
            // the meta model
            let ePackage = getEcoreFactory().createEPackage();
            let eFactory = getEcoreFactory().createEFactory();
            let eClass1 = getEcoreFactory().createEClass();
            let eClass2 = getEcoreFactory().createEClass();
            ePackage.eFactoryInstance = eFactory;
            ePackage.eClassifiers.addAll(new ImmutableEList<EClass>([eClass1, eClass2]));

            let eAttribute1 = getEcoreFactory().createEAttribute();
            eAttribute1.name = "attribute1";
            eAttribute1.eType = getEcorePackage().getEInt();
            let eAttribute2 = getEcoreFactory().createEAttribute();
            eAttribute2.name = "attribute2";
            eAttribute2.eType = getEcorePackage().getEString();
            eClass2.eStructuralFeatures.addAll(new ImmutableEList([eAttribute1, eAttribute2]));

            let eReference1 = getEcoreFactory().createEReference();
            eReference1.name = "reference1";
            eReference1.isContainment = true;
            eReference1.eType = eClass2;
            let eReference2 = getEcoreFactory().createEReference();
            eReference2.name = "reference2";
            eReference2.isContainment = false;
            eReference2.eType = eClass2;
            eClass1.eStructuralFeatures.addAll(
                new ImmutableEList<EReference>([eReference1, eReference2]),
            );

            // the model
            let eObject1 = eFactory.create(eClass1);
            let eObject2 = eFactory.create(eClass2);
            eObject2.eSet(eAttribute1, 2);
            eObject2.eSet(eAttribute2, "test");
            eObject1.eSet(eReference1, eObject2);
            eObject1.eSet(eReference2, eObject2);

            let eObject1Copy = EcoreUtils.copy(eObject1);
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeTruthy();

            eObject2.eSet(eAttribute2, "test2");
            expect(EcoreUtils.equals(eObject1, eObject1Copy)).toBeFalsy();
        });

        test("proxy", () => {
            let ePackage = getEcoreFactory().createEPackage();
            let eFactory = getEcoreFactory().createEFactory();
            let eClass = getEcoreFactory().createEClass();
            ePackage.eFactoryInstance = eFactory;
            ePackage.eClassifiers.add(eClass);

            // the model
            let eObject = eFactory.create(eClass);
            (eObject as EObjectInternal).eSetProxyURI(new URL("file://test"));

            let eObjectCopy = EcoreUtils.copy(eObject);
            expect(EcoreUtils.equals(eObject, eObjectCopy)).toBeTruthy();
        });

        test("real", () => {
            let eClass = getEcorePackage().getEClass();
            let eClassCopy = EcoreUtils.copy(eClass);
            expect(EcoreUtils.equals(eClass, eClassCopy)).toBeTruthy();
        });
    });
});
