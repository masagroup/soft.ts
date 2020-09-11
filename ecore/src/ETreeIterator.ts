// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EObject } from "./EObject";
import { EList } from "./EList";

export class ETreeIterator<O , T> implements IterableIterator<T> {
    private _obj: O;
    private _getChildrenIterator: (o: O) => Iterator<T>;
    private _data: Iterator<T>[];
    private _root: boolean;

    constructor(obj: O, root: boolean, getChildrenIterator: (o: O) => Iterator<T>) {
        this._getChildrenIterator = getChildrenIterator;
        this._root = root;
        this._obj = obj;
        this._data = null;
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    next(): IteratorResult<T> {
        if (this._data == null) {
            this._data = [this._getChildrenIterator(this._obj)];
            if (this._root) return { value: this._obj as any as T, done: false };
        }

        if (this._data.length == 0) return { value: undefined, done: true };

        let it = this._data[this._data.length - 1];
        let result = it.next();
        while (result.done) {
            this._data.pop();
            if (this._data.length == 0) return { value: undefined, done: true };
            it = this._data[this._data.length - 1];
            result = it.next();
        }

        it = this._getChildrenIterator(result.value);
        this._data.push(it);
        return result;
    }
}
