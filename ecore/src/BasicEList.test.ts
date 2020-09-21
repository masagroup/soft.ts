// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { BasicEList } from "./BasicEList";

describe("BasicEList", () => {
    test("get", () => {
        let a = new BasicEList<number>([1, 2, 3, 4]);
        expect(a.get(0)).toEqual(1);
        expect(a.get(1)).toEqual(2);
        expect(a.get(2)).toEqual(3);
        expect(a.get(3)).toEqual(4);
    });

    test("size", () => {
        {
            let a = new BasicEList<number>();
            expect(a.size()).toEqual(0);
        }
        {
            let a = new BasicEList<number>([1, 2, 3, 4]);
            expect(a.size()).toEqual(4);
        }
    });

    test("isEmpty", () => {
        {
            let a = new BasicEList<number>();
            expect(a.isEmpty()).toBeTruthy();
        }
        {
            let a = new BasicEList<number>([1, 2, 3, 4]);
            expect(a.isEmpty()).toBeFalsy();
        }
    });

    test("add", () => {
        let a = new BasicEList<number>();
        expect(a.add(0)).toBeTruthy();
        expect(a.add(1)).toBeTruthy();
        expect(a.toArray()).toEqual([0, 1]);
    });

    test("add_unique", () => {
        let a = new BasicEList<number>([], true);
        expect(a.add(0)).toBeTruthy();
        expect(a.add(0)).toBeFalsy();
        expect(a.toArray()).toEqual([0]);
    });

    test("addAll", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        let b = new BasicEList<number>([3, 4, 5]);
        expect(a.addAll(b)).toBeTruthy();
        expect(a.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
    });

    test("addAll_unique", () => {
        let a = new BasicEList<number>([0, 1, 2], true);
        let b = new BasicEList<number>([1, 2, 3]);
        expect(a.addAll(b)).toBeTruthy();
        expect(a.toArray()).toEqual([0, 1, 2, 3]);
    });

    test("insert", () => {
        {
            let a = new BasicEList<number>();
            expect(a.insert(0, 0)).toBeTruthy();
            expect(a.toArray()).toEqual([0]);
        }
        {
            let a = new BasicEList<number>([1]);
            expect(a.insert(0, 0)).toBeTruthy();
            expect(a.toArray()).toEqual([0, 1]);
        }
        {
            let a = new BasicEList<number>([1]);
            expect(a.insert(1, 0)).toBeTruthy();
            expect(a.toArray()).toEqual([1, 0]);
        }
    });

    test("insert_invalid_range", () => {
        let a = new BasicEList<number>();
        expect(() => a.insert(1, 0)).toThrowError(RangeError);
    });

    test("insert_unique", () => {
        let a = new BasicEList<number>([0, 1, 2], true);
        expect(a.insert(0, 2)).toBeFalsy();
    });

    test("insertAll", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        let b = new BasicEList<number>([3, 4, 5]);
        expect(a.insertAll(0, b)).toBeTruthy();
        expect(a.toArray()).toEqual([3, 4, 5, 0, 1, 2]);
    });

    test("insertAll_unique", () => {
        let a = new BasicEList<number>([0, 1, 2], true);
        let b = new BasicEList<number>([1, 2, 3]);
        expect(a.insertAll(0, b)).toBeTruthy();
        expect(a.toArray()).toEqual([3, 0, 1, 2]);
    });

    test("remove", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(a.remove(1)).toBeTruthy();
        expect(a.toArray()).toEqual([0, 2]);
        expect(a.remove(1)).toBeFalsy();
    });

    test("removeAt", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(a.removeAt(0)).toEqual(0);
        expect(a.toArray()).toEqual([1, 2]);
    });

    test("removeAt_invalid_range", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(() => a.removeAt(3)).toThrowError(RangeError);
    });

    test("removeAll", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        let b = new BasicEList<number>([1, 2]);
        expect(a.removeAll(b)).toBeTruthy();
        expect(a.toArray()).toEqual([0]);
    });

    test("retainAll", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        let b = new BasicEList<number>([1, 2]);
        expect(a.retainAll(b)).toBeTruthy();
        expect(a.toArray()).toEqual([1, 2]);
    });

    test("set", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(a.set(0, 1)).toEqual(0);
        expect(a.toArray()).toEqual([1, 1, 2]);
    });

    test("set_invalid_range", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(() => a.set(3, 1)).toThrowError(RangeError);
    });

    test("set_invalid_constraint", () => {
        let a = new BasicEList<number>([0, 1, 2], true);
        expect(() => a.set(0, 1)).toThrowError(Error);
    });

    test("indexOf", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(a.indexOf(1)).toEqual(1);
        expect(a.indexOf(3)).toEqual(-1);
    });

    test("clear", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(a.isEmpty()).toBeFalsy();
        a.clear();
        expect(a.isEmpty()).toBeTruthy();
    });

    test("contains", () => {
        let a = new BasicEList<number>([0, 1, 2]);
        expect(a.contains(1)).toBeTruthy();
        expect(a.contains(3)).toBeFalsy();
    });

    test("iterator", () => {
        let a = new BasicEList<number>([3, 4, 5]);
        let v: number[] = [];
        for (const i of a) {
            v.push(i);
        }
        expect(a.toArray()).toEqual([3, 4, 5]);
    });
});
