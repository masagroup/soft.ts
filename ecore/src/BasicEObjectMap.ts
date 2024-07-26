// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BasicEMap, EClass, EMapEntry } from "./internal.js"

export class BasicEObjectMap<K, V> extends BasicEMap<K, V> {
    private _entryClass: EClass

    constructor(entryClass: EClass) {
        super()
        this._entryClass = entryClass
    }

    protected newEntry(key: K, value: V): EMapEntry<K, V> {
        const eFactory = this._entryClass.getEPackage().getEFactoryInstance()
        const eEntry = eFactory.create(this._entryClass) as any as EMapEntry<K, V>
        eEntry.setKey(key)
        eEntry.setValue(value)
        return eEntry
    }
}
