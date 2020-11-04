// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { mock, instance, when, anything } from "ts-mockito";
import {
    EClass,
    EList,
    EAdapter,
    getEcoreFactory,
    getEcorePackage,
    DynamicEObjectImpl,
} from "./internal";

describe("DynamicEObjectImpl", () => {
    test("constructor", () => {
        let o = new DynamicEObjectImpl();
        expect(o).not.toBeNull();
        expect(o.eClass()).toBe(getEcorePackage().getEObject());
    });

    test("mockClass", () => {
        let o = new DynamicEObjectImpl();
        let mockClass = mock<EClass>();
        let mockAdapters = mock<EList<EAdapter>>();
        let eClass = instance(mockClass);
        let eAdapters = instance(mockAdapters);
        when(mockClass.getFeatureCount()).thenReturn(0);
        when(mockClass.eAdapters).thenReturn(eAdapters);
        when(mockAdapters.add(anything())).thenReturn(true);
        o.setEClass(eClass);
        expect(o.eClass()).toBe(eClass);
    });

    test("eClass", () => {
        let o = new DynamicEObjectImpl();
        let c = getEcoreFactory().createEClass();
        o.setEClass(c);
        expect(o.eClass()).toBe(c);
    });

    test("getSet", () => {
        let o = new DynamicEObjectImpl();
        let c = getEcoreFactory().createEClass();
        o.setEClass(c);
        expect(o.eClass()).toBe(c);

        let a = getEcoreFactory().createEAttribute();
        c.eStructuralFeatures.add(a);

        expect(o.eGet(a)).toBeNull();

        o.eSet(a, 1);
        expect(o.eGet(a)).toBe(1);
    });

    test("unset", () => {
        let o = new DynamicEObjectImpl();
        let c = getEcoreFactory().createEClass();
        o.setEClass(c);
        expect(o.eClass()).toBe(c);

        let a = getEcoreFactory().createEAttribute();
        c.eStructuralFeatures.add(a);

        expect(o.eGet(a)).toBe(null);
        o.eSet(a, 1);
        expect(o.eGet(a)).toBe(1);

        o.eUnset(a);
        expect(o.eGet(a)).toBe(null);
    });

    test("container", () => {
        let r1 = getEcoreFactory().createEReference();
        r1.isContainment = true;
        r1.name = "ref";

        let r2 = getEcoreFactory().createEReference();
        r2.eOpposite = r1;
        r2.name = "parent";

        let c1 = getEcoreFactory().createEClass();
        c1.eStructuralFeatures.add(r1);

        let c2  = getEcoreFactory().createEClass();
        c2.eStructuralFeatures.add(r2);

        let o1 = new DynamicEObjectImpl();
        o1.setEClass(c1);

        let o2 = new DynamicEObjectImpl();
        o2.setEClass(c2);

        o2.eSet(r2, o1);
        expect(o2.eGet(r2)).toBe(o1);
        expect(o1.eGet(r1)).toBe(o2);
    });
});
