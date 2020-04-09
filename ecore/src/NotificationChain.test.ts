// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { NotificationChain } from "./NotificationChain";
import { ENotifier } from "./ENotifier";
import { ENotification, EventType } from "./ENotification";
import { mock, instance, when, verify } from "ts-mockito";

test("constructor", (t) => {
    let c = new NotificationChain();
    t.not(c, null);
});

test("add", (t) => {
    // chain
    let c = new NotificationChain();

    // mocks
    const mockNotifier = mock<ENotifier>();
    const mockNotification = mock<ENotification>();
    const notifier = instance(mockNotifier);
    const notification = instance(mockNotification);

    // when
    when(mockNotification.eventType).thenReturn(EventType.ADD);
    when(mockNotification.notifier).thenReturn(notifier);
    when(mockNotification.merge(notification)).thenReturn(false);

    // test
    t.true(c.add(notification));
    t.true(c.add(notification));
});

test("dispatch", (t) => {
    // mocks
    const mockNotifier = mock<ENotifier>();
    const mockNotification = mock<ENotification>();
    const notifier = instance(mockNotifier);
    const notification = instance(mockNotification);

    // when
    when(mockNotification.eventType).thenReturn(EventType.ADD);
    when(mockNotification.notifier).thenReturn(notifier);

    // test
    let c = new NotificationChain();
    t.true(c.add(notification));
    c.dispatch();

    // verifications
    t.notThrows(() => verify(mockNotifier.eNotify(notification)).once());
});
