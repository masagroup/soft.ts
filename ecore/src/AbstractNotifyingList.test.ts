// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { AbstractNotifyingList } from "./AbstractNotifyingList";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { EAdapter } from "./EAdapter";
import { instance, mock, when, verify, anything, strictEqual, objectContaining } from "ts-mockito";
import { ImmutableEList } from "./ImmutableEList";
import { EventType } from "./ENotification";
import { ENotificationChain } from "./ENOtificationChain";

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

test("add", (t) => {
    let l = new NotifyingListTest<number>();
    l.add(3);
    t.notThrows(() =>
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
                })
            )
        ).once()
    );

    l.add(4);
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [3, 4]);
});

test("addAll", (t) => {
    let l = new NotifyingListTest<number>();
    l.addAll(
        new ImmutableEList<number>([2, 3])
    );
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [2, 3]);

    l.addAll(
        new ImmutableEList<number>([4])
    );
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [2, 3, 4]);
});

test("insert", (t) => {
    let l = new NotifyingListTest<number>();
    l.insert(0, 1);
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [1]);

    l.insert(0, 2);
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [2, 1]);

    l.insert(1, 3);
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [2, 3, 1]);
});

test("insertAll", (t) => {
    let l = new NotifyingListTest<number>();
    l.insertAll(0, new ImmutableEList([1, 2, 3]));
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [1, 2, 3]);

    l.insertAll(1, new ImmutableEList([4, 5]));
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [1, 4, 5, 2, 3]);
});

test("set", (t) => {
    let l = new NotifyingListTest<number>([1, 2]);
    l.set(1, 3);
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [1, 3]);
});

test("removeAt", (t) => {
    let l = new NotifyingListTest<number>([1, 2]);
    l.removeAt(1);
    t.notThrows(() =>
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
                })
            )
        ).once()
    );
    t.deepEqual(l.toArray(), [1]);
});

test("addWithNotification", (t) => {
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
            })
        )
    ).thenReturn(true);

    l.addWithNotification(1, l.chain);
    t.deepEqual(l.toArray(), [1]);
});


test('removeWithNotification', t => {
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
            })
        )
    ).thenReturn(true);
    l.removeWithNotification(1,l.chain);
    t.deepEqual(l.toArray(), []);
});

test('setWithNotification', t => {
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
            })
        )
    ).thenReturn(true);
    l.setWithNotification(0,2,l.chain);
    t.deepEqual(l.toArray(), [2]);
});