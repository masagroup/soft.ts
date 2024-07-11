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
import * as ecore from "@masagroup/ecore"
import { Item, LibraryConstants, PeriodicalImpl, getLibraryPackage } from "./internal.js"

describe("PeriodicalImpl", () => {
    test("eStaticClass", () => {
        let o = new PeriodicalImpl()
        expect(o.eStaticClass()).toBe(getLibraryPackage().getPeriodical())
    })

    test("getIssuesPerYear", () => {
        let o = new PeriodicalImpl()
        // get default value
        expect(o.issuesPerYear).toBe(0)
    })

    test("setIssuesPerYear", () => {
        let o = new PeriodicalImpl()
        let value = 45

        // add listener
        let mockAdapter = mock<ecore.EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.issuesPerYear = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe(0)
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("getTitle", () => {
        let o = new PeriodicalImpl()
        // get default value
        expect(o.title).toBe("")
    })

    test("setTitle", () => {
        let o = new PeriodicalImpl()
        let value = "Test String"

        // add listener
        let mockAdapter = mock<ecore.EAdapter>()
        let adapter = instance(mockAdapter)
        o.eAdapters.add(adapter)

        // set value
        o.title = value

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.notifier).toBe(o)
        expect(notification.oldValue).toBe("")
        expect(notification.newValue).toBe(value)
        expect(notification.position).toBe(-1)
    })

    test("eGetFromID", () => {
        let o = new PeriodicalImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(LibraryConstants.PERIODICAL__ISSUES_PER_YEAR, true)).toStrictEqual(o.issuesPerYear)
        expect(o.eGetFromID(LibraryConstants.PERIODICAL__TITLE, true)).toStrictEqual(o.title)
    })

    test("eSetFromID", () => {
        let o = new PeriodicalImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            let value = 45
            o.eSetFromID(LibraryConstants.PERIODICAL__ISSUES_PER_YEAR, value)
            expect(o.eGetFromID(LibraryConstants.PERIODICAL__ISSUES_PER_YEAR, false)).toBe(value)
        }
        {
            let value = "Test String"
            o.eSetFromID(LibraryConstants.PERIODICAL__TITLE, value)
            expect(o.eGetFromID(LibraryConstants.PERIODICAL__TITLE, false)).toBe(value)
        }
    })

    test("eIsSetFromID", () => {
        let o = new PeriodicalImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(LibraryConstants.PERIODICAL__ISSUES_PER_YEAR)).toBeFalsy()
        expect(o.eIsSetFromID(LibraryConstants.PERIODICAL__TITLE)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        let o = new PeriodicalImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(LibraryConstants.PERIODICAL__ISSUES_PER_YEAR)
            let v = o.eGetFromID(LibraryConstants.PERIODICAL__ISSUES_PER_YEAR, false)
            expect(v).toBe(0)
        }
        {
            o.eUnsetFromID(LibraryConstants.PERIODICAL__TITLE)
            let v = o.eGetFromID(LibraryConstants.PERIODICAL__TITLE, false)
            expect(v).toBe("")
        }
    })
})
