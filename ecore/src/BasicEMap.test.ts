// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { BasicEMap, EMapEntry } from "./internal.js"

describe("BasicEMap", () => {
    test("constructor", () => {
        const m = new BasicEMap<string, string>()
        expect(m).not.toBeNull()
    })

    test("put", () => {
        const m = new BasicEMap<number, string>()
        m.put(2, "2")
        expect(m.toMap()).toEqual(new Map([[2, "2"]]))
    })

    test("getValue", () => {
        const m = new BasicEMap<number, string>()
        m.put(2, "2")
        expect(m.getValue(2)).toBe("2")
    })

    test("removeKey", () => {
        const m = new BasicEMap<number, string>()
        m.put(2, "2")
        expect(m.removeKey(-2)).toBeUndefined()
        expect(m.removeKey(2)).toBe("2")
        expect(m.getValue(2)).toBeUndefined()
        expect(m.removeKey(2)).toBeUndefined()
    })

    test("containsKey", () => {
        const m = new BasicEMap<number, string>()
        m.put(2, "2")
        expect(m.containsKey(2)).toBeTruthy()
        expect(m.containsKey(-2)).toBeFalsy()
    })

    test("containsValue", () => {
        const m = new BasicEMap<number, string>()
        m.put(2, "2")
        expect(m.containsValue("2")).toBeTruthy()
        expect(m.containsValue("-2")).toBeFalsy()
    })

    test("addEntry", () => {
        const m = new BasicEMap<number, string>()
        const mockEntry = mock<EMapEntry<number, string>>()
        const entry = instance(mockEntry)
        when(mockEntry.getKey()).thenReturn(2)
        when(mockEntry.getValue()).thenReturn("2")
        m.add(entry)
        expect(m.toMap()).toEqual(new Map([[2, "2"]]))
    })

    test("setEntry", () => {
        const m = new BasicEMap<number, string>()
        const mockEntry1 = mock<EMapEntry<number, string>>()
        const entry1 = instance(mockEntry1)
        when(mockEntry1.getKey()).thenReturn(2)
        when(mockEntry1.getValue()).thenReturn("2")
        m.add(entry1)

        const mockEntry2 = mock<EMapEntry<number, string>>()
        const entry2 = instance(mockEntry2)
        when(mockEntry2.getKey()).thenReturn(3)
        when(mockEntry2.getValue()).thenReturn("3")
        m.set(0, entry2)

        expect(m.toMap()).toEqual(new Map([[3, "3"]]))
    })

    test("updateEntry", () => {
        const m = new BasicEMap<number, string>()
        m.put(2, "2")
        const e = m.get(0)
        e.setKey(2)
        e.setValue("2")
    })

    test("clear", () => {
        const m = new BasicEMap<number, string>()
        const mockEntry = mock<EMapEntry<number, string>>()
        const entry = instance(mockEntry)
        when(mockEntry.getKey()).thenReturn(2)
        when(mockEntry.getValue()).thenReturn("2")
        m.add(entry)

        m.clear()
        expect(m.toMap()).toEqual(new Map())
        expect(m.getValue(2)).toBeUndefined()
    })
})
