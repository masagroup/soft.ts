// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, resetCalls, verify, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import {
    EAdapter,
    EAttribute,
    EContentAdapter,
    EList,
    ENotification,
    ENotifier,
    EObject,
    EObjectInternal,
    EReference,
    EventType,
    ImmutableEList
} from "./internal.js"

describe("EContentAdapter", () => {
    test("convert", () => {
        const o: EObject = null
        const n: ENotifier = o as ENotifier
        const o2: EObject = n as EObject
        expect(o2).toBeNull()
    })

    test("setTarget", () => {
        const adapter = new EContentAdapter()
        const children: EObject[] = []
        const nb = Math.floor(Math.random() * 10) + 1
        for (let index = 0; index < nb; index++) {
            const mockObject = mock<EObject>()
            const mockAdapters = mock<EList<EAdapter>>()
            const object = instance(mockObject)
            const adapters = instance(mockAdapters)

            when(mockObject.eAdapters()).thenReturn(adapters)
            when(mockAdapters.contains(adapter)).thenReturn(false)
            when(mockAdapters.add(adapter)).thenReturn(true)
            when(mockAdapters.remove(adapter)).thenReturn(true)
            children.push(object)
        }
        const mockChildren = new ImmutableEList<EObject>(children)
        const mockObject = mock<EObject>()
        when(mockObject.eContents()).thenReturn(mockChildren)

        const object = instance(mockObject)

        adapter.setTarget(object)
        adapter.setTarget(null)
    })

    describe("notifyChanged", () => {
        test("simple", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockAttribute = mock<EAttribute>()
            const attribute = instance(mockAttribute)

            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getFeature()).thenReturn(attribute)
            adapter.notifyChanged(notification)

            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getFeature()).once()
            resetCalls(mockNotification)

            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(false)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getFeature()).thenReturn(reference)
            adapter.notifyChanged(notification)

            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getFeature()).once()
        })

        test("resolve", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockOldObject = mock<EObject>()
            const oldObject = instance(mockOldObject)
            const mockOldAdapters = mock<EList<EAdapter>>()
            const oldAdapters = instance(mockOldAdapters)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)
            when(mockOldObject.eAdapters()).thenReturn(oldAdapters)
            when(mockOldAdapters.contains(adapter)).thenReturn(false)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.RESOLVE)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getOldValue()).thenReturn(oldObject)

            adapter.notifyChanged(notification)

            verify(mockOldAdapters.contains(adapter)).once()
            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getEventType()).once()
            verify(mockNotification.getFeature()).once()
            verify(mockNotification.getOldValue()).once()
        })

        test("resolveContains", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockOldObject = mock<EObject>()
            const oldObject = instance(mockOldObject)
            const mockNewObject = mock<EObject>()
            const newObject = instance(mockNewObject)
            const mockOldAdapters = mock<EList<EAdapter>>()
            const oldAdapters = instance(mockOldAdapters)
            const mockNewAdapters = mock<EList<EAdapter>>()
            const newAdapters = instance(mockNewAdapters)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)
            when(mockOldObject.eAdapters()).thenReturn(oldAdapters)
            when(mockOldAdapters.contains(adapter)).thenReturn(true)
            when(mockOldAdapters.remove(adapter)).thenReturn(true)
            when(mockNewObject.eAdapters()).thenReturn(newAdapters)
            when(mockNewAdapters.contains(adapter)).thenReturn(false)
            when(mockNewAdapters.add(adapter)).thenReturn(true)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.RESOLVE)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getOldValue()).thenReturn(oldObject)
            when(mockNotification.getNewValue()).thenReturn(newObject)

            adapter.notifyChanged(notification)

            verify(mockReference.isContainment()).once()
            verify(mockOldObject.eAdapters()).twice()
            verify(mockOldAdapters.contains(adapter)).once()
            verify(mockOldAdapters.remove(adapter)).once()
            verify(mockNewObject.eAdapters()).twice()
            verify(mockNewAdapters.contains(adapter)).once()
            verify(mockNewAdapters.add(adapter)).once()
            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getEventType()).once()
            verify(mockNotification.getFeature()).once()
            verify(mockNotification.getOldValue()).once()
            verify(mockNotification.getNewValue()).once()
        })

        test("unSet", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockOldObject = mock<EObjectInternal>()
            const oldObject = instance(mockOldObject)
            const mockNewObject = mock<EObjectInternal>()
            const newObject = instance(mockNewObject)
            const mockOldAdapters = mock<EList<EAdapter>>()
            const oldAdapters = instance(mockOldAdapters)
            const mockNewAdapters = mock<EList<EAdapter>>()
            const newAdapters = instance(mockNewAdapters)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)
            when(mockOldObject.eAdapters()).thenReturn(oldAdapters)
            when(mockOldObject.eInternalResource()).thenReturn(null)
            when(mockOldAdapters.remove(adapter)).thenReturn(true)
            when(mockNewObject.eAdapters()).thenReturn(newAdapters)
            when(mockNewAdapters.contains(adapter)).thenReturn(false)
            when(mockNewAdapters.add(adapter)).thenReturn(true)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.UNSET)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getOldValue()).thenReturn(oldObject)
            when(mockNotification.getNewValue()).thenReturn(newObject)

            adapter.notifyChanged(notification)

            verify(mockReference.isContainment()).once()
            verify(mockOldObject.eAdapters()).once()
            verify(mockOldAdapters.remove(adapter)).once()
            verify(mockNewObject.eAdapters()).twice()
            verify(mockNewAdapters.contains(adapter)).once()
            verify(mockNewAdapters.add(adapter)).once()
            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getEventType()).once()
            verify(mockNotification.getFeature()).once()
            verify(mockNotification.getOldValue()).once()
            verify(mockNotification.getNewValue()).once()
        })

        test("set", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockOldObject = mock<EObjectInternal>()
            const oldObject = instance(mockOldObject)
            const mockNewObject = mock<EObjectInternal>()
            const newObject = instance(mockNewObject)
            const mockOldAdapters = mock<EList<EAdapter>>()
            const oldAdapters = instance(mockOldAdapters)
            const mockNewAdapters = mock<EList<EAdapter>>()
            const newAdapters = instance(mockNewAdapters)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)
            when(mockOldObject.eAdapters()).thenReturn(oldAdapters)
            when(mockOldObject.eInternalResource()).thenReturn(null)
            when(mockOldAdapters.remove(adapter)).thenReturn(true)
            when(mockNewObject.eAdapters()).thenReturn(newAdapters)
            when(mockNewAdapters.contains(adapter)).thenReturn(false)
            when(mockNewAdapters.add(adapter)).thenReturn(true)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.SET)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getOldValue()).thenReturn(oldObject)
            when(mockNotification.getNewValue()).thenReturn(newObject)

            adapter.notifyChanged(notification)

            verify(mockReference.isContainment()).once()
            verify(mockOldObject.eAdapters()).once()
            verify(mockOldAdapters.remove(adapter)).once()
            verify(mockNewObject.eAdapters()).twice()
            verify(mockNewAdapters.contains(adapter)).once()
            verify(mockNewAdapters.add(adapter)).once()
            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getEventType()).once()
            verify(mockNotification.getFeature()).once()
            verify(mockNotification.getOldValue()).once()
            verify(mockNotification.getNewValue()).once()
        })

        test("add", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockNewObject = mock<EObjectInternal>()
            const newObject = instance(mockNewObject)
            const mockNewAdapters = mock<EList<EAdapter>>()
            const newAdapters = instance(mockNewAdapters)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)
            when(mockNewObject.eAdapters()).thenReturn(newAdapters)
            when(mockNewAdapters.contains(adapter)).thenReturn(false)
            when(mockNewAdapters.add(adapter)).thenReturn(true)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.ADD)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getNewValue()).thenReturn(newObject)

            adapter.notifyChanged(notification)

            verify(mockReference.isContainment()).once()
            verify(mockNewObject.eAdapters()).twice()
            verify(mockNewAdapters.contains(adapter)).once()
            verify(mockNewAdapters.add(adapter)).once()
            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getEventType()).once()
            verify(mockNotification.getFeature()).once()
            verify(mockNotification.getNewValue()).once()
        })

        test("addMany", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)

            const children: EObject[] = []
            const nb = Math.floor(Math.random() * 10) + 1
            for (let index = 0; index < nb; index++) {
                const mockObject = mock<EObject>()
                const mockAdapters = mock<EList<EAdapter>>()
                const object = instance(mockObject)
                const adapters = instance(mockAdapters)

                when(mockObject.eAdapters()).thenReturn(adapters)
                when(mockAdapters.contains(adapter)).thenReturn(false)
                when(mockAdapters.add(adapter)).thenReturn(true)
                children.push(object)
            }
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.ADD_MANY)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getNewValue()).thenReturn(children)

            adapter.notifyChanged(notification)
        })

        test("remove", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObjectInternal>()
            const object = instance(mockObject)
            const mockOldObject = mock<EObjectInternal>()
            const oldObject = instance(mockOldObject)
            const mockOldAdapters = mock<EList<EAdapter>>()
            const oldAdapters = instance(mockOldAdapters)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)
            when(mockOldObject.eAdapters()).thenReturn(oldAdapters)
            when(mockOldObject.eInternalResource()).thenReturn(null)
            when(mockOldAdapters.remove(adapter)).thenReturn(true)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.REMOVE)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getOldValue()).thenReturn(oldObject)

            adapter.notifyChanged(notification)

            verify(mockReference.isContainment()).once()
            verify(mockOldObject.eAdapters()).once()
            verify(mockOldObject.eInternalResource()).once()
            verify(mockOldAdapters.remove(adapter)).once()
            verify(mockNotification.getEventType()).once()
            verify(mockNotification.getFeature()).twice()
            verify(mockNotification.getOldValue()).twice()
        })

        test("removeMany", () => {
            const adapter = new EContentAdapter()
            const mockNotification = mock<ENotification>()
            const notification = instance(mockNotification)
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockReference = mock<EReference>()
            const reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)

            const children: EObject[] = []
            const nb = Math.floor(Math.random() * 10) + 1
            for (let index = 0; index < nb; index++) {
                const mockObject = mock<EObjectInternal>()
                const mockAdapters = mock<EList<EAdapter>>()
                const object = instance(mockObject)
                const adapters = instance(mockAdapters)

                when(mockObject.eAdapters()).thenReturn(adapters)
                when(mockObject.eInternalResource()).thenReturn(null)
                when(mockAdapters.remove(adapter)).thenReturn(true)
                children.push(object)
            }
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getEventType()).thenReturn(EventType.REMOVE_MANY)
            when(mockNotification.getFeature()).thenReturn(reference)
            when(mockNotification.getOldValue()).thenReturn(children)

            adapter.notifyChanged(notification)
        })
    })
})
