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
import { describe, expect, test } from "vitest"
import {
    EAdapter,
    EClassifierImpl,
    ENotificationChain,
    EObject,
    EObjectInternal,
    EPackage,
    EcoreConstants,
    getEcorePackage
} from "./internal.js"

interface EPackageInternal extends EPackage, EObjectInternal {}

describe("EClassifierImpl", () => {
    test("eStaticClass", () => {
        const o = new EClassifierImpl()
        expect(o.eStaticClass()).toBe(getEcorePackage().getEClassifierClass())
    })

    test("getClassifierID", () => {
        const o = new EClassifierImpl()
        // get default value
        expect(o.getClassifierID()).toBe(-1)
    })

    test("setClassifierID", () => {
        const o = new EClassifierImpl()
        const value = 45

        // add listener
        const mockAdapter = mock<EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setClassifierID(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBe(-1)
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getDefaultValue", () => {
        const o = new EClassifierImpl()
        expect(() => o.getDefaultValue()).toThrow(Error)
    })

    test("getEPackage", () => {
        // default
        const o = new EClassifierImpl()
        expect(o.getEPackage()).toBeNull()

        // set a mock container
        const mockContainer = mock<EObject>()
        const container = instance(mockContainer)
        o.eSetInternalContainer(container, EcoreConstants.ECLASSIFIER__EPACKAGE)

        // no proxy
        when(mockContainer.eIsProxy()).thenReturn(false)
        expect(o.getEPackage()).toBe(container)
        verify(mockContainer.eIsProxy()).once()
    })

    test("getInstanceClass", () => {
        const o = new EClassifierImpl()
        // get default value
        expect(o.getInstanceClass()).toBe(null)
    })

    test("setInstanceClass", () => {
        const o = new EClassifierImpl()
        const value = null

        // add listener
        const mockAdapter = mock<EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setInstanceClass(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBeNull()
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getInstanceClassName", () => {
        const o = new EClassifierImpl()
        // get default value
        expect(o.getInstanceClassName()).toBe("")
    })

    test("setInstanceClassName", () => {
        const o = new EClassifierImpl()
        const value = "Test String"

        // add listener
        const mockAdapter = mock<EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setInstanceClassName(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBe("")
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getInstanceTypeName", () => {
        const o = new EClassifierImpl()
        expect(() => o.getInstanceTypeName()).toThrow(Error)
    })

    test("setInstanceTypeName", () => {
        const o = new EClassifierImpl()
        const value = "Test String"
        expect(() => o.setInstanceTypeName(value)).toThrow(Error)
    })

    test("isInstance", () => {
        const o = new EClassifierImpl()
        expect(() => o.isInstance(null)).toThrow(Error)
    })

    test("eGetFromID", () => {
        const o = new EClassifierImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, true)).toStrictEqual(o.getClassifierID())
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__DEFAULT_VALUE, true)).toThrow(Error)
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__DEFAULT_VALUE, false)).toThrow(Error)
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__EPACKAGE, true)).toStrictEqual(o.getEPackage())
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, true)).toStrictEqual(o.getInstanceClass())
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, true)).toStrictEqual(o.getInstanceClassName())
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME, true)).toThrow(Error)
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME, false)).toThrow(Error)
    })

    test("eSetFromID", () => {
        const o = new EClassifierImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            const value = 45
            o.eSetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, value)
            expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, false)).toBe(value)
        }
        {
            const value = null
            o.eSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, value)
            expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, false)).toBe(value)
        }
        {
            const value = "Test String"
            o.eSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, value)
            expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, false)).toBe(value)
        }
        expect(() => o.eSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME, null)).toThrow(Error)
    })

    test("eIsSetFromID", () => {
        const o = new EClassifierImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID)).toBeFalsy()
        expect(() => o.eIsSetFromID(EcoreConstants.ECLASSIFIER__DEFAULT_VALUE)).toThrow(Error)
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__EPACKAGE)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME)).toBeFalsy()
        expect(() => o.eIsSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME)).toThrow(Error)
    })

    test("eUnsetFromID", () => {
        const o = new EClassifierImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID)
            const v = o.eGetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, false)
            expect(v).toBe(-1)
        }
        {
            o.eUnsetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS)
            const v = o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, false)
            expect(v).toBeNull()
        }
        {
            o.eUnsetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME)
            const v = o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, false)
            expect(v).toBe("")
        }
        {
            expect(() => o.eUnsetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME)).toThrow(Error)
        }
    })

    test("eInvokeFromID", () => {
        const o = new EClassifierImpl()
        expect(() => o.eInvokeFromID(-1, null)).toThrow(Error)
        expect(() => o.eInvokeFromID(EcoreConstants.ECLASSIFIER__IS_INSTANCE_EJAVAOBJECT, null)).toThrow(Error)
    })

    test("eBasicInverseAdd", () => {
        const o = new EClassifierImpl()
        {
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockNotifications = mock<ENotificationChain>()
            const notifications = instance(mockNotifications)
            expect(o.eBasicInverseAdd(object, -1, notifications)).toBe(notifications)
        }
        {
            const mockValue = mock<EPackageInternal>()
            const value = instance(mockValue)
            when(mockValue.eClass()).thenReturn(null)
            when(mockValue.eStaticClass()).thenReturn(null)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eIsProxy()).thenReturn(false)
            o.eBasicInverseAdd(value, EcoreConstants.ECLASSIFIER__EPACKAGE, null)
            expect(o.getEPackage()).toBe(value)

            reset(mockValue)
            const mockOther = mock<EPackageInternal>()
            const other = instance(mockOther)
            when(mockOther.eResource()).thenReturn(null)
            when(mockOther.eIsProxy()).thenReturn(false)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eInverseRemove(o, EcoreConstants.EPACKAGE__ECLASSIFIERS, null)).thenReturn(null)
            o.eBasicInverseAdd(other, EcoreConstants.ECLASSIFIER__EPACKAGE, null)
            expect(o.getEPackage()).toBe(other)
        }
    })

    test("eBasicInverseRemove", () => {
        const o = new EClassifierImpl()
        {
            const mockObject = mock<EObject>()
            const object = instance(mockObject)
            const mockNotifications = mock<ENotificationChain>()
            const notifications = instance(mockNotifications)
            expect(o.eBasicInverseRemove(object, -1, notifications)).toBe(notifications)
        }
        {
            const mockValue = mock<EPackageInternal>()
            const value = instance(mockValue)
            o.eBasicInverseRemove(value, EcoreConstants.ECLASSIFIER__EPACKAGE, null)
        }
    })
})
