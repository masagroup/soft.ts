// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as deepEqual from "deep-equal"
import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito"
import {
    EAdapter,
    EAnnotationImpl,
    EList,
    EMap,
    EMapEntry,
    EModelElement,
    ENotification,
    ENotificationChain,
    ENotifyingList,
    EOPPOSITE_FEATURE_BASE,
    EObject,
    EObjectInternal,
    EObjectList,
    EResource,
    EResourceSet,
    EStringToStringMapEntry,
    EcoreConstants,
    EventType,
    ImmutableEList,
    Notification,
    URI,
    getEcorePackage,
    isEObjectList,
} from "./internal"

interface EModelElementInternal extends EModelElement, EObjectInternal {}
interface EStringToStringMapEntryInternal extends EStringToStringMapEntry, EObjectInternal {}

describe("EAnnotationImpl", () => {
    test("eStaticClass", () => {
        let o = new EAnnotationImpl()
        expect(o.eStaticClass()).toBe(getEcorePackage().getEAnnotationClass())
    })

    test("getContents", () => {
        let o = new EAnnotationImpl()
        expect(o.contents).not.toBeNull()
    })

    test("getDetails", () => {
        let o = new EAnnotationImpl()
        expect(o.details).not.toBeNull()
    })

    test("getEModelElement", () => {
        // default
        let o = new EAnnotationImpl()
        expect(o.eModelElement).toBeNull()

        // set a mock container
        let mockContainer = mock<EObject>()
        let container = instance(mockContainer)
        o.eSetInternalContainer(container, EcoreConstants.EANNOTATION__EMODEL_ELEMENT)

        // no proxy
        when(mockContainer.eIsProxy()).thenReturn(false)
        expect(o.eModelElement).toBe(container)
        verify(mockContainer.eIsProxy()).once()
    })

    test("setEModelElement", () => {
        let o = new EAnnotationImpl()
        let mockResource = mock<EResource>()
        let resource = instance(mockResource)
        let mockValue = mock<EModelElementInternal>()
        let value = instance(mockValue)

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        when(mockValue.eInverseAdd(o, EcoreConstants.EMODEL_ELEMENT__EANNOTATIONS, null)).thenReturn(null)
        when(mockValue.eResource()).thenReturn(resource)
        o.eModelElement = value
        verify(mockResource.attached(o)).once()
        verify(mockAdapter.notifyChanged(anything())).once()
        {
            let [notification] = capture(mockAdapter.notifyChanged).last()
            expect(notification.notifier).toBe(o)
            expect(notification.oldValue).toBeNull()
            expect(notification.newValue).toBe(value)
        }
        // set with the same value
        reset(mockAdapter)
        o.eModelElement = value
        verify(mockAdapter.notifyChanged(anything())).once()

        // set with another value in a different resource
        let mockOther = mock<EModelElementInternal>()
        let other = instance(mockOther)
        let mockOtherResource = mock<EResource>()
        let otherResource = instance(mockOtherResource)
        reset(mockAdapter)
        reset(mockValue)
        reset(mockResource)
        when(mockValue.eInverseRemove(o, EcoreConstants.EMODEL_ELEMENT__EANNOTATIONS, null)).thenReturn(null)
        when(mockValue.eResource()).thenReturn(resource)
        when(mockOther.eInverseAdd(o, EcoreConstants.EMODEL_ELEMENT__EANNOTATIONS, null)).thenReturn(null)
        when(mockOther.eResource()).thenReturn(otherResource)
        o.eModelElement = other
        verify(mockResource.detached(o)).once()
        verify(mockOtherResource.attached(o)).once()
        verify(mockAdapter.notifyChanged(anything())).once()
        {
            let [notification] = capture(mockAdapter.notifyChanged).last()
            expect(notification.notifier).toBe(o)
            expect(notification.oldValue).toBe(value)
            expect(notification.newValue).toBe(other)
            expect(notification.position).toBe(-1)
        }
    })

    test("basicSetEModelElement", () => {
        let o = new EAnnotationImpl()
        let mockValue = mock<EModelElementInternal>()
        let value = instance(mockValue)

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // notification chain
        let mockNotifications = mock<ENotificationChain>()
        let notifications = instance(mockNotifications)

        // set value
        when(mockValue.eResource()).thenReturn(null)
        when(mockNotifications.add(anything())).thenReturn(true)
        o.basicSetEModelElement(value, notifications)

        // checks
        verify(mockNotifications.add(anything())).once()
        const [notification] = capture(mockNotifications.add).last()
        expect(notification.notifier).toBe(o)
        expect(notification.eventType).toBe(EventType.SET)
        expect(notification.featureID).toBe(EcoreConstants.EANNOTATION__EMODEL_ELEMENT)
        expect(notification.oldValue).toBeNull()
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getReferences", () => {
        let o = new EAnnotationImpl()
        expect(o.references).not.toBeNull()
    })

    test("getSource", () => {
        let o = new EAnnotationImpl()
        // get default value
        expect(o.source).toBe("")
    })

    test("setSource", () => {
        let o = new EAnnotationImpl()
        let value = "Test String"

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.source = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe("")
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("eGetFromID", () => {
        let o = new EAnnotationImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(EcoreConstants.EANNOTATION__CONTENTS, true)).toStrictEqual(o.contents)
        expect(
            deepEqual(
                o.eGetFromID(EcoreConstants.EANNOTATION__CONTENTS, false),
                (o.contents as EObjectList<EObject>).getUnResolvedList(),
            ),
        ).toBeTruthy()
        expect(o.eGetFromID(EcoreConstants.EANNOTATION__DETAILS, true)).toStrictEqual(o.details)
        expect(o.eGetFromID(EcoreConstants.EANNOTATION__EMODEL_ELEMENT, true)).toStrictEqual(o.eModelElement)
        expect(o.eGetFromID(EcoreConstants.EANNOTATION__REFERENCES, true)).toStrictEqual(o.references)
        expect(
            deepEqual(
                o.eGetFromID(EcoreConstants.EANNOTATION__REFERENCES, false),
                (o.references as EObjectList<EObject>).getUnResolvedList(),
            ),
        ).toBeTruthy()
        expect(o.eGetFromID(EcoreConstants.EANNOTATION__SOURCE, true)).toStrictEqual(o.source)
    })

    test("eSetFromID", () => {
        let o = new EAnnotationImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            // list with a value
            let mockValue = mock<EObjectInternal>()
            let value = instance(mockValue)
            let l = new ImmutableEList<EObject>([value])
            when(
                mockValue.eInverseAdd(o, EOPPOSITE_FEATURE_BASE - EcoreConstants.EANNOTATION__CONTENTS, anything()),
            ).thenReturn(null)

            // set list with new contents
            o.eSetFromID(EcoreConstants.EANNOTATION__CONTENTS, l)
            // checks
            expect(o.contents.size()).toBe(1)
            expect(o.contents.get(0)).toBe(value)
            verify(
                mockValue.eInverseAdd(o, EOPPOSITE_FEATURE_BASE - EcoreConstants.EANNOTATION__CONTENTS, anything()),
            ).once()
        }

        {
            let mockMap = mock<EMap<string, string>>()
            let map = instance(mockMap)
            let mockIterator = mock<Iterator<EMapEntry<string, string>>>()
            let iterator = instance(mockIterator)
            let mockEntry = mock<EMapEntry<string, string>>()
            let entry = instance(mockEntry)
            let key = "Test String"
            let value = "Test String"
            when(mockMap[Symbol.iterator]()).thenReturn(iterator)
            when(mockIterator.next())
                .thenReturn({ value: entry, done: false })
                .thenReturn({ value: undefined, done: true })
            when(mockEntry.key).thenReturn(key)
            when(mockEntry.value).thenReturn(value)
            o.eSetFromID(EcoreConstants.EANNOTATION__DETAILS, map)
            expect(o.details.toMap()).toEqual(new Map<string, string>([[key, value]]))
        }
        {
            let mockValue = mock<EModelElementInternal>()
            let value = instance(mockValue)
            when(mockValue.eIsProxy()).thenReturn(false)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eInverseAdd(o, EcoreConstants.EMODEL_ELEMENT__EANNOTATIONS, null)).thenReturn(null)
            o.eSetFromID(EcoreConstants.EANNOTATION__EMODEL_ELEMENT, value)
            expect(o.eGetFromID(EcoreConstants.EANNOTATION__EMODEL_ELEMENT, false)).toBe(value)
            verify(mockValue.eIsProxy()).once()
            verify(mockValue.eResource()).once()
            verify(mockValue.eInverseAdd(o, EcoreConstants.EMODEL_ELEMENT__EANNOTATIONS, null)).once()
        }
        {
            // list with a value
            let mockValue = mock<EObjectInternal>()
            let value = instance(mockValue)
            let l = new ImmutableEList<EObject>([value])
            when(mockValue.eIsProxy()).thenReturn(false)

            // set list with new contents
            o.eSetFromID(EcoreConstants.EANNOTATION__REFERENCES, l)
            // checks
            expect(o.references.size()).toBe(1)
            expect(o.references.get(0)).toBe(value)
        }

        {
            let value = "Test String"
            o.eSetFromID(EcoreConstants.EANNOTATION__SOURCE, value)
            expect(o.eGetFromID(EcoreConstants.EANNOTATION__SOURCE, false)).toBe(value)
        }
    })

    test("eIsSetFromID", () => {
        let o = new EAnnotationImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(EcoreConstants.EANNOTATION__CONTENTS)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.EANNOTATION__DETAILS)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.EANNOTATION__EMODEL_ELEMENT)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.EANNOTATION__REFERENCES)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.EANNOTATION__SOURCE)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        let o = new EAnnotationImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(EcoreConstants.EANNOTATION__CONTENTS)
            let v = o.eGetFromID(EcoreConstants.EANNOTATION__CONTENTS, false)
            expect(v).not.toBeNull()
            let l = v as EList<EObject>
            expect(l.isEmpty()).toBeTruthy()
        }
        {
            o.eUnsetFromID(EcoreConstants.EANNOTATION__DETAILS)
            let v = o.eGetFromID(EcoreConstants.EANNOTATION__DETAILS, false)
            expect(v).not.toBeNull()
            let l = v as EList<EStringToStringMapEntry>
            expect(l.isEmpty()).toBeTruthy()
        }
        {
            o.eUnsetFromID(EcoreConstants.EANNOTATION__EMODEL_ELEMENT)
            expect(o.eGetFromID(EcoreConstants.EANNOTATION__EMODEL_ELEMENT, false)).toBeNull()
        }
        {
            o.eUnsetFromID(EcoreConstants.EANNOTATION__REFERENCES)
            let v = o.eGetFromID(EcoreConstants.EANNOTATION__REFERENCES, false)
            expect(v).not.toBeNull()
            let l = v as EList<EObject>
            expect(l.isEmpty()).toBeTruthy()
        }
        {
            o.eUnsetFromID(EcoreConstants.EANNOTATION__SOURCE)
            let v = o.eGetFromID(EcoreConstants.EANNOTATION__SOURCE, false)
            expect(v).toBe("")
        }
    })

    test("eBasicInverseAdd", () => {
        let o = new EAnnotationImpl()
        {
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockNotifications = mock<ENotificationChain>()
            let notifications = instance(mockNotifications)
            expect(o.eBasicInverseAdd(object, -1, notifications)).toBe(notifications)
        }
        {
            let mockValue = mock<EModelElementInternal>()
            let value = instance(mockValue)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eIsProxy()).thenReturn(false)
            o.eBasicInverseAdd(value, EcoreConstants.EANNOTATION__EMODEL_ELEMENT, null)
            expect(o.eModelElement).toBe(value)

            reset(mockValue)
            let mockOther = mock<EModelElementInternal>()
            let other = instance(mockOther)
            when(mockOther.eResource()).thenReturn(null)
            when(mockOther.eIsProxy()).thenReturn(false)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eInverseRemove(o, EcoreConstants.EMODEL_ELEMENT__EANNOTATIONS, null)).thenReturn(null)
            o.eBasicInverseAdd(other, EcoreConstants.EANNOTATION__EMODEL_ELEMENT, null)
            expect(o.eModelElement).toBe(other)
        }
    })

    test("eBasicInverseRemove", () => {
        let o = new EAnnotationImpl()
        {
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockNotifications = mock<ENotificationChain>()
            let notifications = instance(mockNotifications)
            expect(o.eBasicInverseRemove(object, -1, notifications)).toBe(notifications)
        }
        {
            // initialize list with a mock object
            let mockValue = mock<EObjectInternal>()
            let value = instance(mockValue)
            when(
                mockValue.eInverseAdd(o, EOPPOSITE_FEATURE_BASE - EcoreConstants.EANNOTATION__CONTENTS, anything()),
            ).thenReturn(null)

            o.contents.add(value)

            // basic inverse remove
            o.eBasicInverseRemove(value, EcoreConstants.EANNOTATION__CONTENTS, null)

            // check it was removed
            expect(o.contents.contains(value)).toBeFalsy()
        }
        {
            let mockValue = mock<EStringToStringMapEntryInternal>()
            let value = instance(mockValue)
            o.eBasicInverseRemove(mockValue, EcoreConstants.EANNOTATION__DETAILS, null)
            expect(o.details.isEmpty())
        }
        {
            let mockValue = mock<EModelElementInternal>()
            let value = instance(mockValue)
            o.eBasicInverseRemove(value, EcoreConstants.EANNOTATION__EMODEL_ELEMENT, null)
        }
    })
})
