// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ENotification } from "./ENotification";
import {
    AbstractEAdapter, ENotifier
} from "./internal"
import { instance, mock, when, verify, anything, strictEqual, objectContaining } from "ts-mockito";

class EAdapterTest extends AbstractEAdapter {
    notifyChanged(notification: ENotification): void {
        throw new Error("Method not implemented.");
    }
}

describe('AbstractEAdapter', () => {
    test('get', () => {
        let a = new EAdapterTest;
        expect(a.target).toBeNull()
    });
    test('set', () => {
        let a = new EAdapterTest;
        let mockNotifier = mock<ENotifier>();
        let notifier = instance(mockNotifier);
        a.target = notifier;
        expect(a.target).not.toBeNull();
        expect(a.target).toBe(notifier);
        
    });
    test('unset', () => {
        let a = new EAdapterTest;
        let mockNotifier = mock<ENotifier>();
        let notifier = instance(mockNotifier);
        a.unsetTarget(notifier)
        expect(a.target).toBeNull();
        a.target = notifier;
        a.unsetTarget(notifier)
        expect(a.target).toBeNull();
    });
});