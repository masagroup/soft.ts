// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { anything, capture, instance, mock, verify } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { EAdapter, EStringToStringMapEntryImpl, EcoreConstants, getEcorePackage } from "./internal.js"

describe("EStringToStringMapEntryImpl", () => {
    test("eStaticClass", () => {
        const o = new EStringToStringMapEntryImpl()
        expect(o.eStaticClass()).toBe(getEcorePackage().getEStringToStringMapEntry())
    })

    test("getKey", () => {
        const o = new EStringToStringMapEntryImpl()
        // get default value
        expect(o.getKey()).toBe("")
    })

    test("setKey", () => {
        const o = new EStringToStringMapEntryImpl()
        const value = "Test String"

        // add listener
        const mockAdapter = mock<EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setKey(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBe("")
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getValue", () => {
        const o = new EStringToStringMapEntryImpl()
        // get default value
        expect(o.getValue()).toBe("")
    })

    test("setValue", () => {
        const o = new EStringToStringMapEntryImpl()
        const value = "Test String"

        // add listener
        const mockAdapter = mock<EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setValue(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBe("")
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("eGetFromID", () => {
        const o = new EStringToStringMapEntryImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__KEY, true)).toStrictEqual(o.getKey())
        expect(o.eGetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__VALUE, true)).toStrictEqual(o.getValue())
    })

    test("eSetFromID", () => {
        const o = new EStringToStringMapEntryImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            const value = "Test String"
            o.eSetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__KEY, value)
            expect(o.eGetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__KEY, false)).toBe(value)
        }
        {
            const value = "Test String"
            o.eSetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__VALUE, value)
            expect(o.eGetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__VALUE, false)).toBe(value)
        }
    })

    test("eIsSetFromID", () => {
        const o = new EStringToStringMapEntryImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__KEY)).toBeFalsy()
        expect(o.eIsSetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__VALUE)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        const o = new EStringToStringMapEntryImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__KEY)
            const v = o.eGetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__KEY, false)
            expect(v).toBe("")
        }
        {
            o.eUnsetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__VALUE)
            const v = o.eGetFromID(EcoreConstants.ESTRING_TO_STRING_MAP_ENTRY__VALUE, false)
            expect(v).toBe("")
        }
    })
})
