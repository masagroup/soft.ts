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
import { ENotification, EventType } from "./ENotification";
import { Notification } from "./Notification";

class NotifyingListTest<E> extends AbstractNotifyingList<E> {
    private _mockNotifier: ENotifier;
    private _mockFeature: EStructuralFeature;
    private _mockAdapter: EAdapter;
    private _notifier: ENotifier;
    private _feature: EStructuralFeature;
    private _adapter: EAdapter;

    constructor() {
        super();
        this._mockNotifier = mock<ENotifier>();
        this._mockFeature = mock<EStructuralFeature>();
        this._mockAdapter = mock<EAdapter>();

        this._notifier = instance(this._mockNotifier);
        this._feature = instance(this._mockFeature);
        this._adapter = instance(this._mockAdapter);

        when(this._mockNotifier.eDeliver).thenReturn(true);
        when(this._mockNotifier.eAdapters).thenReturn(new ImmutableEList([this._adapter]));
        when(this._mockFeature.featureID).thenReturn(0)
    }

    get mockNotifier() : ENotifier {
        return this._mockNotifier;
    }

    get notifier(): ENotifier {
        return this._notifier;
    }

    get mockFeature() : EStructuralFeature {
        return this._mockFeature;
    }

    get feature(): EStructuralFeature {
        return this._feature;
    }

    get featureID(): number {
        return this._feature.featureID;
    }
}

test("add", t => {
    let l = new NotifyingListTest<number>();
    l.add(3);
    t.notThrows( () => verify( l.mockNotifier.eNotify(objectContaining({
        eventType: EventType.ADD,
        notifier: l.notifier,
        feature: l.feature,
        featureID: l.featureID,
        oldValue:null,
        newValue:3,
        position:0
       })) ).once() );

    l.add(4);
    t.notThrows( () => verify( l.mockNotifier.eNotify(objectContaining({
        eventType: EventType.ADD,
        notifier: l.notifier,
        feature: l.feature,
        featureID: l.featureID,
        oldValue:null,
        newValue:4,
        position:1
       })) ).once() );
    t.deepEqual(l.toArray(), [3,4]);
});