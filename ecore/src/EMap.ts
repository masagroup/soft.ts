// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EList, EMapEntry, isEList } from "./internal.js"

export interface EMap<K, V> extends EList<EMapEntry<K, V>> {
    put(key: K, value: V): void
    getValue(ket: K): V
    removeKey(key: K): V

    containsKey(key: K): boolean
    containsValue(value: V): boolean

    toMap(): Map<K, V>
}

export function isEMap<K, V>(m: any): m is EMap<K, V> {
    return m == undefined ? undefined : isEList<EMapEntry<K, V>>(m) && "put" in m
}
