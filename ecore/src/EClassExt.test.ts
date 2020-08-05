// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { mock, verify, instance } from "ts-mockito";
import { EClassExt } from "./EClassExt";
import { ImmutableEList } from "./ImmutableEList";
import { EAttributeExt } from "./EAttributeExt";

function containsSubClass(eSuper: EClassExt, eClass: EClassExt): boolean {
    return eSuper._subClasses.indexOf(eClass) != -1;
}

test("instance", (t) => {
    let eClass = new EClassExt();
    eClass.name = "eClass";
    t.is(eClass.name, "eClass");
});

test("superTypes", (t) => {
    let eClass = new EClassExt();
    let eSuperClass = new EClassExt();
    let eSuperClass2 = new EClassExt();
    let eSuperClass3 = new EClassExt();
    let eSuperClassClass = new EClassExt();

    eClass.eSuperTypes.add(eSuperClass);
    eSuperClass.eSuperTypes.add(eSuperClassClass);

    // test super types getters
    t.deepEqual(eClass.eSuperTypes.toArray(), [eSuperClass]);
    t.deepEqual(eClass.eAllSuperTypes.toArray(), [eSuperClassClass, eSuperClass]);
    t.true(containsSubClass(eSuperClass, eClass));

    // remove super class
    eClass.eSuperTypes.remove(eSuperClass);
    t.false(containsSubClass(eSuperClass, eClass));

    // add many super classes
    eClass.eSuperTypes.addAll( new ImmutableEList([eSuperClass,eSuperClass2]));
    t.true(containsSubClass(eSuperClass, eClass));
    t.true(containsSubClass(eSuperClass2, eClass));

    // set super classes
    eClass.eSuperTypes.set(1,eSuperClass3);
    t.true(containsSubClass(eSuperClass, eClass));
    t.true(containsSubClass(eSuperClass3, eClass));

});

test('featuresAdd', t => {
    let eClass = new EClassExt();
    let eAttribute = new EAttributeExt();
    t.is( eAttribute.featureID , -1 );

    eClass.eStructuralFeatures.add(eAttribute);

    t.is(eClass.getFeatureCount(),1);
    t.is(eAttribute.featureID, 0 );
    t.is(eAttribute.eContainingClass, eClass );
    
});
