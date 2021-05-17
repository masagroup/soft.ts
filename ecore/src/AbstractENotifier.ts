// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ImmutableEList } from "./ImmutableEList";
import { EAdapter, EList, ENotification, ENotifier } from "./internal";

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
