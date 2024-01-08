// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, objectContaining, reset, verify, when } from "ts-mockito";
import {
    AbstractNotifyingList,
    EAdapter,
    ENotificationChain,
    ENotifier,
    EStructuralFeature,
    EventType,
    ImmutableEList,
} from "./internal";

class NotifyingListTest<E> extends AbstractNotifyingList<E> {
    private _mockNotifier: ENotifier;
    private _mockFeature: EStructuralFeature;
    private _mockAdapter: EAdapter;
    private _mockChain: ENotificationChain;
    private _notifier: ENotifier;
    private _feature: EStructuralFeature;
    private _adapter: EAdapter;
    private _chain: ENotificationChain;

    constructor(v: E[] = []) {
        super(v);
        this._mockNotifier = mock<ENotifier>();
        this._mockFeature = mock<EStructuralFeature>();
        this._mockAdapter = mock<EAdapter>();
        this._mockChain = mock<ENotificationChain>();

        this._notifier = instance(this._mockNotifier);
        this._feature = instance(this._mockFeature);
        this._adapter = instance(this._mockAdapter);
        this._chain = instance(this._mockChain);

        when(this._mockNotifier.eDeliver).thenReturn(true);
        when(this._mockNotifier.eAdapters).thenReturn(new ImmutableEList([this._adapter]));
        when(this._mockFeature.featureID).thenReturn(0);
    }

    get mockNotifier(): ENotifier {
        return this._mockNotifier;
    }

    get mockChain(): ENotificationChain {
        return this._mockChain;
    }

    get notifier(): ENotifier {
        return this._notifier;
    }

    get mockFeature(): EStructuralFeature {
        return this._mockFeature;
    }

    get feature(): EStructuralFeature {
        return this._feature;
    }

    get featureID(): number {
        return this._feature.featureID;
    }

    get chain(): ENotificationChain {
        return this._chain;
    }
}

describe("AbstractNotifyingList", () => {
    test("add", () => {
        let l = new NotifyingListTest<number>();
        l.add(3);

        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: 3,
                    position: 0,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([3]);

        l.add(4);
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: 4,
                    position: 1,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([3, 4]);
    });

    test("addAll", () => {
        let l = new NotifyingListTest<number>();
        l.addAll(new ImmutableEList<number>([2, 3]));
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD_MANY,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: [2, 3],
                    position: 0,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([2, 3]);

        l.addAll(new ImmutableEList<number>([4]));
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: 4,
                    position: 2,
                }),
            ),
        ).once();
    });

    test("insert", () => {
        let l = new NotifyingListTest<number>();
        l.insert(0, 1);
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: 1,
                    position: 0,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([1]);

        l.insert(0, 2);
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: 2,
                    position: 0,
                }),
            ),
        ).once();

        expect(l.toArray()).toEqual([2, 1]);

        l.insert(1, 3);
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: 3,
                    position: 1,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([2, 3, 1]);
    });

    test("insertAll", () => {
        let l = new NotifyingListTest<number>();
        expect(l.insertAll(0, new ImmutableEList([1, 2, 3]))).toBeTruthy();
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD_MANY,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: [1, 2, 3],
                    position: 0,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([1, 2, 3]);

        l.insertAll(1, new ImmutableEList([4, 5]));
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.ADD_MANY,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: [4, 5],
                    position: 1,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([1, 4, 5, 2, 3]);

        expect(l.insertAll(0, new ImmutableEList())).toBeFalsy();
    });

    test("set", () => {
        let l = new NotifyingListTest<number>([1, 2]);
        l.set(1, 3);
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.SET,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: 2,
                    newValue: 3,
                    position: 1,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([1, 3]);
    });

    test("removeAt", () => {
        let l = new NotifyingListTest<number>([1, 2]);
        l.removeAt(1);
        verify(
            l.mockNotifier.eNotify(
                objectContaining({
                    eventType: EventType.REMOVE,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: 2,
                    newValue: null,
                    position: 1,
                }),
            ),
        ).once();
        expect(l.toArray()).toEqual([1]);
    });

    test("addWithNotification", () => {
        let l = new NotifyingListTest<number>();
        when(
            l.mockChain.add(
                objectContaining({
                    eventType: EventType.ADD,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: null,
                    newValue: 1,
                    position: 0,
                }),
            ),
        ).thenReturn(true);

        l.addWithNotification(1, l.chain);
        expect(l.toArray()).toEqual([1]);
    });

    test("removeWithNotification", () => {
        let l = new NotifyingListTest<number>([1]);
        when(
            l.mockChain.add(
                objectContaining({
                    eventType: EventType.REMOVE,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: 1,
                    newValue: null,
                    position: 0,
                }),
            ),
        ).thenReturn(true);
        l.removeWithNotification(1, l.chain);
        expect(l.toArray()).toEqual([]);

        reset(l.mockChain);
        l.removeWithNotification(2, l.chain);
    });

    test("setWithNotification", () => {
        let l = new NotifyingListTest<number>([1]);
        when(
            l.mockChain.add(
                objectContaining({
                    eventType: EventType.SET,
                    notifier: l.notifier,
                    feature: l.feature,
                    featureID: l.featureID,
                    oldValue: 1,
                    newValue: 2,
                    position: 0,
                }),
            ),
        ).thenReturn(true);
        l.setWithNotification(0, 2, l.chain);
        expect(l.toArray()).toEqual([2]);
    });
});
