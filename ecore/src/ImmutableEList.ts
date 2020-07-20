// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { Collection } from "./Collection";
import { EList } from "./EList";

export class ImmutableEList<E> implements EList<E> {
    private _v: E[];

    constructor(v: E[] = []) {
        this._v = v;
    }

    get(index: number): E {
        return this._v[index];
    }

    contains(e: E): boolean {
        return this._v.indexOf(e) != -1;
    }

    indexOf(e: E): number {
        return this._v.indexOf(e);
    }

    isEmpty(): boolean {
        return this._v.length == 0;
    }

    size(): number {
        return this._v.length;
    }

    toArray(): E[] {
        return this._v;
    }

    [Symbol.iterator](): Iterator<E, any, undefined> {
        return this._v[Symbol.iterator]();
    }

    insert(index: number, e: E): boolean {
        throw new Error("Immutable list can't be modified");
    }

    insertAll(index: number, c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified");
    }

    removeAt(index: number): E {
        throw new Error("Immutable list can't be modified");
    }

    set(index: number, e: E): void {
        throw new Error("Immutable list can't be modified");
    }

    add(e: E): boolean {
        throw new Error("Immutable list can't be modified");
    }

    addAll(c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified");
    }

    clear(): void {
        throw new Error("Immutable list can't be modified");
    }

    remove(e: E): boolean {
        throw new Error("Immutable list can't be modified");
    }

    removeAll(c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified");
    }

    retainAll(c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified");
    }

    move(to: number, e: E): void {
        throw new Error("Immutable list can't be modified");
    }
    moveTo(to: number, from: number): E {
        throw new Error("Immutable list can't be modified");
    }
}
