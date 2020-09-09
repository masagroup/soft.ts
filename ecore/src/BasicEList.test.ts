// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************
import test from "ava";
import { BasicEList } from "./BasicEList";

test("get", (t) => {
    let a = new BasicEList<number>([1, 2, 3, 4]);
    t.is(a.get(0), 1);
    t.is(a.get(1), 2);
    t.is(a.get(2), 3);
    t.is(a.get(3), 4);
});

test("size", (t) => {
    {
        let a = new BasicEList<number>();
        t.is(a.size(), 0);
    }
    {
        let a = new BasicEList<number>([1, 2, 3, 4]);
        t.is(a.size(), 4);
    }
});

test("isEmpty", (t) => {
    {
        let a = new BasicEList<number>();
        t.true(a.isEmpty());
    }
    {
        let a = new BasicEList<number>([1, 2, 3, 4]);
        t.false(a.isEmpty());
    }
});

test("add", (t) => {
    let a = new BasicEList<number>();
    t.true(a.add(0));
    t.true(a.add(1));
    t.deepEqual(a.toArray(), [0, 1]);
});

test("add_unique", (t) => {
    let a = new BasicEList<number>([], true);
    t.true(a.add(0));
    t.false(a.add(0));
    t.deepEqual(a.toArray(), [0]);
});

test("addAll", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    let b = new BasicEList<number>([3, 4, 5]);
    t.true(a.addAll(b));
    t.deepEqual(a.toArray(), [0, 1, 2, 3, 4, 5]);
});

test("addAll_unique", (t) => {
    let a = new BasicEList<number>([0, 1, 2], true);
    let b = new BasicEList<number>([1, 2, 3]);
    t.true(a.addAll(b));
    t.deepEqual(a.toArray(), [0, 1, 2, 3]);
});

test("insert", (t) => {
    {
        let a = new BasicEList<number>();
        t.true(a.insert(0, 0));
        t.deepEqual(a.toArray(), [0]);
    }
    {
        let a = new BasicEList<number>([1]);
        t.true(a.insert(0, 0));
        t.deepEqual(a.toArray(), [0, 1]);
    }
    {
        let a = new BasicEList<number>([1]);
        t.true(a.insert(1, 0));
        t.deepEqual(a.toArray(), [1, 0]);
    }
});

test("insert_invalid_range", (t) => {
    let a = new BasicEList<number>();
    t.throws(() => a.insert(1, 0), { instanceOf: RangeError });
});

test("insert_unique", (t) => {
    let a = new BasicEList<number>([0, 1, 2], true);
    t.false(a.insert(0, 2));
});

test("insertAll", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    let b = new BasicEList<number>([3, 4, 5]);
    t.true(a.insertAll(0, b));
    t.deepEqual(a.toArray(), [3, 4, 5, 0, 1, 2]);
});

test("insertAll_unique", (t) => {
    let a = new BasicEList<number>([0, 1, 2], true);
    let b = new BasicEList<number>([1, 2, 3]);
    t.true(a.insertAll(0, b));
    t.deepEqual(a.toArray(), [3, 0, 1, 2]);
});

test("remove", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.true(a.remove(1));
    t.deepEqual(a.toArray(), [0, 2]);
    t.false(a.remove(1));
});

test("removeAt", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.is(a.removeAt(0), 0);
    t.deepEqual(a.toArray(), [1, 2]);
});

test("removeAt_invalid_range", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.throws(() => a.removeAt(3), { instanceOf: RangeError });
});

test("removeAll", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    let b = new BasicEList<number>([1, 2]);
    t.true(a.removeAll(b));
    t.deepEqual(a.toArray(), [0]);
});

test("retainAll", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    let b = new BasicEList<number>([1, 2]);
    t.true(a.retainAll(b));
    t.deepEqual(a.toArray(), [1, 2]);
});

test("set", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.is(a.set(0, 1), 0);
    t.deepEqual(a.toArray(), [1, 1, 2]);
});

test("set_invalid_range", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.throws(() => a.set(3, 1), { instanceOf: RangeError });
});

test("set_invalid_constraint", (t) => {
    let a = new BasicEList<number>([0, 1, 2], true);
    t.throws(() => a.set(0, 1), { instanceOf: Error });
});

test("indexOf", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.is(a.indexOf(1), 1);
    t.is(a.indexOf(3), -1);
});

test("clear", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.false(a.isEmpty());
    a.clear();
    t.true(a.isEmpty());
});

test("contains", (t) => {
    let a = new BasicEList<number>([0, 1, 2]);
    t.true(a.contains(1));
    t.false(a.contains(3));
});

test("iterator", (t) => {
    let a = new BasicEList<number>([3, 4, 5]);
    let v: number[] = [];
    for (const i of a) {
        v.push(i);
    }
    t.deepEqual(v, [3, 4, 5]);
});
