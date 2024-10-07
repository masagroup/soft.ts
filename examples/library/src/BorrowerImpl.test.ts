// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import deepEqual from "deep-equal"
import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito"
import * as ecore from "@masagroup/ecore"
import { BorrowerImpl, Lendable, LibraryConstants, Person, getLibraryPackage } from "./internal.js"

interface LendableInternal extends Lendable, ecore.EObjectInternal {}

describe("BorrowerImpl", () => {
    test("eStaticClass", () => {
        const o = new BorrowerImpl()
        expect(o.eStaticClass()).toBe(getLibraryPackage().getBorrower())
    })

    test("getBorrowed", () => {
        const o = new BorrowerImpl()
        expect(o.borrowed).not.toBeNull()
    })

    test("eGetFromID", () => {
        const o = new BorrowerImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(LibraryConstants.BORROWER__BORROWED, true)).toStrictEqual(o.borrowed)
        expect(
            deepEqual(
                o.eGetFromID(LibraryConstants.BORROWER__BORROWED, false),
                (o.borrowed as ecore.EObjectList<Lendable>).getUnResolvedList()
            )
        ).toBeTruthy()
    })

    test("eSetFromID", () => {
        const o = new BorrowerImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            // list with a value
            const mockValue = mock<LendableInternal>()
            const value = instance(mockValue)
            const l = new ecore.ImmutableEList<Lendable>([value])
            when(mockValue.eIsProxy()).thenReturn(false)
            when(mockValue.eClass()).thenReturn(null)
            when(mockValue.eStaticClass()).thenReturn(null)
            when(mockValue.eInverseAdd(o, LibraryConstants.LENDABLE__BORROWERS, anything())).thenReturn(null)

            // set list with new contents
            o.eSetFromID(LibraryConstants.BORROWER__BORROWED, l)
            // checks
            expect(o.borrowed.size()).toBe(1)
            expect(o.borrowed.get(0)).toBe(value)
            when(mockValue.eClass()).thenReturn(null)
            when(mockValue.eStaticClass()).thenReturn(null)
            verify(mockValue.eInverseAdd(o, LibraryConstants.LENDABLE__BORROWERS, anything())).once()
        }
    })

    test("eIsSetFromID", () => {
        const o = new BorrowerImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(LibraryConstants.BORROWER__BORROWED)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        const o = new BorrowerImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(LibraryConstants.BORROWER__BORROWED)
            const v = o.eGetFromID(LibraryConstants.BORROWER__BORROWED, false)
            expect(v).not.toBeNull()
            const l = v as ecore.EList<Lendable>
            expect(l.isEmpty()).toBeTruthy()
        }
    })

    test("eBasicInverseAdd", () => {
        const o = new BorrowerImpl()
        {
            const mockObject = mock<ecore.EObject>()
            const object = instance(mockObject)
            const mockNotifications = mock<ecore.ENotificationChain>()
            const notifications = instance(mockNotifications)
            expect(o.eBasicInverseAdd(object, -1, notifications)).toBe(notifications)
        }
        {
            const mockValue = mock<LendableInternal>()
            const value = instance(mockValue)
            o.eBasicInverseAdd(value, LibraryConstants.BORROWER__BORROWED, null)
            expect(o.borrowed.contains(value)).toBeTruthy()
        }
    })

    test("eBasicInverseRemove", () => {
        const o = new BorrowerImpl()
        {
            const mockObject = mock<ecore.EObject>()
            const object = instance(mockObject)
            const mockNotifications = mock<ecore.ENotificationChain>()
            const notifications = instance(mockNotifications)
            expect(o.eBasicInverseRemove(object, -1, notifications)).toBe(notifications)
        }
        {
            // initialize list with a mock object
            const mockValue = mock<LendableInternal>()
            const value = instance(mockValue)
            when(mockValue.eClass()).thenReturn(null)
            when(mockValue.eStaticClass()).thenReturn(null)
            when(mockValue.eInverseAdd(o, LibraryConstants.LENDABLE__BORROWERS, anything())).thenReturn(null)

            o.borrowed.add(value)

            // basic inverse remove
            o.eBasicInverseRemove(value, LibraryConstants.BORROWER__BORROWED, null)

            // check it was removed
            expect(o.borrowed.contains(value)).toBeFalsy()
        }
    })
})
