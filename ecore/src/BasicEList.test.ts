// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { BasicEList, ImmutableEList } from "./internal.js"

describe("BasicEList", () => {
    test("get", () => {
        const a = new BasicEList<number>([1, 2, 3, 4])
        expect(a.get(0)).toEqual(1)
        expect(a.get(1)).toEqual(2)
        expect(a.get(2)).toEqual(3)
        expect(a.get(3)).toEqual(4)
        expect(() => a.get(4)).toThrowError(RangeError)
    })

    test("size", () => {
        {
            const a = new BasicEList<number>()
            expect(a.size()).toEqual(0)
        }
        {
            const a = new BasicEList<number>([1, 2, 3, 4])
            expect(a.size()).toEqual(4)
        }
    })

    test("isEmpty", () => {
        {
            const a = new BasicEList<number>()
            expect(a.isEmpty()).toBeTruthy()
        }
        {
            const a = new BasicEList<number>([1, 2, 3, 4])
            expect(a.isEmpty()).toBeFalsy()
        }
    })

    test("add", () => {
        const a = new BasicEList<number>()
        expect(a.add(0)).toBeTruthy()
        expect(a.add(1)).toBeTruthy()
        expect(a.toArray()).toEqual([0, 1])
    })

    test("add_unique", () => {
        const a = new BasicEList<number>([], true)
        expect(a.add(0)).toBeTruthy()
        expect(a.add(0)).toBeFalsy()
        expect(a.toArray()).toEqual([0])
    })

    test("addAll", () => {
        const a = new BasicEList<number>([0, 1, 2])
        const b = new BasicEList<number>([3, 4, 5])
        expect(a.addAll(b)).toBeTruthy()
        expect(a.toArray()).toEqual([0, 1, 2, 3, 4, 5])
    })

    test("addAll_unique", () => {
        const a = new BasicEList<number>([0, 1, 2], true)
        const b = new BasicEList<number>([1, 2, 3])
        expect(a.addAll(b)).toBeTruthy()
        expect(a.toArray()).toEqual([0, 1, 2, 3])
        const c = new ImmutableEList<number>([0, 1, 2])
        expect(a.addAll(c)).toBeFalsy()
    })

    test("insert", () => {
        {
            const a = new BasicEList<number>()
            expect(a.insert(0, 0)).toBeTruthy()
            expect(a.toArray()).toEqual([0])
        }
        {
            const a = new BasicEList<number>([1])
            expect(a.insert(0, 0)).toBeTruthy()
            expect(a.toArray()).toEqual([0, 1])
        }
        {
            const a = new BasicEList<number>([1])
            expect(a.insert(1, 0)).toBeTruthy()
            expect(a.toArray()).toEqual([1, 0])
        }
    })

    test("insert_invalid_range", () => {
        const a = new BasicEList<number>()
        expect(() => a.insert(1, 0)).toThrowError(RangeError)
    })

    test("insert_unique", () => {
        const a = new BasicEList<number>([0, 1, 2], true)
        expect(a.insert(0, 2)).toBeFalsy()
    })

    test("insertAll", () => {
        const a = new BasicEList<number>([0, 1, 2])
        const b = new BasicEList<number>([3, 4, 5])
        expect(a.insertAll(0, b)).toBeTruthy()
        expect(a.toArray()).toEqual([3, 4, 5, 0, 1, 2])
    })

    test("insertAll_invalid_range", () => {
        const a = new BasicEList<number>()
        const b = new BasicEList<number>([3, 4, 5])
        expect(() => a.insertAll(1, b)).toThrowError(RangeError)
    })

    test("insertAll_unique", () => {
        const a = new BasicEList<number>([0, 1, 2], true)
        const b = new BasicEList<number>([1, 2, 3])
        expect(a.insertAll(0, b)).toBeTruthy()
        expect(a.toArray()).toEqual([3, 0, 1, 2])
        const c = new ImmutableEList<number>([0, 1, 2])
        expect(a.insertAll(0, c)).toBeFalsy()
    })

    test("remove", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(a.remove(1)).toBeTruthy()
        expect(a.toArray()).toEqual([0, 2])
        expect(a.remove(1)).toBeFalsy()
    })

    test("removeAt", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(a.removeAt(0)).toEqual(0)
        expect(a.toArray()).toEqual([1, 2])
    })

    test("removeAt_invalid_range", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(() => a.removeAt(3)).toThrowError(RangeError)
    })

    test("removeAll", () => {
        const a = new BasicEList<number>([0, 1, 2])
        const b = new BasicEList<number>([1, 2])
        expect(a.removeAll(b)).toBeTruthy()
        expect(a.toArray()).toEqual([0])
    })

    test("retainAll", () => {
        const a = new BasicEList<number>([0, 1, 2])
        const b = new BasicEList<number>([1, 2])
        expect(a.retainAll(b)).toBeTruthy()
        expect(a.toArray()).toEqual([1, 2])
    })

    test("set", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(a.set(0, 1)).toEqual(0)
        expect(a.toArray()).toEqual([1, 1, 2])
    })

    test("set_invalid_range", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(() => a.set(3, 1)).toThrowError(RangeError)
    })

    test("set_invalid_constraint", () => {
        const a = new BasicEList<number>([0, 1, 2], true)
        expect(() => a.set(0, 1)).toThrowError(Error)
    })

    test("indexOf", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(a.indexOf(1)).toEqual(1)
        expect(a.indexOf(3)).toEqual(-1)
    })

    test("clear", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(a.isEmpty()).toBeFalsy()
        a.clear()
        expect(a.isEmpty()).toBeTruthy()
    })

    test("contains", () => {
        const a = new BasicEList<number>([0, 1, 2])
        expect(a.contains(1)).toBeTruthy()
        expect(a.contains(3)).toBeFalsy()
    })

    test("iterator", () => {
        const a = new BasicEList<number>([3, 4, 5])
        const v: number[] = []
        for (const i of a) {
            v.push(i)
        }
        expect(a.toArray()).toEqual([3, 4, 5])
    })

    test("moveTo_invalid_range", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        expect(() => a.moveTo(1, 7)).toThrowError(RangeError)
    })

    test("moveTo_borders", () => {
        const a = new BasicEList<number>([2, 4])
        a.moveTo(0, 1)
        expect(a.toArray()).toEqual([4, 2])
    })

    test("moveTo_borders_inverse", () => {
        const a = new BasicEList<number>([2, 4])
        a.moveTo(1, 0)
        expect(a.toArray()).toEqual([4, 2])
    })

    test("moveTo_complex", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        a.moveTo(0, 3)
        expect(a.toArray()).toEqual([4, 6, 8, 2, 10])
    })

    test("moveTo_complex_end", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        a.moveTo(0, 4)
        expect(a.toArray()).toEqual([4, 6, 8, 10, 2])
    })

    test("moveTo_complex_inverse", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        a.moveTo(3, 1)
        expect(a.toArray()).toEqual([2, 8, 4, 6, 10])
    })

    test("moveTo_nop", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        expect(a.moveTo(1, 1)).toBe(4)
        expect(a.toArray()).toEqual([2, 4, 6, 8, 10])
    })

    test("move-before", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        a.move(3, 4)
        expect(a.toArray()).toEqual([2, 6, 8, 4, 10])
    })

    test("move-after", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        a.move(4, 4)
        expect(a.toArray()).toEqual([2, 6, 8, 10, 4])
    })

    test("move-end", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        a.move(0, 4)
        expect(a.toArray()).toEqual([4, 2, 6, 8, 10])
    })

    test("move-same", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        a.move(1, 4)
        expect(a.toArray()).toEqual([2, 4, 6, 8, 10])
    })

    test("move-invalid", () => {
        const a = new BasicEList<number>([2, 4, 6, 8, 10])
        expect(() => a.move(1, 5)).toThrowError(Error)
    })
})
