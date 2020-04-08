// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************
import test from "ava";
import { ArrayEList } from "./ArrayEList";

test("get", (t) => {
    var a = new ArrayEList<number>([1, 2, 3, 4]);
    t.is(a.get(0), 1);
    t.is(a.get(1), 2);
    t.is(a.get(2), 3);
    t.is(a.get(3), 4);
});

test("size", (t) => {
    {
        var a = new ArrayEList<number>();
        t.is(a.size(), 0);
    }
    {
        var a = new ArrayEList<number>([1, 2, 3, 4]);
        t.is(a.size(), 4);
    }
});

test("isEmpty", (t) => {
    {
        var a = new ArrayEList<number>();
        t.true(a.isEmpty());
    }
    {
        var a = new ArrayEList<number>([1, 2, 3, 4]);
        t.false(a.isEmpty());
    }
});

test("add", (t) => {
    var a = new ArrayEList<number>();
    t.true(a.add(0));
    t.true(a.add(1));
    t.deepEqual(a.toArray(), [0, 1]);
});

test("add_unique", (t) => {
    var a = new ArrayEList<number>([], true);
    t.true(a.add(0));
    t.false(a.add(0));
    t.deepEqual(a.toArray(), [0]);
});

test("addAll", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    var b = new ArrayEList<number>([3, 4, 5]);
    t.true(a.addAll(b));
    t.deepEqual(a.toArray(), [0, 1, 2, 3, 4, 5]);
});

test("addAll_unique", (t) => {
    var a = new ArrayEList<number>([0, 1, 2], true);
    var b = new ArrayEList<number>([1, 2, 3]);
    t.true(a.addAll(b));
    t.deepEqual(a.toArray(), [0, 1, 2, 3]);
});

test("insert", (t) => {
    {
        var a = new ArrayEList<number>();
        t.true(a.insert(0, 0));
        t.deepEqual(a.toArray(), [0]);
    }
    {
        var a = new ArrayEList<number>([1]);
        t.true(a.insert(0, 0));
        t.deepEqual(a.toArray(), [0, 1]);
    }
    {
        var a = new ArrayEList<number>([1]);
        t.true(a.insert(1, 0));
        t.deepEqual(a.toArray(), [1, 0]);
    }
});

test("insert_invalid_range", (t) => {
    var a = new ArrayEList<number>();
    t.throws(
        () => {
            a.insert(1, 0);
        },
        { instanceOf: RangeError }
    );
});

test("insert_unique", (t) => {
    var a = new ArrayEList<number>([0, 1, 2], true);
    t.false(a.insert(0, 2));
});

test("insertAll", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    var b = new ArrayEList<number>([3, 4, 5]);
    t.true(a.insertAll(0, b));
    t.deepEqual(a.toArray(), [3, 4, 5, 0, 1, 2]);
});

test("insertAll_unique", (t) => {
    var a = new ArrayEList<number>([0, 1, 2], true);
    var b = new ArrayEList<number>([1, 2, 3]);
    t.true(a.insertAll(0, b));
    t.deepEqual(a.toArray(), [3, 0, 1, 2]);
});

test("remove", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.true(a.remove(1));
    t.deepEqual(a.toArray(), [0, 2]);
    t.false(a.remove(1));
});

test("removeAt", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.is(a.removeAt(0), 0);
    t.deepEqual(a.toArray(), [1, 2]);
});

test("removeAt_invalid_range", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.throws(
        () => {
            a.removeAt(3);
        },
        { instanceOf: RangeError }
    );
});

test("removeAll", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    var b = new ArrayEList<number>([1, 2]);
    t.true(a.removeAll(b));
    t.deepEqual(a.toArray(), [0]);
});

test("retainAll", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    var b = new ArrayEList<number>([1, 2]);
    t.true(a.retainAll(b));
    t.deepEqual(a.toArray(), [1, 2]);
});

test("set", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.is(a.set(0, 1), 0);
    t.deepEqual(a.toArray(), [1, 1, 2]);
});

test("set_invalid_range", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.throws(
        () => {
            a.set(3, 1);
        },
        { instanceOf: RangeError }
    );
});

test("set_invalid_constraint", (t) => {
    var a = new ArrayEList<number>([0, 1, 2], true);
    t.throws(
        () => {
            a.set(0, 1);
        },
        { instanceOf: Error }
    );
});

test("indexOf", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.is(a.indexOf(1), 1);
    t.is(a.indexOf(3), -1);
});

test("clear", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.false(a.isEmpty());
    a.clear();
    t.true(a.isEmpty());
});

test("contains", (t) => {
    var a = new ArrayEList<number>([0, 1, 2]);
    t.true(a.contains(1));
    t.false(a.contains(3));
});

test("iterator", (t) => {
    var a = new ArrayEList<number>([3, 4, 5]);
    var v: number[] = [];
    for (const i of a) {
        v.push(i);
    }
    t.deepEqual(v, [3, 4, 5]);
});
