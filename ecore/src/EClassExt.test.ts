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
import { EReferenceExt } from "./EReferenceExt";

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
    eClass.eSuperTypes.addAll(new ImmutableEList([eSuperClass, eSuperClass2]));
    t.true(containsSubClass(eSuperClass, eClass));
    t.true(containsSubClass(eSuperClass2, eClass));

    // set super classes
    eClass.eSuperTypes.set(1, eSuperClass3);
    t.true(containsSubClass(eSuperClass, eClass));
    t.true(containsSubClass(eSuperClass3, eClass));
});

test("featuresAdd", (t) => {
    let eClass = new EClassExt();
    let eAttribute = new EAttributeExt();
    t.is(eAttribute.featureID, -1);

    eClass.eStructuralFeatures.add(eAttribute);

    t.is(eClass.getFeatureCount(), 1);
    t.is(eAttribute.featureID, 0);
    t.is(eAttribute.eContainingClass, eClass);
});

test("featuresGetter", (t) => {
    let eClass = new EClassExt();
    let eAttribute1 = new EAttributeExt();
    let eAttribute2 = new EAttributeExt();
    let eReference1 = new EReferenceExt();
    let eReference2 = new EReferenceExt();

    eClass.eStructuralFeatures.addAll(
        new ImmutableEList([eAttribute1, eReference1, eAttribute2, eReference2])
    );

    // feature ids
    t.is(eClass.getFeatureCount(), 4);
    t.is(eClass.getEStructuralFeature(0), eAttribute1);
    t.is(eClass.getEStructuralFeature(1), eReference1);
    t.is(eClass.getEStructuralFeature(2), eAttribute2);
    t.is(eClass.getEStructuralFeature(3), eReference2);
    t.is(eClass.getEStructuralFeature(4), null);
    t.is(eAttribute1.featureID, 0);
    t.is(eReference1.featureID, 1);
    t.is(eAttribute2.featureID, 2);
    t.is(eReference2.featureID, 3);
    t.is(eClass.getFeatureID(eAttribute1), 0);
    t.is(eClass.getFeatureID(eReference1), 1);
    t.is(eClass.getFeatureID(eAttribute2), 2);
    t.is(eClass.getFeatureID(eReference2), 3);

    // collections
    t.deepEqual(eClass.eAllStructuralFeatures.toArray(), [
        eAttribute1,
        eReference1,
        eAttribute2,
        eReference2,
    ]);
    t.deepEqual(eClass.eAllAttributes.toArray(), [eAttribute1, eAttribute2]);
    t.deepEqual(eClass.eAllReferences.toArray(), [eReference1, eReference2]);
    t.deepEqual(eClass.eAttributes.toArray(), [eAttribute1, eAttribute2]);
    t.deepEqual(eClass.eReferences.toArray(), [eReference1, eReference2]);

    // insert another attribute front
    let eAttribute3 = new EAttributeExt();
    eClass.eStructuralFeatures.insert(0, eAttribute3);
    t.deepEqual(eClass.eAllAttributes.toArray(), [eAttribute3, eAttribute1, eAttribute2]);
    t.deepEqual(eClass.eAttributes.toArray(), [eAttribute3, eAttribute1, eAttribute2]);
    t.is(eClass.getFeatureCount(), 5);
    t.is(eClass.getEStructuralFeature(0), eAttribute3);
    t.is(eClass.getEStructuralFeature(1), eAttribute1);
    t.is(eClass.getEStructuralFeature(2), eReference1);
    t.is(eClass.getEStructuralFeature(3), eAttribute2);
    t.is(eClass.getEStructuralFeature(4), eReference2);
    t.is(eAttribute3.featureID, 0);
    t.is(eAttribute1.featureID, 1);
    t.is(eReference1.featureID, 2);
    t.is(eAttribute2.featureID, 3);
    t.is(eReference2.featureID, 4);
});

test("featuresGettersWithSuperType", (t) => {
    let eClass = new EClassExt();
    let eSuperClass = new EClassExt();
    eClass.eSuperTypes.add(eSuperClass);

    let eAttribute1 = new EAttributeExt();
    let eAttribute2 = new EAttributeExt();
    let eReference1 = new EReferenceExt();
    let eReference2 = new EReferenceExt();

    eClass.eStructuralFeatures.addAll(new ImmutableEList([eAttribute1, eReference1]));
    eSuperClass.eStructuralFeatures.addAll(new ImmutableEList([eAttribute2, eReference2]));

    // collections
    t.deepEqual(eSuperClass.eAllStructuralFeatures.toArray(), [eAttribute2, eReference2]);
    t.deepEqual(eSuperClass.eAllAttributes.toArray(), [eAttribute2]);
    t.deepEqual(eSuperClass.eAttributes.toArray(), [eAttribute2]);
    t.deepEqual(eSuperClass.eAllReferences.toArray(), [eReference2]);
    t.deepEqual(eSuperClass.eReferences.toArray(), [eReference2]);

    t.deepEqual(eClass.eAllStructuralFeatures.toArray(), [eAttribute2, eReference2,eAttribute1,eReference1]);
    t.deepEqual(eClass.eAllAttributes.toArray(), [eAttribute2,eAttribute1]);
    t.deepEqual(eClass.eAttributes.toArray(), [eAttribute1]);
    t.deepEqual(eClass.eAllReferences.toArray(), [eReference2,eReference1]);
    t.deepEqual(eClass.eReferences.toArray(), [eReference1]);

    eClass.eSuperTypes.remove(eSuperClass);

    t.deepEqual(eClass.eAllStructuralFeatures.toArray(), [eAttribute1,eReference1]);
    t.deepEqual(eClass.eAllAttributes.toArray(), [eAttribute1]);
    t.deepEqual(eClass.eAttributes.toArray(), [eAttribute1]);
    t.deepEqual(eClass.eAllReferences.toArray(), [eReference1]);
    t.deepEqual(eClass.eReferences.toArray(), [eReference1]);

});
