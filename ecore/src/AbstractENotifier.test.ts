// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************
import { instance, mock, verify, when } from "ts-mockito";
import { AbstractENotifier, EAdapter, EList, ENotification, ImmutableEList } from "./internal";

class ENotifierTest extends AbstractENotifier {}

class ENotifierTestImpl extends ENotifierTest {
    deliver: boolean;
    adapters: EList<EAdapter>;

    constructor() {
        super();
        this.deliver = false;
        this.adapters = null;
    }

    get eDeliver(): boolean {
        return this.deliver;
    }

    set eDeliver(eDeliver: boolean) {
        super.eDeliver = eDeliver;
    }

    protected eBasicAdapters(): EList<EAdapter> {
        return this.adapters;
    }
}

describe("ENotifierTest", () => {
    test("constructor", () => {
        expect(new ENotifierTest()).not.toBeNull();
    });
    describe("eDeliver ", () => {
        test("get", () => {
            let n = new ENotifierTest();
            expect(n.eDeliver).toBeFalsy();
        });
        test("set", () => {
            let n = new ENotifierTest();
            expect(() => {
                n.eDeliver = true;
            }).toThrow(Error);
        });
    });
    test("eAdapters", () => {
        let n = new ENotifierTest();
        expect(n.eAdapters).not.toBeNull();
        expect(n.eAdapters.isEmpty()).toBeTruthy();
    });
    describe("eNotificationRequired", () => {
        test("default", () => {
            let n = new ENotifierTest();
            expect(n.eNotificationRequired).toBeFalsy();
        });
        test("deliver", () => {
            let n = new ENotifierTestImpl();
            n.deliver = true;
            expect(n.eNotificationRequired).toBeFalsy();
        });
        test("adapters", () => {
            let n = new ENotifierTestImpl();
            let mockAdapters = mock<EList<EAdapter>>();
            let instanceAdapters = instance(mockAdapters);
            n.deliver = true;
            n.adapters = instanceAdapters;
            when(mockAdapters.isEmpty()).thenReturn(true);
            expect(n.eNotificationRequired).toBeFalsy();

            when(mockAdapters.isEmpty()).thenReturn(false);
            expect(n.eNotificationRequired).toBeTruthy();

            verify(mockAdapters.isEmpty()).twice();
        });
    });
    test("eNotify", () => {
        let n = new ENotifierTestImpl();
        let mockNotification = mock<ENotification>();
        let notification = instance(mockNotification);
        n.eNotify(notification);

        let mockAdapter = mock<EAdapter>();
        let adapter = instance(mockAdapter);
        n.deliver = true;
        n.adapters = new ImmutableEList<EAdapter>([adapter]);
        n.eNotify(notification);
        verify(mockAdapter.notifyChanged(notification)).once();
    });
});
