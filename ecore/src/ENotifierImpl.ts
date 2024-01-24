// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { AbstractENotifier, AbstractENotifierList, EAdapter, EList } from "./internal"

export class ENotifierImpl extends AbstractENotifier {
    private _adapters: EList<EAdapter> = null
    private _deliver: boolean = true

    get eAdapters(): EList<EAdapter> {
        if (!this._adapters) {
            this._adapters = new AbstractENotifierList(this)
        }
        return this._adapters
    }

    eBasicAdapters(): EList<EAdapter> {
        return this._adapters
    }

    get eDeliver(): boolean {
        return this._deliver
    }

    set eDeliver(deliver: boolean) {
        this._deliver = deliver
    }
}
