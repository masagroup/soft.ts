// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BasicEList, EMap, EMapEntry } from "./internal";

class BasicEMapEntry<K, V> implements EMapEntry<K, V> {
    private _key: K;
    private _value: V;

    constructor(key: K, value: V) {
        this._key = key;
        this._value = value;
    }

    get key(): K {
        return this._key;
    }

    set key(newKey: K) {
        this._key = newKey;
    }

    get value(): V {
        return this._value;
    }

    set value(newValue: V) {
        this._value = newValue;
    }
}

export class BasicEMap<K, V> extends BasicEList<EMapEntry<K, V>> implements EMap<K, V> {
    private _mapData: Map<K, V>;

    constructor() {
        super([], true);
        this._mapData = new Map<K, V>();
    }

    put(key: K, value: V): void {
        this._mapData.set(key, value);
        this.add(new BasicEMapEntry<K, V>(key, value));
    }

    getValue(key: K): V {
        return this._mapData.get(key);
    }

    removeKey(key: K): V {
        // remove from map data
        this._mapData.delete(key);
        // remove from list
        let e = this.getEntry(key);
        if (e) {
            this.remove(e);
            return e.value;
        }
        return undefined;
    }

    containsKey(key: K): boolean {
        return this._mapData.get(key) != undefined;
    }

    containsValue(value: V): boolean {
        for (let [_, v] of this._mapData) {
            if (v == value) {
                return true;
            }
        }
        return false;
    }

    toMap(): Map<K, V> {
        return this._mapData;
    }

    private getEntry(key: K): EMapEntry<K, V> {
        for (const entry of this) {
            if (entry.key == key) {
                return entry;
            }
        }
        return undefined;
    }

    protected newEntry(key: K, value: V) : EMapEntry<K,V> {
        return new BasicEMapEntry<K, V>(key, value);
    }

    protected didAdd(index: number, e: EMapEntry<K, V>): void {
        this._mapData.set(e.key, e.value);
    }

    protected didRemove(index: number, e: EMapEntry<K, V>): void {
        this._mapData.delete(e.key);
    }

    protected didClear(elements: EMapEntry<K, V>[]): void {
        this._mapData.clear();
    }

    protected didSet(index: number, newE: EMapEntry<K, V>, oldE: EMapEntry<K, V>): void {
        this._mapData.delete(oldE.key);
        this._mapData.set(newE.key, newE.value);
    }
}
