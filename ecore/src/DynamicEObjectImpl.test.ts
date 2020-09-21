// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { DynamicEObjectImpl } from "./DynamicEObjectImpl";
import { getEcorePackage } from "./EcorePackage";
import { mock, instance, when, anything } from "ts-mockito";
import { EClass } from "./EClass";
import { EList } from "./EList";
import { EAdapter } from "./EAdapter";
import { getEcoreFactory } from "./EcoreFactory";

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
});
