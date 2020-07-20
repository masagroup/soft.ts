// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************
import test from "ava";
import { ImmutableEList, getNonDuplicates } from "./ImmutableEList";

test("get", (t) => {
    let l = new ImmutableEList([1, 2]);
    t.is(l.get(0), 1);
    t.is(l.get(1), 2);
});

test("contains", (t) => {
    let l = new ImmutableEList([1, 2]);
    t.true(l.contains(1));
    t.false(l.contains(3));
});

test("indexOf", (t) => {
    let l = new ImmutableEList([1, 2]);
    t.is(l.indexOf(1), 0);
    t.is(l.indexOf(3), -1);
});

test("isEmpty", (t) => {
    t.true(new ImmutableEList().isEmpty());
    t.false(new ImmutableEList([1]).isEmpty());
});

test("toArray", (t) => {
    let l = new ImmutableEList([1, 2]);
    t.deepEqual(l.toArray(), [1, 2]);
});

test("size", (t) => {
    let l = new ImmutableEList([1, 2]);
    t.is(l.size(), 2);
});

test("insert", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.insert(0, null), { instanceOf: Error });
});

test("insertAll", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.insertAll(0, null), { instanceOf: Error });
});

test("removeAt", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.removeAt(0), { instanceOf: Error });
});

test("set", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.set(0, null), { instanceOf: Error });
});

test("add", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.add(null), { instanceOf: Error });
});

test("addAll", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.addAll(null), { instanceOf: Error });
});

test("clear", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.clear(), { instanceOf: Error });
});

test("remove", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.remove(null), { instanceOf: Error });
});

test("removeAll", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.removeAll(null), { instanceOf: Error });
});

test("retainAll", (t) => {
    let l = new ImmutableEList();
    t.throws(() => l.retainAll(null), { instanceOf: Error });
});

test("getNonDuplicates", (t) => {
    let l1 = new ImmutableEList([1, 2]);
    let l2 = new ImmutableEList([2, 3]);
    t.deepEqual(getNonDuplicates(l1, l2).toArray(), [3]);
});
