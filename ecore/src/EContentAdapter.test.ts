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
        let o: EObject = null
        let n: ENotifier = o as ENotifier
        let o2: EObject = n as EObject
        expect(o2).toBeNull()
    })

    test("setTarget", () => {
        let adapter = new EContentAdapter()
        let children: EObject[] = []
        let nb = Math.floor(Math.random() * 10) + 1
        for (let index = 0; index < nb; index++) {
            let mockObject = mock<EObject>()
            let mockAdapters = mock<EList<EAdapter>>()
            let object = instance(mockObject)
            let adapters = instance(mockAdapters)

            when(mockObject.eAdapters()).thenReturn(adapters)
            when(mockAdapters.contains(adapter)).thenReturn(false)
            when(mockAdapters.add(adapter)).thenReturn(true)
            when(mockAdapters.remove(adapter)).thenReturn(true)
            children.push(object)
        }
        let mockChildren = new ImmutableEList<EObject>(children)
        let mockObject = mock<EObject>()
        when(mockObject.eContents()).thenReturn(mockChildren)

        let object = instance(mockObject)

        adapter.setTarget(object)
        adapter.setTarget(null)
    })

    describe("notifyChanged", () => {
        test("simple", () => {
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockAttribute = mock<EAttribute>()
            let attribute = instance(mockAttribute)

            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getFeature()).thenReturn(attribute)
            adapter.notifyChanged(notification)

            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getFeature()).once()
            resetCalls(mockNotification)

            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(false)
            when(mockNotification.getNotifier()).thenReturn(object)
            when(mockNotification.getFeature()).thenReturn(reference)
            adapter.notifyChanged(notification)

            verify(mockNotification.getNotifier()).once()
            verify(mockNotification.getFeature()).once()
        })

        test("resolve", () => {
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockOldObject = mock<EObject>()
            let oldObject = instance(mockOldObject)
            let mockOldAdapters = mock<EList<EAdapter>>()
            let oldAdapters = instance(mockOldAdapters)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

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
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockOldObject = mock<EObject>()
            let oldObject = instance(mockOldObject)
            let mockNewObject = mock<EObject>()
            let newObject = instance(mockNewObject)
            let mockOldAdapters = mock<EList<EAdapter>>()
            let oldAdapters = instance(mockOldAdapters)
            let mockNewAdapters = mock<EList<EAdapter>>()
            let newAdapters = instance(mockNewAdapters)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

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
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockOldObject = mock<EObjectInternal>()
            let oldObject = instance(mockOldObject)
            let mockNewObject = mock<EObjectInternal>()
            let newObject = instance(mockNewObject)
            let mockOldAdapters = mock<EList<EAdapter>>()
            let oldAdapters = instance(mockOldAdapters)
            let mockNewAdapters = mock<EList<EAdapter>>()
            let newAdapters = instance(mockNewAdapters)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

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
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockOldObject = mock<EObjectInternal>()
            let oldObject = instance(mockOldObject)
            let mockNewObject = mock<EObjectInternal>()
            let newObject = instance(mockNewObject)
            let mockOldAdapters = mock<EList<EAdapter>>()
            let oldAdapters = instance(mockOldAdapters)
            let mockNewAdapters = mock<EList<EAdapter>>()
            let newAdapters = instance(mockNewAdapters)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

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
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockNewObject = mock<EObjectInternal>()
            let newObject = instance(mockNewObject)
            let mockNewAdapters = mock<EList<EAdapter>>()
            let newAdapters = instance(mockNewAdapters)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

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
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)

            let children: EObject[] = []
            let nb = Math.floor(Math.random() * 10) + 1
            for (let index = 0; index < nb; index++) {
                let mockObject = mock<EObject>()
                let mockAdapters = mock<EList<EAdapter>>()
                let object = instance(mockObject)
                let adapters = instance(mockAdapters)

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
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObjectInternal>()
            let object = instance(mockObject)
            let mockOldObject = mock<EObjectInternal>()
            let oldObject = instance(mockOldObject)
            let mockOldAdapters = mock<EList<EAdapter>>()
            let oldAdapters = instance(mockOldAdapters)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

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
            let adapter = new EContentAdapter()
            let mockNotification = mock<ENotification>()
            let notification = instance(mockNotification)
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockReference = mock<EReference>()
            let reference = instance(mockReference)

            when(mockReference.isContainment()).thenReturn(true)
            when(mockReference.getEReferenceType()).thenReturn(null)

            let children: EObject[] = []
            let nb = Math.floor(Math.random() * 10) + 1
            for (let index = 0; index < nb; index++) {
                let mockObject = mock<EObjectInternal>()
                let mockAdapters = mock<EList<EAdapter>>()
                let object = instance(mockObject)
                let adapters = instance(mockAdapters)

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
