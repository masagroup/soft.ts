// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { Collection, EList } from "./internal"

export class ImmutableEList<E> implements EList<E> {
    protected _v: E[]

    constructor(v: E[] = []) {
        this._v = v
    }

    get(index: number): E {
        return this._v[index]
    }

    contains(e: E): boolean {
        return this._v.indexOf(e) != -1
    }

    indexOf(e: E): number {
        return this._v.indexOf(e)
    }

    isEmpty(): boolean {
        return this._v.length == 0
    }

    size(): number {
        return this._v.length
    }

    toArray(): E[] {
        return this._v
    }

    [Symbol.iterator](): Iterator<E, any, undefined> {
        return this._v[Symbol.iterator]()
    }

    insert(index: number, e: E): boolean {
        throw new Error("Immutable list can't be modified")
    }

    insertAll(index: number, c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified")
    }

    removeAt(index: number): E {
        throw new Error("Immutable list can't be modified")
    }

    set(index: number, e: E): E {
        throw new Error("Immutable list can't be modified")
    }

    add(e: E): boolean {
        throw new Error("Immutable list can't be modified")
    }

    addAll(c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified")
    }

    clear(): void {
        throw new Error("Immutable list can't be modified")
    }

    remove(e: E): boolean {
        throw new Error("Immutable list can't be modified")
    }

    removeAll(c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified")
    }

    retainAll(c: Collection<E>): boolean {
        throw new Error("Immutable list can't be modified")
    }

    move(to: number, e: E): void {
        throw new Error("Immutable list can't be modified")
    }
    moveTo(from: number, to: number): E {
        throw new Error("Immutable list can't be modified")
    }
}

export function getNonDuplicates<E>(c: Collection<E>, ref: Collection<E>): Collection<E> {
    let s = new Set<E>(ref)
    for (const e of c) {
        s.delete(e)
    }
    return new ImmutableEList<E>([...s])
}
