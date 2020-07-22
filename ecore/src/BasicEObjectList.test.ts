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
import { EObjectList } from "./EObjectList";
import { EObject } from "./EObject";

test("constructor", (t) => {
    {
        let l = new BasicEObjectList(null, 1, 2, false, false, false, false, false);
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

        let l = new BasicEObjectList(owner, 1, 2, false, false, false, false, false);
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

    let l = new BasicEObjectList(owner, 1, -1, false, true, false, false, false);

    when(mockOwner.eDeliver).thenReturn(false);
    when(mockOwner.eInverseAdd(owner, -2, null)).thenReturn(null);
    t.true(l.add(object));

    when(mockOwner.eInverseRemove(owner, -2, null)).thenReturn(null);
    t.true(l.remove(object));
});

test("inverseOpposite", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);

    const mockObject = mock<EObjectInternal>();
    const object = instance(mockObject);

    let l = new BasicEObjectList(owner, 1, 2, false, true, true, false, false);

    when(mockOwner.eDeliver).thenReturn(false);
    when(mockOwner.eInverseAdd(owner, 2, null)).thenReturn(null);
    t.true(l.add(object));

    when(mockOwner.eInverseRemove(owner, 2, null)).thenReturn(null);
    t.true(l.remove(object));
});

test("contains", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);
    when(mockOwner.eDeliver).thenReturn(false);

    {
        let l = new BasicEObjectList(owner, 1, 2, false, true, true, false, false);
        const mockObject = mock<EObjectInternal>();
        const object = instance(mockObject);
        l.add(object);
        t.true(l.contains(object));
        t.true(l.contains(object));
    }
    {
        let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false);
        const mockObject = mock<EObjectInternal>();
        const object = instance(mockObject);
        l.add(object);
        t.true(l.contains(object));

        const mockResolved = mock<EObjectInternal>();
        const resolved = instance(mockResolved);
        when(mockOwner.eResolveProxy(object)).thenReturn(resolved);
        when(mockObject.eIsProxy()).thenReturn(true);
        t.true(l.contains(resolved));

        verify(mockOwner.eResolveProxy(object)).once();
        verify(mockObject.eIsProxy()).once();
    }
});

test("get", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);
    when(mockOwner.eDeliver).thenReturn(false);

    // no proxy
    {
        let l = new BasicEObjectList(owner, 1, 2, false, false, false, false, false);
        const mockObject = mock<EObjectInternal>();
        const object = instance(mockObject);
        l.add(object);
        t.is(l.get(0), object);
    }
    // with proxy
    {
        let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false);
        const mockObject = mock<EObjectInternal>();
        const object = instance(mockObject);
        l.add(object);

        const mockResolved = mock<EObjectInternal>();
        const resolved = instance(mockResolved);
        when(mockOwner.eResolveProxy(object)).thenReturn(resolved);
        when(mockObject.eIsProxy()).thenReturn(true);
        t.is(l.get(0), resolved);

        verify(mockOwner.eResolveProxy(object)).once();
        verify(mockObject.eIsProxy()).once();
    }
});

test("unresolved", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);
    when(mockOwner.eDeliver).thenReturn(false);

    // no proxy
    {
        let l = new BasicEObjectList(owner, 1, 2, false, false, false, false, false);
        t.is(l.getUnResolvedList(), l);
    }
    // with proxy
    {
        let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false);
        let u = l.getUnResolvedList();
        t.not(u, l);
        let e = <EObjectList<EObject>>u;
        t.not(e, null);
    }
});

test("unresolvedGet", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);
    when(mockOwner.eDeliver).thenReturn(false);

    let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false);
    let u = l.getUnResolvedList();
    const mockObject = mock<EObjectInternal>();
    const object = instance(mockObject);
    u.add(object);

    // check that in unresolved it is the same
    t.is(u.get(0), object);

    // check that in original list , there is a resolution
    const mockResolved = mock<EObjectInternal>();
    const resolved = instance(mockResolved);
    when(mockOwner.eResolveProxy(object)).thenReturn(resolved);
    when(mockObject.eIsProxy()).thenReturn(true);
    t.is(l.get(0), resolved);

    // check that now it is the resolved one in the unresolved list
    t.is(u.get(0), resolved);

    verify(mockOwner.eResolveProxy(object)).once();
    verify(mockObject.eIsProxy()).once();
});

test("unresolvedContains", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);
    when(mockOwner.eDeliver).thenReturn(false);

    let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false);
    let u = l.getUnResolvedList();
    const mockObject = mock<EObjectInternal>();
    const object = instance(mockObject);
    u.add(object);

    t.true(u.contains(object));

    // check that in original list there is a resolution
    const mockResolved = mock<EObjectInternal>();
    const resolved = instance(mockResolved);
    when(mockOwner.eResolveProxy(object)).thenReturn(resolved);
    when(mockObject.eIsProxy()).thenReturn(true);
    t.false(u.contains(resolved));
    t.true(l.contains(resolved));
    t.true(u.contains(resolved));

    verify(mockOwner.eResolveProxy(object)).once();
    verify(mockObject.eIsProxy()).once();
});

test("unresolvedSet", (t) => {
    // mocks
    const mockOwner = mock<EObjectInternal>();
    const owner = instance(mockOwner);
    when(mockOwner.eDeliver).thenReturn(false);

    // add an object to unresolved
    let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false);
    let u = l.getUnResolvedList();
    const mockObject = mock<EObjectInternal>();
    const object = instance(mockObject);
    u.add(object);

    // set first index as another object & check that it has been replaced
    const mockObject1 = mock<EObjectInternal>();
    const object1 = instance(mockObject1);
    u.set(0, object1);
    t.is(u.get(0), object1);

    // check that invalid range is supported
    t.throws(() => u.set(1, object), { instanceOf: RangeError });
});
