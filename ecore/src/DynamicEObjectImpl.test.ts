// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { DynamicEObjectImpl } from "./DynamicEObjectImpl";
import { getEcorePackage } from "./EcorePackage";
import { EClassExt } from "./EClassExt";
import { mock, instance, when, anything } from "ts-mockito";
import { EClass } from "./EClass";
import { EList } from "./EList";
import { EAdapter } from "./EAdapter";
import { getEcoreFactory } from "./EcoreFactory";

test("constructor", (t) => {
    let o = new DynamicEObjectImpl();
    t.true(o != null);
    t.is(o.eClass(), getEcorePackage().getEObject());
});

test("mockClass", (t) => {
    let o = new DynamicEObjectImpl();
    let mockClass = mock<EClass>();
    let mockAdapters = mock<EList<EAdapter>>();
    let eClass = instance(mockClass);
    let eAdapters = instance(mockAdapters);
    when(mockClass.getFeatureCount()).thenReturn(0);
    when(mockClass.eAdapters).thenReturn(eAdapters);
    when(mockAdapters.add(anything())).thenReturn(true);
    o.setEClass(eClass);
    t.is(o.eClass(), eClass);
});

test("eClass", (t) => {
    let o = new DynamicEObjectImpl();
    let c = getEcoreFactory().createEClass();
    o.setEClass(c);
    t.is(o.eClass(), c);
});

test("getSet", (t) => {
    let o = new DynamicEObjectImpl();
    let c = getEcoreFactory().createEClass();
    o.setEClass(c);
    t.is(o.eClass(), c);

    let a = getEcoreFactory().createEAttribute();
    c.eStructuralFeatures.add(a);

    t.is(o.eGet(a), null);

    o.eSet(a, 1);
    t.is(o.eGet(a), 1);
});

test("unset", (t) => {
    let o = new DynamicEObjectImpl();
    let c = getEcoreFactory().createEClass();
    o.setEClass(c);
    t.is(o.eClass(), c);

    let a = getEcoreFactory().createEAttribute();
    c.eStructuralFeatures.add(a);

    t.is(o.eGet(a), null);
    o.eSet(a, 1);
    t.is(o.eGet(a), 1);

    o.eUnset(a);
    t.is(o.eGet(a), null);
});
