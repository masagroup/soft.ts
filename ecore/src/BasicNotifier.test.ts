// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { mock, verify, instance } from "ts-mockito";
import { EAdapter, ENotification, BasicNotifier } from "./internal";

describe("BasicNotifier", () => {
    test("constructor", () => {
        let n = new BasicNotifier();
        expect(n.eDeliver).toBeTruthy();
        expect(n.eAdapters.isEmpty()).toBeTruthy();
    });

    test("target", () => {
        // mocks
        const mockAdapter = mock<EAdapter>();
        const adapter = instance(mockAdapter);

        let n = new BasicNotifier();
        n.eAdapters.add(adapter);
        expect(adapter.target).toBe(n);
        n.eAdapters.remove(adapter);
        expect(adapter.target).toBe(null);
    });

    test("eNotify", () => {
        // mocks
        const mockAdapter = mock<EAdapter>();
        const mockNotification = mock<ENotification>();
        const adapter = instance(mockAdapter);
        const notification = instance(mockNotification);

        // call
        let n = new BasicNotifier();
        n.eAdapters.add(adapter);
        n.eNotify(notification);

        // checks
        verify(mockAdapter.notifyChanged(notification)).called();
    });
});
