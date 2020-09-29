// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifier, ENotification, EventType, NotificationChain } from "./internal";
import { mock, instance, when, verify } from "ts-mockito";

describe("NotificationChain", () => {
    test("constructor", () => {
        let c = new NotificationChain();
        expect(c).not.toBeNull();
    });

    test("add", () => {
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
        expect(c.add(notification)).toBeTruthy();
        expect(c.add(notification)).toBeTruthy();
    });

    test("dispatch", () => {
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
        expect(c.add(notification)).toBeTruthy();
        c.dispatch();

        // verifications
        verify(mockNotifier.eNotify(notification)).once();
    });
});
