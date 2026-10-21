// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BasicEObjectList, EClass, EMap, EMapEntry, EObject, EObjectInternal, getClassFactory } from "./internal.js"
import { EMapIndex } from "./EMapIndex.js"

export class BasicEObjectMap<K, V> extends BasicEObjectList<EMapEntry<K, V> & EObject> implements EMap<K, V> {
    private _entryClass: EClass
    private _index = new EMapIndex<K, EMapEntry<K, V> & EObject>(() => this)

    constructor(
        entryClass: EClass,
        owner?: EObjectInternal,
        featureID: number = -1,
        inverseFeatureID: number = -1,
        unset: boolean = false
    ) {
        super(
            owner,
            featureID,
            inverseFeatureID,
            true, // containment
            true, // inverse
            inverseFeatureID != -1, // opposite
            false, // proxies
            unset // unset
        )
        this._entryClass = entryClass
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

    private getEntry(key: K): (EMapEntry<K, V> & EObject) | undefined {
        return this._index.get(key)
    }

    protected newEntry(key: K, value: V): EMapEntry<K, V> & EObject {
        const eFactory = getClassFactory(this.getNotifier(), this._entryClass)
        const eEntry = eFactory.create(this._entryClass) as any as EMapEntry<K, V> & EObject
        eEntry.setKey(key)
        eEntry.setValue(value)
        return eEntry
    }

    protected didAdd(index: number, e: EMapEntry<K, V> & EObject): void {
        this._index.add(e)
        super.didAdd(index, e)
    }

    protected didRemove(index: number, e: EMapEntry<K, V> & EObject): void {
        this._index.remove(e)
        super.didRemove(index, e)
    }

    protected didClear(elements: (EMapEntry<K, V> & EObject)[]): void {
        this._index.clear()
        super.didClear(elements)
    }

    protected didSet(index: number, newE: EMapEntry<K, V> & EObject, oldE: EMapEntry<K, V> & EObject): void {
        this._index.remove(oldE)
        this._index.add(newE)
        super.didSet(index, newE, oldE)
    }
}
