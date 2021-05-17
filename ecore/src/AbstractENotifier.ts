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
} from "./internal";

class AbstractENotifierNotification extends AbstractNotification {
    private _notifier: AbstractENotifier;

    constructor(
        notifier: AbstractENotifier,
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number
    ) {
        super(eventType, oldValue, newValue, position);
        this._notifier = notifier;
    }

    get feature(): EStructuralFeature {
        return null;
    }

    get featureID(): number {
        return -1;
    }

    get notifier(): ENotifier {
        return this._notifier;
    }
}

export class AbstractENotifierList extends BasicEList<EAdapter> {
    private _notifier: AbstractENotifier;

    constructor(notifier: AbstractENotifier) {
        super([], true);
        this._notifier = notifier;
    }

    protected didAdd(index: number, adapter: EAdapter): void {
        adapter.target = this._notifier;
    }

    protected didRemove(index: number, adapter: EAdapter): void {
        if (this._notifier.eDeliver) {
            adapter.notifyChanged(
                new AbstractENotifierNotification(
                    this._notifier,
                    EventType.REMOVING_ADAPTER,
                    adapter,
                    null,
                    index
                )
            );
        }
        adapter.unsetTarget(this._notifier);
    }
}

export abstract class AbstractENotifier implements ENotifier {
    protected eBasicAdapters(): EList<EAdapter> {
        return null;
    }

    protected eBasicHasAdapters(): boolean {
        let adapters = this.eBasicAdapters();
        return adapters && !adapters.isEmpty();
    }

    get eAdapters(): EList<EAdapter> {
        return new ImmutableEList();
    }

    get eDeliver(): boolean {
        return false;
    }

    set eDeliver(boolean) {
        throw new Error("Unsupported operation.");
    }

    get eNotificationRequired(): boolean {
        return this.eBasicHasAdapters() && this.eDeliver;
    }

    eNotify(notification: ENotification): void {
        if (this.eNotificationRequired) {
            for (const adapter of this.eBasicAdapters()) {
                adapter.notifyChanged(notification);
            }
        }
    }
}
