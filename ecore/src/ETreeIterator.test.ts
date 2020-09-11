// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { ImmutableEList } from "./ImmutableEList";
import { mock, instance, when } from "ts-mockito";
import { EObject } from "./EObject";
import { ETreeIterator } from "./ETreeIterator";

test("iteratorWithRoot", (t) => {
    let emptyList = new ImmutableEList<EObject>();
    let mockObject = mock<EObject>();
    let object = instance<EObject>(mockObject);
    let it = new ETreeIterator<EObject, EObject>(object, true, function (
        o: EObject
    ): Iterator<EObject> {
        return emptyList[Symbol.iterator]();
    });
    t.deepEqual(it.next(), { value: object, done: false });
    t.deepEqual(it.next(), { value: undefined, done: true });
});

test("iteratorNoRoot", (t) => {
    let emptyList = new ImmutableEList<EObject>();
    let mockObject = mock<EObject>();
    let object = instance<EObject>(mockObject);
    let it = new ETreeIterator<EObject, EObject>(object, false, function (
        o: EObject
    ): Iterator<EObject> {
        return emptyList[Symbol.iterator]();
    });
    t.deepEqual(it.next(), { value: undefined, done: true });
});

test("iteratorWithRootIteration", (t) => {
    let emptyList = new ImmutableEList<EObject>();
    let mockObject = mock<EObject>();
    let object = instance<EObject>(mockObject);
    let it = new ETreeIterator<EObject, EObject>(object, true, function (
        o: EObject
    ): Iterator<EObject> {
        return emptyList[Symbol.iterator]();
    });
    t.deepEqual([...it], [object]);
});

test("iteratorEContents", (t) => {
    let emptyList = new ImmutableEList<EObject>();
    let mockObject = mock<EObject>();
    let mockChild1 = mock<EObject>();
    let mockChild2 = mock<EObject>();
    let mockGrandChild1 = mock<EObject>();
    let mockGrandChild2 = mock<EObject>();
    let object = instance<EObject>(mockObject);
    let child1 = instance<EObject>(mockChild1);
    let child2 = instance<EObject>(mockChild2);
    let grandChild1 = instance<EObject>(mockGrandChild1);
    let grandChild2 = instance<EObject>(mockGrandChild2);
    when(mockObject.eContents()).thenReturn(
        new ImmutableEList<EObject>([child1, child2])
    );
    when(mockChild1.eContents()).thenReturn(
        new ImmutableEList<EObject>([grandChild1, grandChild2])
    );
    when(mockChild2.eContents()).thenReturn(emptyList);
    when(mockGrandChild1.eContents()).thenReturn(emptyList);
    when(mockGrandChild2.eContents()).thenReturn(emptyList);

    let it = new ETreeIterator<EObject, EObject>(object, false, function (
        o: EObject
    ): Iterator<EObject> {
        return o.eContents()[Symbol.iterator]();
    });

    t.deepEqual([...it], [child1, grandChild1, grandChild2, child2]);
});
