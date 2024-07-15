// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { ImmutableEList, getNonDuplicates } from "./internal.js"

describe("ImmutableEList", () => {
    test("get", () => {
        let l = new ImmutableEList([1, 2])
        expect(l.get(0)).toBe(1)
        expect(l.get(1)).toBe(2)
    })

    test("contains", () => {
        let l = new ImmutableEList([1, 2])
        expect(l.contains(1)).toBeTruthy()
        expect(l.contains(3)).toBeFalsy()
    })

    test("indexOf", () => {
        let l = new ImmutableEList([1, 2])
        expect(l.indexOf(1)).toBe(0)
        expect(l.indexOf(3)).toBe(-1)
    })

    test("isEmpty", () => {
        expect(new ImmutableEList().isEmpty()).toBeTruthy()
        expect(new ImmutableEList([1]).isEmpty()).toBeFalsy()
    })

    test("toArray", () => {
        let l = new ImmutableEList([1, 2])
        expect(l.toArray()).toEqual([1, 2])
    })

    test("size", () => {
        let l = new ImmutableEList([1, 2])
        expect(l.size()).toBe(2)
    })

    test("insert", () => {
        let l = new ImmutableEList()
        expect(() => l.insert(0, null)).toThrowError(Error)
    })

    test("insertAll", () => {
        let l = new ImmutableEList()
        expect(() => l.insertAll(0, null)).toThrowError(Error)
    })

    test("removeAt", () => {
        let l = new ImmutableEList()
        expect(() => l.removeAt(0)).toThrowError(Error)
    })

    test("set", () => {
        let l = new ImmutableEList()
        expect(() => l.set(0, null)).toThrowError(Error)
    })

    test("add", () => {
        let l = new ImmutableEList()
        expect(() => l.add(null)).toThrowError(Error)
    })

    test("addAll", () => {
        let l = new ImmutableEList()
        expect(() => l.addAll(null)).toThrowError(Error)
    })

    test("clear", () => {
        let l = new ImmutableEList()
        expect(() => l.clear()).toThrowError(Error)
    })

    test("remove", () => {
        let l = new ImmutableEList()
        expect(() => l.remove(null)).toThrowError(Error)
    })

    test("removeAll", () => {
        let l = new ImmutableEList()
        expect(() => l.removeAll(null)).toThrowError(Error)
    })

    test("retainAll", () => {
        let l = new ImmutableEList()
        expect(() => l.retainAll(null)).toThrowError(Error)
    })

    test("getNonDuplicates", () => {
        let l1 = new ImmutableEList([1, 2])
        let l2 = new ImmutableEList([2, 3])
        expect(getNonDuplicates(l1, l2)).toEqual({ _v: [3] })
    })
})
