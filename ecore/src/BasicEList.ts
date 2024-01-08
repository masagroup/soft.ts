// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { AbstractEList, Collection } from "./internal";

export class BasicEList<E> extends AbstractEList<E> {
    protected _v: E[];

    constructor(iterable: Iterable<E> | ArrayLike<E> = [], isUnique: boolean = false) {
        super(isUnique);
        this._v = Array.from(iterable);
    }

    clear(): void {
        this.doClear();
    }

    removeAt(index: number): E {
        if (index < 0 || index >= this._v.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this._v.length);
        let e = this._v[index];
        this._v.splice(index, 1);
        this.didRemove(index, e);
        this.didChange();
        return e;
    }

    moveTo(from: number, to: number): E {
        return this.doMove(from, to);
    }

    size(): number {
        return this._v.length;
    }

    toArray(): E[] {
        return this._v;
    }

    protected doGet(index: number): E {
        return this._v[index];
    }

    protected doSet(index: number, e: E): E {
        let o = this._v[index];
        this._v[index] = e;
        this.didSet(index, e, o);
        this.didChange();
        return o;
    }

    protected doClear(): E[] {
        let oldData = this._v;
        this._v = [];
        this.didClear(oldData);
        return oldData;
    }

    protected doAdd(e: E): void {
        let size = this._v.length;
        this._v.push(e);
        this.didAdd(size, e);
        this.didChange();
    }

    protected doAddAll(c: Collection<E>): boolean {
        let oldSize = this._v.length;
        this._v.push(...c.toArray());
        for (let i = oldSize; i < this._v.length; i++) {
            this.didAdd(i, this._v[i]);
            this.didChange();
        }
        return !c.isEmpty();
    }

    protected doInsert(index: number, e: E): void {
        this._v.splice(index, 0, e);
        this.didAdd(index, e);
        this.didChange();
    }

    protected doInsertAll(index: number, c: Collection<E>): boolean {
        this._v.splice(index, 0, ...c.toArray());
        for (let i = index; i < index + c.size(); i++) {
            this.didAdd(i, this._v[i]);
            this.didChange();
        }
        return !c.isEmpty();
    }

    protected doMove(from: number, to: number): E {
        if (from < 0 || from >= this.size() || to < 0 || to > this.size()) {
            throw new RangeError(
                "Index out of bounds: from=" + from + " to=" + to + " size=" + this.size(),
            );
        }
        let e = this._v[from];
        if (from != to) {
            this._v.splice(from, 1);
            this._v.splice(to, 0, e);
            this.didMove(from, to, e);
            this.didChange();
        }
        return e;
    }
}
