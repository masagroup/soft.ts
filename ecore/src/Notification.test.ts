// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test, { beforeEach } from "ava";
import { Notification } from "./Notification";
import { mock, instance, verify, when } from "ts-mockito";
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


test('mergeSet', t => {
    const mockObject = mock<EObject>();
    const o = instance(mockObject);
    
    var n1 = new Notification(o,EventType.SET,1,1,2);
    var n2 = new Notification(o,EventType.SET,1,2,3);
    t.true( n1.merge(n2) );
    t.is( n1.eventType , EventType.SET);
    t.is( n1.oldValue , 1);
    t.is( n1.newValue , 3);
});

test('mergeUnSet', t => {
    const mockObject = mock<EObject>();
    const o = instance(mockObject);

    {
        var n1 = new Notification(o,EventType.SET,1,1,2);
        var n2 = new Notification(o,EventType.UNSET,1,2,0);
        t.true( n1.merge(n2) );
        t.is( n1.eventType , EventType.SET);
        t.is( n1.oldValue , 1);
        t.is( n1.newValue , 0);    
    }
    {
        var n1 = new Notification(o,EventType.UNSET,1,1,0);
        var n2 = new Notification(o,EventType.SET,1,0,2);
        t.true( n1.merge(n2) );
        t.is( n1.eventType , EventType.SET);
        t.is( n1.oldValue , 1);
        t.is( n1.newValue , 2);  
    }
});

test('mergeRemoveMany', t => {
    const mockObject = mock<EObject>();
    const mockObject1 = mock<EObject>();
    const mockObject2 = mock<EObject>();
    const mockObject3 = mock<EObject>();
    const o = instance(mockObject);
    const o1 = instance(mockObject1);
    const o2 = instance(mockObject1);
    const o3 = instance(mockObject1);
    {
        var n1 = new Notification(o,EventType.REMOVE,1,o1,null,2);
        var n2 = new Notification(o,EventType.REMOVE,1,o2,null,2);
        t.true( n1.merge(n2) );
        t.is( n1.eventType , EventType.REMOVE_MANY);
        t.deepEqual(n1.oldValue, [o1,o2]);
        t.deepEqual(n1.newValue, [2,3]);
    }
    {
        var n1 = new Notification(o,EventType.REMOVE_MANY,1,[o1,o2],[2,3] );
        var n2 = new Notification(o,EventType.REMOVE,1,o3,null,2);
        t.true( n1.merge(n2) );
        t.is( n1.eventType , EventType.REMOVE_MANY);
        t.deepEqual(n1.oldValue, [o1,o2,o3]);
        t.deepEqual(n1.newValue, [2,3,4]);
    }
});


test('add', t => {
    const mockObject = mock<EObject>();
    const o = instance(mockObject);
    {
        var n = new Notification(o,EventType.SET,1,1,2);
        t.false(n.add(null));
        
    }
    {
        // create 2 identical set notifications
        var n1 = new Notification(o,EventType.SET,1,1,2);
        var n2 = new Notification(o,EventType.SET,1,1,2);
        
        // no add because there is a merge
        t.false(n1.add(n2));
    }
    {
        // create 2 add notifications with 2 different objects
        const mockObject1 = mock<EObject>();
        const mockObject2 = mock<EObject>();
        const o1 = instance(mockObject1);
        const o2 = instance(mockObject2);    
        var n1 = new Notification(o,EventType.ADD,1,o1,null);
        var n2 = new Notification(o,EventType.ADD,1,o2,null);

        // check add
        t.true( n1.add(n2) );

        // check that there is no merge by calling dispacth
        // we should have 2 notification
        n1.dispatch();
        t.notThrows(() => { 
            verify(mockObject.eNotify(n1)).once();
            verify(mockObject.eNotify(n2)).once();
         });
    }
});
