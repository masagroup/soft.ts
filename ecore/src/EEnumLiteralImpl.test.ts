// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito"
import {
    EAdapter,
    EEnum,
    EEnumLiteralImpl,
    EList,
    ENamedElement,
    ENotification,
    ENotificationChain,
    ENotifyingList,
    EOPPOSITE_FEATURE_BASE,
    EObject,
    EObjectInternal,
    EResource,
    EResourceSet,
    EcoreConstants,
    EventType,
    Notification,
    URI,
    getEcorePackage,
    isEObjectList
} from "./internal"

interface EEnumInternal extends EEnum, EObjectInternal {}

describe("EEnumLiteralImpl", () => {
    test("eStaticClass", () => {
        let o = new EEnumLiteralImpl()
        expect(o.eStaticClass()).toBe(getEcorePackage().getEEnumLiteral())
    })

    test("getEEnum", () => {
        // default
        let o = new EEnumLiteralImpl()
        expect(o.eEnum).toBeNull()

        // set a mock container
        let mockContainer = mock<EObject>()
        let container = instance(mockContainer)
        o.eSetInternalContainer(container, EcoreConstants.EENUM_LITERAL__EENUM)

        // no proxy
        when(mockContainer.eIsProxy()).thenReturn(false)
        expect(o.eEnum).toBe(container)
        verify(mockContainer.eIsProxy()).once()
    })

    test("getInstance", () => {
        let o = new EEnumLiteralImpl()
        // get default value
        expect(o.instance).toBe(null)
    })

    test("setInstance", () => {
        let o = new EEnumLiteralImpl()
        let value = null

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.instance = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBeNull()
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getLiteral", () => {
        let o = new EEnumLiteralImpl()
        // get default value
        expect(o.literal).toBe("")
    })

    test("setLiteral", () => {
        let o = new EEnumLiteralImpl()
        let value = "Test String"

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.literal = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe("")
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getValue", () => {
        let o = new EEnumLiteralImpl()
        // get default value
        expect(o.value).toBe(0)
    })

    test("setValue", () => {
        let o = new EEnumLiteralImpl()
        let value = 45

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.value = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe(0)
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("eGetFromID", () => {
        let o = new EEnumLiteralImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(EcoreConstants.EENUM_LITERAL__EENUM, true)).toStrictEqual(o.eEnum)
        expect(o.eGetFromID(EcoreConstants.EENUM_LITERAL__INSTANCE, true)).toStrictEqual(o.instance)
        expect(o.eGetFromID(EcoreConstants.EENUM_LITERAL__LITERAL, true)).toStrictEqual(o.literal)
        expect(o.eGetFromID(EcoreConstants.EENUM_LITERAL__VALUE, true)).toStrictEqual(o.value)
    })

    test("eSetFromID", () => {
        let o = new EEnumLiteralImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            let value = null
            o.eSetFromID(EcoreConstants.EENUM_LITERAL__INSTANCE, value)
            expect(o.eGetFromID(EcoreConstants.EENUM_LITERAL__INSTANCE, false)).toBe(value)
        }
        {
            let value = "Test String"
            o.eSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL, value)
            expect(o.eGetFromID(EcoreConstants.EENUM_LITERAL__LITERAL, false)).toBe(value)
        }
        {
            let value = 45
            o.eSetFromID(EcoreConstants.EENUM_LITERAL__VALUE, value)
            expect(o.eGetFromID(EcoreConstants.EENUM_LITERAL__VALUE, false)).toBe(value)
        }
    })

    test("eIsSetFromID", () => {
        let o = new EEnumLiteralImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(EcoreConstants.EENUM_LITERAL__EENUM)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.EENUM_LITERAL__INSTANCE)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.EENUM_LITERAL__VALUE)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        let o = new EEnumLiteralImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(EcoreConstants.EENUM_LITERAL__INSTANCE)
            let v = o.eGetFromID(EcoreConstants.EENUM_LITERAL__INSTANCE, false)
            expect(v).toBeNull()
        }
        {
            o.eUnsetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)
            let v = o.eGetFromID(EcoreConstants.EENUM_LITERAL__LITERAL, false)
            expect(v).toBe("")
        }
        {
            o.eUnsetFromID(EcoreConstants.EENUM_LITERAL__VALUE)
            let v = o.eGetFromID(EcoreConstants.EENUM_LITERAL__VALUE, false)
            expect(v).toBe(0)
        }
    })

    test("eBasicInverseAdd", () => {
        let o = new EEnumLiteralImpl()
        {
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockNotifications = mock<ENotificationChain>()
            let notifications = instance(mockNotifications)
            expect(o.eBasicInverseAdd(object, -1, notifications)).toBe(notifications)
        }
        {
            let mockValue = mock<EEnumInternal>()
            let value = instance(mockValue)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eIsProxy()).thenReturn(false)
            o.eBasicInverseAdd(value, EcoreConstants.EENUM_LITERAL__EENUM, null)
            expect(o.eEnum).toBe(value)

            reset(mockValue)
            let mockOther = mock<EEnumInternal>()
            let other = instance(mockOther)
            when(mockOther.eResource()).thenReturn(null)
            when(mockOther.eIsProxy()).thenReturn(false)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eInverseRemove(o, EcoreConstants.EENUM__ELITERALS, null)).thenReturn(null)
            o.eBasicInverseAdd(other, EcoreConstants.EENUM_LITERAL__EENUM, null)
            expect(o.eEnum).toBe(other)
        }
    })

    test("eBasicInverseRemove", () => {
        let o = new EEnumLiteralImpl()
        {
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockNotifications = mock<ENotificationChain>()
            let notifications = instance(mockNotifications)
            expect(o.eBasicInverseRemove(object, -1, notifications)).toBe(notifications)
        }
        {
            let mockValue = mock<EEnumInternal>()
            let value = instance(mockValue)
            o.eBasicInverseRemove(value, EcoreConstants.EENUM_LITERAL__EENUM, null)
        }
    })
})
