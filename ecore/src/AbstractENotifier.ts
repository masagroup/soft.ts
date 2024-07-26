// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractNotification,
    BasicEList,
    EAdapter,
    EList,
    ENotification,
    ENotifier,
    EStructuralFeature,
    EventType,
    ImmutableEList
} from "./internal.js"

class AbstractENotifierNotification extends AbstractNotification {
    private _notifier: AbstractENotifier

    constructor(notifier: AbstractENotifier, eventType: EventType, oldValue: any, newValue: any, position: number) {
        super(eventType, oldValue, newValue, position)
        this._notifier = notifier
    }

    getFeature(): EStructuralFeature {
        return null
    }

    getFeatureID(): number {
        return -1
    }

    getNotifier(): ENotifier {
        return this._notifier
    }
}

export class AbstractENotifierList extends BasicEList<EAdapter> {
    private _notifier: AbstractENotifier

    constructor(notifier: AbstractENotifier) {
        super([], true)
        this._notifier = notifier
    }

    protected didAdd(index: number, adapter: EAdapter): void {
        adapter.setTarget(this._notifier)
    }

    protected didRemove(index: number, adapter: EAdapter): void {
        if (this._notifier.eDeliver()) {
            adapter.notifyChanged(
                new AbstractENotifierNotification(this._notifier, EventType.REMOVING_ADAPTER, adapter, null, index)
            )
        }
        adapter.unsetTarget(this._notifier)
    }

    toJSON(): any {
        return {}
    }
}

export abstract class AbstractENotifier implements ENotifier {
    protected eBasicAdapters(): EList<EAdapter> {
        return null
    }

    protected eBasicHasAdapters(): boolean {
        const adapters = this.eBasicAdapters()
        return adapters && !adapters.isEmpty()
    }

    eAdapters(): EList<EAdapter> {
        return new ImmutableEList()
    }

    eDeliver(): boolean {
        return false
    }

    eSetDeliver(_: boolean) {
        throw new Error("Unsupported operation.")
    }

    eNotificationRequired(): boolean {
        return this.eBasicHasAdapters() && this.eDeliver()
    }

    eNotify(notification: ENotification): void {
        if (this.eNotificationRequired()) {
            for (const adapter of this.eBasicAdapters()) {
                adapter.notifyChanged(notification)
            }
        }
    }
}
