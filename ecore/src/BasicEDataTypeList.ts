// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { AbstractNotifyingList, ENotifier, EObjectInternal, EStructuralFeature } from "./internal.js"

export class BasicEDataTypeList<E> extends AbstractNotifyingList<E> {
    private _owner: EObjectInternal
    private _featureID: number

    constructor(owner: EObjectInternal, featureID: number) {
        super()
        this._owner = owner
        this._featureID = featureID
    }

    get notifier(): ENotifier {
        return this._owner
    }

    get feature(): EStructuralFeature {
        return this._owner != null ? this._owner.eClass().getEStructuralFeature(this._featureID) : null
    }

    get featureID(): number {
        return this._featureID
    }
}
