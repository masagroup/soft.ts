// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BasicEObjectList, EClass, EMap, EMapEntry, EObject, EObjectInternal } from "./internal.js"

export class BasicEObjectMap<K, V> extends BasicEObjectList<EMapEntry<K, V> & EObject> implements EMap<K, V> {
    private _entryClass: EClass
    private _mapData: Map<K, V> = new Map<K, V>()

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
            this.add(this.newEntry(key, value))
        }
        this._mapData.set(key, value)
    }

    getValue(key: K): V {
        return this._mapData.get(key)
    }

    removeKey(key: K): V {
        this._mapData.delete(key)
        const e = this.getEntry(key)
        if (e) {
            this.remove(e)
            return e.getValue()
        }
        return undefined
    }

    containsKey(key: K): boolean {
        return this._mapData.has(key)
    }

    containsValue(value: V): boolean {
        for (const [_, v] of this._mapData) {
            if (v == value) {
                return true
            }
        }
        return false
    }

    toMap(): Map<K, V> {
        return this._mapData
    }

    private getEntry(key: K): (EMapEntry<K, V> & EObject) | undefined {
        for (const entry of this) {
            if (entry.getKey() == key) {
                return entry
            }
        }
        return undefined
    }

    protected newEntry(key: K, value: V): EMapEntry<K, V> & EObject {
        const eFactory = this._entryClass.getEPackage().getEFactoryInstance()
        const eEntry = eFactory.create(this._entryClass) as any as EMapEntry<K, V> & EObject
        eEntry.setKey(key)
        eEntry.setValue(value)
        return eEntry
    }

    protected didAdd(index: number, e: EMapEntry<K, V> & EObject): void {
        this._mapData.set(e.getKey(), e.getValue())
        super.didAdd(index, e)
    }

    protected didRemove(index: number, e: EMapEntry<K, V> & EObject): void {
        this._mapData.delete(e.getKey())
        super.didRemove(index, e)
    }

    protected didClear(elements: (EMapEntry<K, V> & EObject)[]): void {
        this._mapData.clear()
        super.didClear(elements)
    }

    protected didSet(index: number, newE: EMapEntry<K, V> & EObject, oldE: EMapEntry<K, V> & EObject): void {
        this._mapData.delete(oldE.getKey())
        this._mapData.set(newE.getKey(), newE.getValue())
        super.didSet(index, newE, oldE)
    }
}
