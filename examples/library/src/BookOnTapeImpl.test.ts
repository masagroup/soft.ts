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
import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito"
import * as ecore from "@masagroup/ecore"
import { AudioVisualItem, BookOnTapeImpl, LibraryConstants, Person, Writer, getLibraryPackage } from "./internal.js"

interface PersonInternal extends Person, ecore.EObjectInternal {}
interface WriterInternal extends Writer, ecore.EObjectInternal {}

describe("BookOnTapeImpl", () => {
    test("eStaticClass", () => {
        let o = new BookOnTapeImpl()
        expect(o.eStaticClass()).toBe(getLibraryPackage().getBookOnTape())
    })

    test("getAuthor", () => {
        let o = new BookOnTapeImpl()

        // get default value
        expect(o.author).toBeNull()

        // initialize object with a mock value
        let mockValue = mock<WriterInternal>()
        let value = instance(mockValue)
        o.author = value

        // events
        let mockAdapter = mock<ecore.EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set object resource
        let mockResourceSet = mock<ecore.EResourceSet>()
        let resourceSet = instance(mockResourceSet)
        let mockResource = mock<ecore.EResource>()
        let resource = instance(mockResource)
        o.eSetInternalResource(resource)

        // get non resolved value
        when(mockValue.eIsProxy()).thenReturn(false)
        expect(o.author).toBe(value)
        verify(mockValue.eIsProxy()).once()

        // get a resolved value
        let mockURI = new ecore.URI("test:///uri")
        let mockResolved = mock<WriterInternal>()
        let resolved = instance(mockResolved)
        when(mockResolved.eProxyURI()).thenReturn(null)
        when(mockResource.eResourceSet()).thenReturn(resourceSet)
        when(mockResourceSet.getEObject(mockURI, true)).thenReturn(resolved)
        when(mockValue.eIsProxy()).thenReturn(true)
        when(mockValue.eProxyURI()).thenReturn(mockURI)
        expect(o.author).toBe(resolved)
    })

    test("setAuthor", () => {
        let o = new BookOnTapeImpl()
        let mockValue = mock<WriterInternal>()
        let value = instance(mockValue)

        // add listener
        let mockAdapter = mock<ecore.EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.author = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBeNull()
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getReader", () => {
        let o = new BookOnTapeImpl()

        // get default value
        expect(o.reader).toBeNull()

        // initialize object with a mock value
        let mockValue = mock<PersonInternal>()
        let value = instance(mockValue)
        o.reader = value

        // events
        let mockAdapter = mock<ecore.EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set object resource
        let mockResourceSet = mock<ecore.EResourceSet>()
        let resourceSet = instance(mockResourceSet)
        let mockResource = mock<ecore.EResource>()
        let resource = instance(mockResource)
        o.eSetInternalResource(resource)

        // get non resolved value
        when(mockValue.eIsProxy()).thenReturn(false)
        expect(o.reader).toBe(value)
        verify(mockValue.eIsProxy()).once()

        // get a resolved value
        let mockURI = new ecore.URI("test:///uri")
        let mockResolved = mock<PersonInternal>()
        let resolved = instance(mockResolved)
        when(mockResolved.eProxyURI()).thenReturn(null)
        when(mockResource.eResourceSet()).thenReturn(resourceSet)
        when(mockResourceSet.getEObject(mockURI, true)).thenReturn(resolved)
        when(mockValue.eIsProxy()).thenReturn(true)
        when(mockValue.eProxyURI()).thenReturn(mockURI)
        expect(o.reader).toBe(resolved)
    })

    test("setReader", () => {
        let o = new BookOnTapeImpl()
        let mockValue = mock<PersonInternal>()
        let value = instance(mockValue)

        // add listener
        let mockAdapter = mock<ecore.EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.reader = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBeNull()
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("eGetFromID", () => {
        let o = new BookOnTapeImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(LibraryConstants.BOOK_ON_TAPE__AUTHOR, true)).toStrictEqual(o.author)
        expect(o.eGetFromID(LibraryConstants.BOOK_ON_TAPE__READER, true)).toStrictEqual(o.reader)
    })

    test("eSetFromID", () => {
        let o = new BookOnTapeImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            let mockValue = mock<WriterInternal>()
            let value = instance(mockValue)
            o.eSetFromID(LibraryConstants.BOOK_ON_TAPE__AUTHOR, value)
            expect(o.eGetFromID(LibraryConstants.BOOK_ON_TAPE__AUTHOR, false)).toBe(value)
        }
        {
            let mockValue = mock<PersonInternal>()
            let value = instance(mockValue)
            o.eSetFromID(LibraryConstants.BOOK_ON_TAPE__READER, value)
            expect(o.eGetFromID(LibraryConstants.BOOK_ON_TAPE__READER, false)).toBe(value)
        }
    })

    test("eIsSetFromID", () => {
        let o = new BookOnTapeImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(LibraryConstants.BOOK_ON_TAPE__AUTHOR)).toBeFalsy()
        expect(o.eIsSetFromID(LibraryConstants.BOOK_ON_TAPE__READER)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        let o = new BookOnTapeImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(LibraryConstants.BOOK_ON_TAPE__AUTHOR)
            expect(o.eGetFromID(LibraryConstants.BOOK_ON_TAPE__AUTHOR, false)).toBeNull()
        }
        {
            o.eUnsetFromID(LibraryConstants.BOOK_ON_TAPE__READER)
            expect(o.eGetFromID(LibraryConstants.BOOK_ON_TAPE__READER, false)).toBeNull()
        }
    })
})
