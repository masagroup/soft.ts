// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ENotifier, EList, EAdapter, ENotification, BasicEList } from "./internal";

export class BasicNotifier implements ENotifier {
    private _eAdapters: EList<EAdapter>;
    eDeliver: boolean;

    constructor() {
        this._eAdapters = new AdapterList(this);
        this.eDeliver = true;
    }

    get eAdapters(): EList<EAdapter> {
        return this._eAdapters;
    }

    get eNotificationRequired(): boolean {
        return this.eDeliver && !this._eAdapters.isEmpty();
    }

    eNotify(notification: ENotification): void {
        for (const adapter of this._eAdapters) {
            adapter.notifyChanged(notification);
        }
    }
}

class AdapterList extends BasicEList<EAdapter> {
    private _notifier: BasicNotifier;

    constructor(notifier: BasicNotifier) {
        super();
        this._notifier = notifier;
    }

    protected didAdd(index: number, e: EAdapter): void {
        e.target = this._notifier;
    }
    protected didRemove(index: number, e: EAdapter): void {
        e.target = null;
    }
}
