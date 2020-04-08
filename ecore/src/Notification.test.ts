// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { Notification } from "./Notification";
import { mock, instance, verify } from "ts-mockito";
import { EObject } from "./EObject";
import { EventType } from "./ENotification";
import { EStructuralFeature } from "./EStructuralFeature";

test('constructor', t => {
    const mockObject = mock<EObject>();
    const mockFeature = mock<EStructuralFeature>();
    const o = instance(mockObject);
    const f = instance(mockFeature);
    {
        var n = new Notification(o,EventType.ADD,0,1,2);
        t.is( n.notifier , o );
        t.is( n.eventType, EventType.ADD);
        t.is( n.featureID, 0);
        t.is( n.oldValue, 1);
        t.is( n.newValue, 2);
        t.is( n.position, -1);
    }
    {
        var n = new Notification(o,EventType.ADD,f,1,2,3);
        t.is( n.notifier , o );
        t.is( n.eventType, EventType.ADD);
        t.is( n.feature, f);
        t.is( n.oldValue, 1);
        t.is( n.newValue, 2);
        t.is( n.position, 3);
    }
});

test('dispatch', t => {
    const mockObject = mock<EObject>();
    const mockFeature = mock<EStructuralFeature>();
    const o = instance(mockObject);
    const f = instance(mockFeature);
    var n = new Notification(o,EventType.ADD,f,1,2,3);
    n.dispatch();
    t.notThrows( () => verify(mockObject.eNotify(n)).once());
});

