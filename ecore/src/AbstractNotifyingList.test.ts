// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { anything, instance, mock, objectContaining, reset, verify, when, capture, resetCalls } from "ts-mockito"
import { describe, expect, test } from "vitest"
import {
    AbstractNotifyingList,
    EAdapter,
    ENotificationChain,
    ENotifier,
    EStructuralFeature,
    EventType,
    ImmutableEList
} from "./internal.js"

class NotifyingListTest<E> extends AbstractNotifyingList<E> {
    private _mockNotifier: ENotifier
    private _mockFeature: EStructuralFeature
    private _mockAdapter: EAdapter
    private _mockChain: ENotificationChain
    private _notifier: ENotifier
    private _feature: EStructuralFeature
    private _adapter: EAdapter
    private _chain: ENotificationChain

    constructor(v: E[] = []) {
        super(v)
        this._mockNotifier = mock<ENotifier>()
        this._mockFeature = mock<EStructuralFeature>()
        this._mockAdapter = mock<EAdapter>()
        this._mockChain = mock<ENotificationChain>()

        this._notifier = instance(this._mockNotifier)
        this._feature = instance(this._mockFeature)
        this._adapter = instance(this._mockAdapter)
        this._chain = instance(this._mockChain)

        when(this._mockNotifier.eDeliver()).thenReturn(true)
        when(this._mockNotifier.eAdapters()).thenReturn(new ImmutableEList([this._adapter]))
        when(this._mockFeature.getFeatureID()).thenReturn(0)
    }

    getMockNotifier(): ENotifier {
        return this._mockNotifier
    }

    getMockChain(): ENotificationChain {
        return this._mockChain
    }

    getNotifier(): ENotifier {
        return this._notifier
    }

    getMockFeature(): EStructuralFeature {
        return this._mockFeature
    }

    getFeature(): EStructuralFeature {
        return this._feature
    }

    getFeatureID(): number {
        return this._feature.getFeatureID()
    }

    getChain(): ENotificationChain {
        return this._chain
    }
}

describe("AbstractNotifyingList", () => {
    test("add", () => {
        // add
        let l = new NotifyingListTest<number>()
        l.add(3)
        // check notification
        verify(l.getMockNotifier().eNotify(anything())).once()
        let n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toBe(3)
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([3])

        resetCalls(l.getMockNotifier())
        
        // add
        l.add(4)
        verify(l.getMockNotifier().eNotify(anything())).once()
        n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toBe(4)
        expect(n.getPosition()).toBe(1)
        expect(l.toArray()).toEqual([3, 4])
    })

    test("addAll", () => {
        // add many
        let l = new NotifyingListTest<number>()
        l.addAll(new ImmutableEList<number>([2, 3]))
        // check notification
        verify(l.getMockNotifier().eNotify(anything())).once()
        let n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD_MANY)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toEqual([2, 3])
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([2, 3])

        resetCalls(l.getMockNotifier())

        // add
        l.addAll(new ImmutableEList<number>([4]))
        verify(l.getMockNotifier().eNotify(anything())).once()
        n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toBe(4)
        expect(n.getPosition()).toBe(2)
        expect(l.toArray()).toEqual([2, 3, 4])
    })

    test("insert", () => {
        let l = new NotifyingListTest<number>()
        l.insert(0, 1)
        // check notification
        verify(l.getMockNotifier().eNotify(anything())).once()
        let n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toBe(1)
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([1])

        resetCalls(l.getMockNotifier())

        l.insert(0, 2)
        verify(l.getMockNotifier().eNotify(anything())).once()
        n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toBe(2)
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([2, 1])

        resetCalls(l.getMockNotifier())

        l.insert(1, 3)
        verify(l.getMockNotifier().eNotify(anything())).once()
        n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toBe(3)
        expect(n.getPosition()).toBe(1)
        expect(l.toArray()).toEqual([2, 3, 1])
    })

    test("insertAll", () => {
        let l = new NotifyingListTest<number>()
        expect(l.insertAll(0, new ImmutableEList([1, 2, 3]))).toBeTruthy()
        verify(l.getMockNotifier().eNotify(anything())).once()
        let n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD_MANY)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toEqual([1, 2, 3])
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([1, 2, 3])
        expect(l.toArray()).toEqual([1, 2, 3])

        resetCalls(l.getMockNotifier())

        l.insertAll(1, new ImmutableEList([4, 5]))
        verify(l.getMockNotifier().eNotify(anything())).once()
        n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD_MANY)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toEqual([4, 5])
        expect(n.getPosition()).toBe(1)
        expect(l.toArray()).toEqual([1, 4, 5, 2, 3])

        expect(l.insertAll(0, new ImmutableEList())).toBeFalsy()
    })

    test("set", () => {
        let l = new NotifyingListTest<number>([1, 2])
        l.set(1, 3)
        verify(l.getMockNotifier().eNotify(anything())).once()
        let n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.SET)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBe(2)
        expect(n.getNewValue()).toBe(3)
        expect(n.getPosition()).toBe(1)
        expect(l.toArray()).toEqual([1, 3])
    })

    test("removeAt", () => {
        let l = new NotifyingListTest<number>([1, 2])
        l.removeAt(1)
        verify(l.getMockNotifier().eNotify(anything())).once()
        let n = capture(l.getMockNotifier().eNotify).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.REMOVE)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBe(2)
        expect(n.getNewValue()).toBeNull()
        expect(n.getPosition()).toBe(1)
        expect(l.toArray()).toEqual([1])
    })

    test("addWithNotification", () => {
        let l = new NotifyingListTest<number>()
        l.addWithNotification(1, l.getChain())
        verify(l.getMockChain().add(anything())).once()
        let n = capture(l.getMockChain().add).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.ADD)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBeNull()
        expect(n.getNewValue()).toBe(1)
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([1])
    })

    test("removeWithNotification", () => {
        let l = new NotifyingListTest<number>([1])
        l.removeWithNotification(1, l.getChain())
        verify(l.getMockChain().add(anything())).once()
        let n = capture(l.getMockChain().add).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.REMOVE)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBe(1)
        expect(n.getNewValue()).toBeNull()
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([])

        l.removeWithNotification(2, l.getChain())
    })

    test("setWithNotification", () => {
        let l = new NotifyingListTest<number>([1])
        l.setWithNotification(0, 2, l.getChain())
        verify(l.getMockChain().add(anything())).once()
        let n = capture(l.getMockChain().add).last()[0]
        expect(n).not.toBeNull()
        expect(n.getEventType()).toBe(EventType.SET)
        expect(n.getNotifier()).toBe(l.getNotifier())
        expect(n.getFeature()).toBe(l.getFeature())
        expect(n.getFeatureID()).toBe(l.getFeatureID())
        expect(n.getOldValue()).toBe(1)
        expect(n.getNewValue()).toBe(2)
        expect(n.getPosition()).toBe(0)
        expect(l.toArray()).toEqual([2])
    })
})
