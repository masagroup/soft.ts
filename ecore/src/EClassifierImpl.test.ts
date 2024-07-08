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
    EClassifierImpl,
    EList,
    ENamedElement,
    ENotification,
    ENotificationChain,
    ENotifyingList,
    EOPPOSITE_FEATURE_BASE,
    EObject,
    EObjectInternal,
    EPackage,
    EResource,
    EResourceSet,
    EcoreConstants,
    EventType,
    Notification,
    URI,
    getEcorePackage,
    isEObjectList
} from "./internal.js"

interface EPackageInternal extends EPackage, EObjectInternal {}

describe("EClassifierImpl", () => {
    test("eStaticClass", () => {
        let o = new EClassifierImpl()
        expect(o.eStaticClass()).toBe(getEcorePackage().getEClassifierClass())
    })

    test("getClassifierID", () => {
        let o = new EClassifierImpl()
        // get default value
        expect(o.classifierID).toBe(-1)
    })

    test("setClassifierID", () => {
        let o = new EClassifierImpl()
        let value = 45

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.classifierID = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe(-1)
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getDefaultValue", () => {
        let o = new EClassifierImpl()
        expect(() => o.defaultValue).toThrow(Error)
    })

    test("getEPackage", () => {
        // default
        let o = new EClassifierImpl()
        expect(o.ePackage).toBeNull()

        // set a mock container
        let mockContainer = mock<EObject>()
        let container = instance(mockContainer)
        o.eSetInternalContainer(container, EcoreConstants.ECLASSIFIER__EPACKAGE)

        // no proxy
        when(mockContainer.eIsProxy()).thenReturn(false)
        expect(o.ePackage).toBe(container)
        verify(mockContainer.eIsProxy()).once()
    })

    test("getInstanceClass", () => {
        let o = new EClassifierImpl()
        // get default value
        expect(o.instanceClass).toBe(null)
    })

    test("setInstanceClass", () => {
        let o = new EClassifierImpl()
        let value = null

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.instanceClass = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBeNull()
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getInstanceClassName", () => {
        let o = new EClassifierImpl()
        // get default value
        expect(o.instanceClassName).toBe("")
    })

    test("setInstanceClassName", () => {
        let o = new EClassifierImpl()
        let value = "Test String"

        // add listener
        let mockAdapter = mock<EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.instanceClassName = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe("")
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getInstanceTypeName", () => {
        let o = new EClassifierImpl()
        expect(() => o.instanceTypeName).toThrow(Error)
    })

    test("setInstanceTypeName", () => {
        let o = new EClassifierImpl()
        let value = "Test String"
        expect(() => (o.instanceTypeName = value)).toThrow(Error)
    })

    test("isInstance", () => {
        let o = new EClassifierImpl()
        expect(() => o.isInstance(null)).toThrow(Error)
    })

    test("eGetFromID", () => {
        let o = new EClassifierImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, true)).toStrictEqual(o.classifierID)
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__DEFAULT_VALUE, true)).toThrow(Error)
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__DEFAULT_VALUE, false)).toThrow(Error)
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__EPACKAGE, true)).toStrictEqual(o.ePackage)
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, true)).toStrictEqual(o.instanceClass)
        expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, true)).toStrictEqual(o.instanceClassName)
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME, true)).toThrow(Error)
        expect(() => o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME, false)).toThrow(Error)
    })

    test("eSetFromID", () => {
        let o = new EClassifierImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            let value = 45
            o.eSetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, value)
            expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, false)).toBe(value)
        }
        {
            let value = null
            o.eSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, value)
            expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, false)).toBe(value)
        }
        {
            let value = "Test String"
            o.eSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, value)
            expect(o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, false)).toBe(value)
        }
        expect(() => o.eSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME, null)).toThrow(Error)
    })

    test("eIsSetFromID", () => {
        let o = new EClassifierImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID)).toBeFalsy()
        expect(() => o.eIsSetFromID(EcoreConstants.ECLASSIFIER__DEFAULT_VALUE)).toThrow(Error)
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__EPACKAGE)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME)).toBeFalsy()
        expect(() => o.eIsSetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME)).toThrow(Error)
    })

    test("eUnsetFromID", () => {
        let o = new EClassifierImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID)
            let v = o.eGetFromID(EcoreConstants.ECLASSIFIER__CLASSIFIER_ID, false)
            expect(v).toBe(-1)
        }
        {
            o.eUnsetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS)
            let v = o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS, false)
            expect(v).toBeNull()
        }
        {
            o.eUnsetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME)
            let v = o.eGetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_CLASS_NAME, false)
            expect(v).toBe("")
        }
        {
            expect(() => o.eUnsetFromID(EcoreConstants.ECLASSIFIER__INSTANCE_TYPE_NAME)).toThrow(Error)
        }
    })

    test("eInvokeFromID", () => {
        let o = new EClassifierImpl()
        expect(() => o.eInvokeFromID(-1, null)).toThrow(Error)
        expect(() => o.eInvokeFromID(EcoreConstants.ECLASSIFIER__IS_INSTANCE_EJAVAOBJECT, null)).toThrow(Error)
    })

    test("eBasicInverseAdd", () => {
        let o = new EClassifierImpl()
        {
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockNotifications = mock<ENotificationChain>()
            let notifications = instance(mockNotifications)
            expect(o.eBasicInverseAdd(object, -1, notifications)).toBe(notifications)
        }
        {
            let mockValue = mock<EPackageInternal>()
            let value = instance(mockValue)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eIsProxy()).thenReturn(false)
            o.eBasicInverseAdd(value, EcoreConstants.ECLASSIFIER__EPACKAGE, null)
            expect(o.ePackage).toBe(value)

            reset(mockValue)
            let mockOther = mock<EPackageInternal>()
            let other = instance(mockOther)
            when(mockOther.eResource()).thenReturn(null)
            when(mockOther.eIsProxy()).thenReturn(false)
            when(mockValue.eResource()).thenReturn(null)
            when(mockValue.eInverseRemove(o, EcoreConstants.EPACKAGE__ECLASSIFIERS, null)).thenReturn(null)
            o.eBasicInverseAdd(other, EcoreConstants.ECLASSIFIER__EPACKAGE, null)
            expect(o.ePackage).toBe(other)
        }
    })

    test("eBasicInverseRemove", () => {
        let o = new EClassifierImpl()
        {
            let mockObject = mock<EObject>()
            let object = instance(mockObject)
            let mockNotifications = mock<ENotificationChain>()
            let notifications = instance(mockNotifications)
            expect(o.eBasicInverseRemove(object, -1, notifications)).toBe(notifications)
        }
        {
            let mockValue = mock<EPackageInternal>()
            let value = instance(mockValue)
            o.eBasicInverseRemove(value, EcoreConstants.ECLASSIFIER__EPACKAGE, null)
        }
    })
})
