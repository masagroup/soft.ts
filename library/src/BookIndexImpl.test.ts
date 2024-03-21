// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import deepEqual from "deep-equal"
import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito"
import * as ecore from "@masagroup/ecore"
import { BookIndexImpl, LibraryConstants, getLibraryPackage } from "./internal"

describe("BookIndexImpl", () => {
    test("eStaticClass", () => {
        let o = new BookIndexImpl()
        expect(o.eStaticClass()).toBe(getLibraryPackage().getBookIndex())
    })

    test("getKey", () => {
        let o = new BookIndexImpl()
        // get default value
        expect(o.key).toBe("")
    })

    test("setKey", () => {
        let o = new BookIndexImpl()
        let value = "Test String"

        // add listener
        let mockAdapter = mock<ecore.EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.key = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe("")
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getValue", () => {
        let o = new BookIndexImpl()
        expect(o.value).not.toBeNull()
    })

    test("eGetFromID", () => {
        let o = new BookIndexImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(LibraryConstants.BOOK_INDEX__KEY, true)).toStrictEqual(o.key)
        expect(o.eGetFromID(LibraryConstants.BOOK_INDEX__VALUE, true)).toStrictEqual(o.value)
    })

    test("eSetFromID", () => {
        let o = new BookIndexImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            let value = "Test String"
            o.eSetFromID(LibraryConstants.BOOK_INDEX__KEY, value)
            expect(o.eGetFromID(LibraryConstants.BOOK_INDEX__KEY, false)).toBe(value)
        }
        {
            let l = new ecore.ImmutableEList<number>()
            o.eSetFromID(LibraryConstants.BOOK_INDEX__VALUE, l)
            expect(o.value.isEmpty()).toBeTruthy()
        }
    })

    test("eIsSetFromID", () => {
        let o = new BookIndexImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(LibraryConstants.BOOK_INDEX__KEY)).toBeFalsy()
        expect(o.eIsSetFromID(LibraryConstants.BOOK_INDEX__VALUE)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        let o = new BookIndexImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(LibraryConstants.BOOK_INDEX__KEY)
            let v = o.eGetFromID(LibraryConstants.BOOK_INDEX__KEY, false)
            expect(v).toBe("")
        }
        {
            o.eUnsetFromID(LibraryConstants.BOOK_INDEX__VALUE)
            let v = o.eGetFromID(LibraryConstants.BOOK_INDEX__VALUE, false)
            expect(v).not.toBeNull()
            let l = v as ecore.EList<number>
            expect(l.isEmpty()).toBeTruthy()
        }
    })
})
