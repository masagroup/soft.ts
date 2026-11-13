// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EStore, EStoreEObjectImpl } from "./internal.js"

// HybridEObjectImpl is the root of the classes generated with storage=hybrid: classes whose values
// are held by a store, as with reflective feature delegation, and whose getters read typed fields,
// a cache of the values of the store.
//
// A generated class declares a field per feature it holds and, per class level, a mask of the
// fields published: a getter returns its field when its bit is set, else reads the value
// reflectively (eBaseGetFromID), stores it in its field and sets its bit. The root clears the
// fields when the values may change: a set or an unset clears the field of its feature
// (eClearField), a cleared cache, a new store or a change of caching clears them all
// (eClearFields). A reference is published only when it is not a proxy, and its getter reads it
// again when its object became a proxy: a proxy is resolved at each read, as EMF does.
export class HybridEObjectImpl extends EStoreEObjectImpl {
    constructor() {
        super()
    }

    // eBaseGetFromID is the reflective read of the feature featureID without the typed fields: the
    // value of the store, or of the cache of the object, its proxy resolved when resolve is true.
    // The getters of the generated classes load their fields with it.
    eBaseGetFromID(featureID: number, resolve: boolean): any {
        return super.eGetFromID(featureID, resolve)
    }

    // eClearFields clears the typed fields of the object: each read loads its field again. A
    // generated class clears the masks of its level, then calls the one of its super class.
    eClearFields(): void {}

    // eClearField clears the typed field of the feature featureID, if the class has one. A
    // generated class clears the bit of its own fields, and calls the one of its super class for
    // the others.
    eClearField(_featureID: number): void {}

    clearCache(): void {
        super.clearCache()
        this.eClearFields()
    }

    setCache(cache: boolean): void {
        super.setCache(cache)
        this.eClearFields()
    }

    setEStore(store: EStore): void {
        super.setEStore(store)
        this.eClearFields()
    }

    eDynamicSet(dynamicFeatureID: number, newValue: any): void {
        super.eDynamicSet(dynamicFeatureID, newValue)
        this.eClearField(this.eStaticFeatureCount() + dynamicFeatureID)
    }

    eDynamicUnset(dynamicFeatureID: number): void {
        super.eDynamicUnset(dynamicFeatureID)
        this.eClearField(this.eStaticFeatureCount() + dynamicFeatureID)
    }
}

export function isHybridEObject(o: any): o is HybridEObjectImpl {
    return o instanceof HybridEObjectImpl
}
