// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EMapEntry } from "./EMapEntry.js"

// key -> entry index of an EMap.
// values are read from the entries, so a value set directly on an entry (decoders
// resolving forward references) is seen. Entries added with a default key (null,
// undefined or "", the key is set after the entry is added) are pending and indexed
// on the next lookup miss. As in EMF, the key of an entry is not expected to change
// while the entry is in the map: such a change is detected only when the old key
// is looked up, which rebuilds the index.
export class EMapIndex<K, E extends EMapEntry<K, any>> {
    private _entries: Map<K, E> = new Map<K, E>()
    private _pending: Set<E> = new Set<E>()

    constructor(private _all: () => Iterable<E>) {}

    get(key: K): E | undefined {
        const e = this._entries.get(key)
        if (e) {
            if (e.getKey() === key) {
                return e
            }
            // key of the entry was modified directly
            this.rebuild()
            return this._entries.get(key)
        }
        if (this._pending.size > 0) {
            this.indexPending()
            return this._entries.get(key)
        }
        return undefined
    }

    add(e: E): void {
        const key = e.getKey()
        if (key === undefined || key === null || (key as any) === "") {
            this._pending.add(e)
        } else {
            this._entries.set(key, e)
        }
    }

    remove(e: E): void {
        if (!this._pending.delete(e)) {
            const key = e.getKey()
            if (this._entries.get(key) === e) {
                this._entries.delete(key)
            } else {
                this.rebuild(e)
            }
        }
    }

    clear(): void {
        this._entries.clear()
        this._pending.clear()
    }

    values(): IterableIterator<E> {
        if (this._pending.size > 0) {
            this.indexPending()
        }
        return this._entries.values()
    }

    private indexPending(): void {
        const pending = this._pending
        this._pending = new Set<E>()
        for (const e of pending) {
            this.add(e)
        }
    }

    private rebuild(excluded?: E): void {
        this.clear()
        for (const e of this._all()) {
            if (e !== excluded) {
                this.add(e)
            }
        }
    }
}
