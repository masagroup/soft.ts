// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { mock, verify, instance, when } from "ts-mockito";
import { BasicEObjectList } from "./BasicEObjectList";
import { EObjectInternal } from "./BasicEObject";
import { EStructuralFeature } from "./EStructuralFeature";
import { EClass } from "./EClass";

test("constructor", (t) => {

    {
        let l = new BasicEObjectList(null,1,2,false,false,false,false,false);
        t.is(l.notifier, null);
        t.is(l.featureID, 1);
        t.is(l.feature, null);

    }
    {
        // mocks
        const mockOwner = mock<EObjectInternal>();
        const owner = instance(mockOwner);
        
        const mockFeature = mock<EStructuralFeature>();
        const feature = instance(mockFeature);

        const mockClass = mock<EClass>();
        const cls = instance(mockClass);

        let l = new BasicEObjectList(owner,1,2,false,false,false,false,false);
        t.is(l.notifier, owner);
        t.is(l.featureID, 1);

        when(mockOwner.eClass()).thenReturn(cls);
        when(mockClass.getEStructuralFeature(1)).thenReturn(feature);
        t.is(l.feature, feature);
    }
});

test("inverseNoOpposite", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);

    const mockObject = mock<EObjectInternal>();
    const object = instance(mockObject);

    let l = new BasicEObjectList(owner,1,-1,false,true,false,false,false);

    when(mockOwner.eDeliver).thenReturn(false);
    when(mockOwner.eInverseAdd(owner,-2,null)).thenReturn(null);
    t.true( l.add(object) );

    when(mockOwner.eInverseRemove(owner,-2,null)).thenReturn(null);
    t.true( l.remove(object) );
});

test("inverseOpposite", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);

    const mockObject = mock<EObjectInternal>();
    const object = instance(mockObject);

    let l = new BasicEObjectList(owner,1,2,false,true,true,false,false);
    
    when(mockOwner.eDeliver).thenReturn(false);
    when(mockOwner.eInverseAdd(owner,2,null)).thenReturn(null);
    t.true( l.add(object) );

    when(mockOwner.eInverseRemove(owner,2,null)).thenReturn(null);
    t.true( l.remove(object) );
});