// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, verify, when } from "ts-mockito"
import { ENotification, ENotifier, EventType, NotificationChain } from "./internal"

describe("NotificationChain", () => {
    test("constructor", () => {
        let c = new NotificationChain()
        expect(c).not.toBeNull()
    })

    test("add", () => {
        // chain
        let c = new NotificationChain()

        // mocks
        const mockNotifier = mock<ENotifier>()
        const mockNotification = mock<ENotification>()
        const notifier = instance(mockNotifier)
        const notification = instance(mockNotification)

        // when
        when(mockNotification.eventType).thenReturn(EventType.ADD)
        when(mockNotification.notifier).thenReturn(notifier)
        when(mockNotification.merge(notification)).thenReturn(false)

        // test
        expect(c.add(notification)).toBeTruthy()
        expect(c.add(notification)).toBeTruthy()
    })

    test("dispatch", () => {
        // mocks
        const mockNotifier = mock<ENotifier>()
        const mockNotification = mock<ENotification>()
        const notifier = instance(mockNotifier)
        const notification = instance(mockNotification)

        // when
        when(mockNotification.eventType).thenReturn(EventType.ADD)
        when(mockNotification.notifier).thenReturn(notifier)

        // test
        let c = new NotificationChain()
        expect(c.add(notification)).toBeTruthy()
        c.dispatch()

        // verifications
        verify(mockNotifier.eNotify(notification)).once()
    })
})
