// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { AbstractNotifyingList, ENotifier, EObjectInternal, EStructuralFeature } from "./internal.js"

// BasicEDataTypeList is the list of the values of the many-valued attribute of ID featureID of
// owner. The list of an unsettable attribute is set from its first change until unset
// (EUnsettableList).
export class BasicEDataTypeList<E> extends AbstractNotifyingList<E> {
    private _owner: EObjectInternal
    private _featureID: number
    private _unsettable: boolean

    constructor(owner: EObjectInternal, featureID: number, isUnique: boolean = true, unsettable: boolean = false) {
        super()
        this._owner = owner
        this._featureID = featureID
        this._isUnique = isUnique
        this._unsettable = unsettable
    }

    getNotifier(): ENotifier {
        return this._owner
    }

    getFeature(): EStructuralFeature {
        return this._owner != null ? this._owner.eClass().getEStructuralFeature(this._featureID) : null
    }

    getFeatureID(): number {
        return this._featureID
    }

    protected isUnsettable(): boolean {
        return this._unsettable
    }
}
