// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { AbstractEList } from "./AbstractEList";
import { Collection } from "./Collection";
import { List } from "./List";

export class BasicEList<E> extends AbstractEList<E> {
    protected _v: E[];

    constructor(iterable: Iterable<E> | ArrayLike<E> = [], isUnique: boolean = false) {
        super(isUnique);
        this._v = Array.from(iterable);
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
        if (from < 0 || from >= this.size() || to < 0 || to > this.size()) {
            throw new RangeError(
                "Index out of bounds: from=" + from + " to=" + to + " size=" + this.size()
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
        this.didSet(index, o, e);
        this.didChange();
        return o;
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
}
