// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, verify, when } from "ts-mockito"
import { EClass, EObject, EStructuralFeature, EventType, Notification } from "./index.js"

describe("Notification", () => {
    test("constructor", () => {
        const mockObject = mock<EObject>()
        const mockFeature = mock<EStructuralFeature>()
        const o = instance(mockObject)
        const f = instance(mockFeature)
        {
            let n = new Notification(o, EventType.ADD, 0, 1, 2)
            expect(n.notifier).toBe(o)
            expect(n.eventType).toBe(EventType.ADD)
            expect(n.featureID).toBe(0)
            expect(n.oldValue).toBe(1)
            expect(n.newValue).toBe(2)
            expect(n.position).toBe(-1)

            let mockClass = mock<EClass>()
            let c = instance(mockClass)
            when(mockObject.eClass()).thenReturn(c)
            when(mockClass.getEStructuralFeature(0)).thenReturn(f)
            expect(n.feature).toBe(f)
        }
        {
            let n = new Notification(o, EventType.ADD, f, 1, 2, 3)
            expect(n.notifier).toBe(o)
            expect(n.eventType).toBe(EventType.ADD)
            expect(n.feature).toBe(f)
            expect(n.oldValue).toBe(1)
            expect(n.newValue).toBe(2)
            expect(n.position).toBe(3)

            f.featureID = 1
            expect(n.featureID).toBe(1)
        }
        {
            let n = new Notification(o, EventType.ADD, null, 1, 2, 3)
            expect(n.notifier).toBe(o)
            expect(n.eventType).toBe(EventType.ADD)
            expect(n.oldValue).toBe(1)
            expect(n.newValue).toBe(2)
            expect(n.position).toBe(3)

            let mockClass = mock<EClass>()
            let c = instance(mockClass)
            when(mockObject.eClass()).thenReturn(c)
            when(mockClass.getEStructuralFeature(0)).thenReturn(f)
            expect(n.feature).toBeNull()

            f.featureID = -1
            expect(n.featureID).toBe(-1)
        }
    })

    test("dispatch", () => {
        const mockObject = mock<EObject>()
        const mockFeature = mock<EStructuralFeature>()
        const o = instance(mockObject)
        const f = instance(mockFeature)
        let n = new Notification(o, EventType.ADD, f, 1, 2, 3)
        n.dispatch()
        verify(mockObject.eNotify(n)).once()
    })

    test("mergeSet", () => {
        const mockObject = mock<EObject>()
        const o = instance(mockObject)

        let n1 = new Notification(o, EventType.SET, 1, 1, 2)
        let n2 = new Notification(o, EventType.SET, 1, 2, 3)
        expect(n1.merge(n2)).toBeTruthy()
        expect(n1.eventType).toBe(EventType.SET)
        expect(n1.oldValue).toBe(1)
        expect(n1.newValue).toBe(3)
    })

    test("mergeUnSet", () => {
        const mockObject = mock<EObject>()
        const o = instance(mockObject)
        {
            let n1 = new Notification(o, EventType.SET, 1, 1, 2)
            let n2 = new Notification(o, EventType.UNSET, 1, 2, 0)
            expect(n1.merge(n2)).toBeTruthy()
            expect(n1.eventType).toBe(EventType.SET)
            expect(n1.oldValue).toBe(1)
            expect(n1.newValue).toBe(0)
        }
        {
            let n1 = new Notification(o, EventType.UNSET, 1, 1, 0)
            let n2 = new Notification(o, EventType.SET, 1, 0, 2)
            expect(n1.merge(n2)).toBeTruthy()
            expect(n1.eventType).toBe(EventType.SET)
            expect(n1.oldValue).toBe(1)
            expect(n1.newValue).toBe(2)
        }
    })

    test("mergeRemoveMany", () => {
        const mockObject = mock<EObject>()
        const mockObject1 = mock<EObject>()
        const mockObject2 = mock<EObject>()
        const mockObject3 = mock<EObject>()
        const o = instance(mockObject)
        const o1 = instance(mockObject1)
        const o2 = instance(mockObject2)
        const o3 = instance(mockObject3)
        {
            let n1 = new Notification(o, EventType.REMOVE, 1, o1, null, 2)
            let n2 = new Notification(o, EventType.REMOVE, 1, o2, null, 2)
            expect(n1.merge(n2)).toBeTruthy()
            expect(n1.eventType).toBe(EventType.REMOVE_MANY)
            expect(n1.oldValue).toEqual(expect.arrayContaining([o1, o2]))
            expect(n1.newValue).toEqual([2, 3])
        }
        {
            let n1 = new Notification(o, EventType.REMOVE_MANY, 1, [o1, o2], [2, 3])
            let n2 = new Notification(o, EventType.REMOVE, 1, o3, null, 2)
            expect(n1.merge(n2)).toBeTruthy()
            expect(n1.eventType).toBe(EventType.REMOVE_MANY)
            expect(n1.oldValue).toEqual(expect.arrayContaining([o1, o2, o3]))
            expect(n1.newValue).toEqual([2, 3, 4])
        }
    })

    test("add", () => {
        const mockObject = mock<EObject>()
        const o = instance(mockObject)
        {
            let n = new Notification(o, EventType.SET, 1, 1, 2)
            expect(n.add(null)).toBeFalsy()
        }
        {
            // create 2 identical set notifications
            let n1 = new Notification(o, EventType.SET, 1, 1, 2)
            let n2 = new Notification(o, EventType.SET, 1, 1, 2)

            // no add because there is a merge
            expect(n1.add(n2)).toBeFalsy()
        }
        {
            // create 2 add notifications with 2 different objects
            const mockObject1 = mock<EObject>()
            const mockObject2 = mock<EObject>()
            const o1 = instance(mockObject1)
            const o2 = instance(mockObject2)
            let n1 = new Notification(o, EventType.ADD, 1, o1, null)
            let n2 = new Notification(o, EventType.ADD, 1, o2, null)

            // check add
            expect(n1.add(n2)).toBeTruthy()

            // check that there is no merge by calling dispacth
            // we should have 2 notification
            n1.dispatch()
            verify(mockObject.eNotify(n1)).once()
            verify(mockObject.eNotify(n2)).once()
        }
    })
})
