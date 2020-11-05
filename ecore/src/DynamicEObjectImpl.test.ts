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
    EObject,
    ImmutableEList,
    EResourceImpl,
    EResourceSetImpl,
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

        expect(o2.eIsSet(r2)).toBeFalsy();
        expect(o1.eIsSet(r1)).toBeFalsy();

        o2.eSet(r2, o1);
        expect(o2.eGet(r2)).toBe(o1);
        expect(o2.eGetResolve(r2,false)).toBe(o1);
        expect(o1.eGet(r1)).toBe(o2);
        expect(o1.eGetResolve(r1,false)).toBe(o2);
        expect(o2.eIsSet(r2)).toBeTruthy();
        expect(o1.eIsSet(r1)).toBeTruthy();


        o2.eUnset(r2);
        expect(o2.eGet(r2)).toBeNull();
        expect(o1.eGet(r1)).toBeNull();
        expect(o2.eIsSet(r2)).toBeFalsy();
        expect(o1.eIsSet(r1)).toBeFalsy();
    });

    test('proxy', () => {
        let c1 = getEcoreFactory().createEClass();
        let c2 = getEcoreFactory().createEClass();
        let c3 = getEcoreFactory().createEClass();

        let r1 = getEcoreFactory().createEReference();
        r1.isContainment = true;
        r1.name = "r1";
        r1.lowerBound = 0;
        r1.upperBound = -1;
        r1.eType = c2;
    
        let r3 = getEcoreFactory().createEReference();
        r3.name = "r3;"
        r3.eType = c2;
        r3.isResolveProxies = true;
    
        c1.eStructuralFeatures.add(r1);
        c1.name = "c1";
    
        c2.name = "c2";
    
        c3.eStructuralFeatures.add(r3);
        c3.name ="c3";
    
        // model - a container object with two children and another object
        // with one of these child reference
        let o1 = new DynamicEObjectImpl();
        o1.setEClass(c1);
    
        let o1c1 = new DynamicEObjectImpl();
        o1c1.setEClass(c2);
    
        let o1c2 = new DynamicEObjectImpl();
        o1c2.setEClass(c2);
    
        expect(o1.eGet(r1)).not.toBeNull();
        let o1cs = o1.eGet(r1) as EList<EObject>;
        o1cs.addAll(new ImmutableEList<EObject>([o1c1, o1c2]));
    
        let o3 = new DynamicEObjectImpl();
        o3.setEClass(c3);
    
        // add to resource to enable proxy resolution
        let resource = new EResourceImpl();
        resource.eURI = new URL("file:///" + __dirname + "/r.txt");
        resource.eContents().addAll( new ImmutableEList<EObject>([o1, o3]));
    
        let resourceSet = new EResourceSetImpl();
        resourceSet.getResources().add(resource);
    
        let oproxy = new DynamicEObjectImpl();
        oproxy.eSetProxyURI(new URL("file:///" + __dirname + "/r.txt#//@r1.1"));
    
        expect(o3.eIsSet(r3)).toBeFalsy();

        o3.eSet(r3, oproxy);
        expect(o3.eGetResolve(r3, false)).toBe(oproxy);
        expect(o3.eGetResolve(r3, true)).toBe(o1c2);
        expect(o3.eIsSet(r3)).toBeTruthy();

        o3.eUnset(r3);
        expect(o3.eGet(r3)).toBeNull();
        expect(o3.eIsSet(r3)).toBeFalsy();
    });

});
