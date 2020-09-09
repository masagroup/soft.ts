// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifier } from "./ENotifier";
import { EList } from "./EList";
import { EAdapter } from "./EAdapter";
import { ENotification } from "./ENotification";
import { BasicEList } from "./BasicEList";

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
