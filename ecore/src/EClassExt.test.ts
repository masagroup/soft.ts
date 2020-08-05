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

    t.deepEqual(eClass.eSuperTypes.toArray(), [eSuperClass]);
    t.deepEqual(eClass.eAllSuperTypes.toArray(), [eSuperClassClass, eSuperClass]);
    t.true(containsSubClass(eSuperClass, eClass));
});
