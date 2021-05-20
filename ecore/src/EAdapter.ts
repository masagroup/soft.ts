// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ENotifier, ENotification } from "./internal";

export interface EAdapter {
    // the target from which the adapter receives notification.
    // In general, an adapter may be shared by more than one notifier.
    target: ENotifier;

    unsetTarget(notifier: ENotifier): void;

    // NotifyChanged Notifies that a change to some feature has occurred.
    notifyChanged(notification: ENotification): void;
}
