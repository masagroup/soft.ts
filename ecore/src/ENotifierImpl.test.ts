// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { mock, verify, instance } from "ts-mockito";
import { EAdapter, ENotification, ENotifierImpl } from "./internal";

describe("ENotifierImpl", () => {
    test("constructor", () => {
        let n = new ENotifierImpl();
        expect(n.eDeliver).toBeTruthy();
        expect(n.eAdapters.isEmpty()).toBeTruthy();
    });

    test("eNotify", () => {
        // mocks
        const mockAdapter = mock<EAdapter>();
        const mockNotification = mock<ENotification>();
        const adapter = instance(mockAdapter);
        const notification = instance(mockNotification);

        // call
        let n = new ENotifierImpl();
        n.eAdapters.add(adapter);
        n.eNotify(notification);

        // checks
        verify(mockAdapter.notifyChanged(notification)).called();
    });
});
