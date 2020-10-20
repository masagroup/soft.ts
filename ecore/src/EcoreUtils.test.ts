// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { instance, mock, when } from "ts-mockito";
import { EClass, EcoreUtils, EObject, EObjectInternal, getEcoreFactory, getEcorePackage, ImmutableEList } from "./internal";

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

        test("copyAttribute", () => {
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
            eAttribute2.eType = getEcorePackage().getEInt();
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

        test("copyAllAttribute", () => {});
    });
});
