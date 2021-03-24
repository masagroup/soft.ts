// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

export class ETreeIterator<O, T> implements IterableIterator<T> {
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
        if (!this._data) {
            this._data = [this._getChildrenIterator(this._obj)];
            if (this._root) return { value: (this._obj as any) as T, done: false };
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
