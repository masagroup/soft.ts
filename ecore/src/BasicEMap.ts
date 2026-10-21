// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BasicEList, EMap, EMapEntry } from "./internal.js"
import { EMapIndex } from "./EMapIndex.js"

class BasicEMapEntry<K, V> implements EMapEntry<K, V> {
    private _key: K
    private _value: V

    constructor(key: K, value: V) {
        this._key = key
        this._value = value
    }

    getKey(): K {
        return this._key
    }

    setKey(newKey: K) {
        this._key = newKey
    }

    getValue(): V {
        return this._value
    }

    setValue(newValue: V) {
        this._value = newValue
    }
}

export class BasicEMap<K, V> extends BasicEList<EMapEntry<K, V>> implements EMap<K, V> {
    private _index = new EMapIndex<K, EMapEntry<K, V>>(() => this)

    constructor() {
        super([], true)
    }

    put(key: K, value: V): void {
        const e = this.getEntry(key)
        if (e) {
            e.setValue(value)
        } else {
            // a new entry is not in the list: no duplicate scan
            this.addUnique(this.newEntry(key, value))
        }
    }

    getValue(key: K): V {
        return this.getEntry(key)?.getValue()
    }

    removeKey(key: K): V {
        const e = this.getEntry(key)
        if (e) {
            this.remove(e)
            return e.getValue()
        }
        return undefined
    }

    containsKey(key: K): boolean {
        return this.getEntry(key) !== undefined
    }

    containsValue(value: V): boolean {
        for (const e of this) {
            if (e.getValue() == value) {
                return true
            }
        }
        return false
    }

    toMap(): Map<K, V> {
        const m = new Map<K, V>()
        for (const e of this._index.values()) {
            m.set(e.getKey(), e.getValue())
        }
        return m
    }

    private getEntry(key: K): EMapEntry<K, V> {
        return this._index.get(key)
    }

    protected newEntry(key: K, value: V): EMapEntry<K, V> {
        return new BasicEMapEntry<K, V>(key, value)
    }

    protected didAdd(index: number, e: EMapEntry<K, V>): void {
        this._index.add(e)
    }

    protected didRemove(index: number, e: EMapEntry<K, V>): void {
        this._index.remove(e)
    }

    protected didClear(elements: EMapEntry<K, V>[]): void {
        this._index.clear()
    }

    protected didSet(index: number, newE: EMapEntry<K, V>, oldE: EMapEntry<K, V>): void {
        this._index.remove(oldE)
        this._index.add(newE)
    }
}
