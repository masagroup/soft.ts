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

export class ArrayEList<E> implements EList<E> {
    private _v: E[];
    private _isUnique: boolean;

    constructor(v: E[] = [], isUnique: boolean = false) {
        this._v = v;
        this._isUnique = isUnique;
    }

    add(e: E): boolean {
        if (this._isUnique && this.contains(e)) return false;

        this.doAdd(e);
        return true;
    }

    addAll(c: Collection<E>): boolean {
        if (this._isUnique) {
            c = this.getNonDuplicates(c);
            if (c.isEmpty()) return false;
        }
        this.doAddAll(c);
        return true;
    }

    insert(index: number, e: E): boolean {
        if (index < 0 || index > this._v.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this._v.length);
        if (this._isUnique && this.contains(e)) return false;
        this.doInsert(index, e);
        return true;
    }

    insertAll(index: number, c: Collection<E>): boolean {
        if (index < 0 || index > this._v.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this._v.length);
        if (this._isUnique) {
            c = this.getNonDuplicates(c);
            if (c.isEmpty()) return false;
        }
        this.doInsertAll(index, c);
        return true;
    }

    remove(e: E): boolean {
        var index = this.indexOf(e);
        if (index == -1) return false;
        this.removeAt(index);
        return true;
    }

    removeAt(index: number): E {
        if (index < 0 || index >= this._v.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this._v.length);
        var e = this._v[index];
        this._v.splice(index, 1);
        this.didRemove(index, e);
        this.didChange();
        return e;
    }

    removeAll(c: Collection<E>): boolean {
        var modified = false;
        for (let i = this.size(); --i >= 0; ) {
            if (c.contains(this._v[i])) {
                this.removeAt(i);
                modified = true;
            }
        }
        return modified;
    }

    retainAll(c: Collection<E>): boolean {
        var modified = false;
        for (let i = this.size(); --i >= 0; ) {
            if (!c.contains(this._v[i])) {
                this.removeAt(i);
                modified = true;
            }
        }
        return modified;
    }

    get(index: number): E {
        if (index < 0 || index >= this._v.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this._v.length);
        return this._v[index];
    }

    set(index: number, e: E): E {
        if (index < 0 || index >= this._v.length)
            throw new RangeError("Index out of bounds: index=" + index + " size=" + this._v.length);
        if (this._isUnique) {
            var currIndex = this.indexOf(e);
            if (currIndex >= 0 && currIndex != index)
                throw new Error("element already in list : uniqueness constraint is not respected");
        }
        return this.doSet(index, e);
    }

    indexOf(e: E): number {
        return this._v.indexOf(e);
    }

    clear(): void {
        this._v = [];
    }

    contains(e: E): boolean {
        return this._v.includes(e);
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

    protected getNonDuplicates(c: Collection<E>): Collection<E> {
        var l = new ArrayEList<E>();
        for (const e of c) {
            if (!l.contains(e) && !this.contains(e)) l.add(e);
        }
        return l;
    }

    protected doAdd(e: E): void {
        var size = this._v.length;
        this._v.push(e);
        this.didAdd(size, e);
        this.didChange();
    }

    protected doAddAll(c: Collection<E>): boolean {
        var oldSize = this._v.length;
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

    protected doSet(index: number, e: E): E {
        var o = this._v[index];
        this._v[index] = e;
        this.didSet(index, o, e);
        this.didChange();
        return o;
    }

    protected didAdd(index: number, e: E): void {}
    protected didRemove(index: number, e: E): void {}
    protected didSet(index: number, newE: E, oldE: E): void {}
    protected didChange(): void {}
}
