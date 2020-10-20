// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { mock } from "ts-mockito";
import { EcoreUtils, EObject, getEcoreFactory, getEcorePackage, ImmutableEList } from "./internal";

describe("EcoreUtils", () => {

	describe("equals", () => {
		test("null", () => {
			expect(EcoreUtils.equals(null,null)).toBeTruthy();
			
			let mockObject = mock<EObject>();
			expect(EcoreUtils.equals(mockObject,null)).toBeFalsy();
			expect(EcoreUtils.equals(null,mockObject)).toBeFalsy();
		});

		test("", () => {
			
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
