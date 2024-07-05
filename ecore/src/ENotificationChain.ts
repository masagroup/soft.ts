// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ENotification } from "./internal.js"

// ENotificationChain is an accumulator of notifications.
// As notifications are produced,they are accumulated in a chain,
// and possibly even merged, before finally being dispatched to the notifier.
export interface ENotificationChain {
    // Adds a notification to the chain.
    add(notification: ENotification): boolean

    // Dispatches each notification to the appropriate notifier via notifier.ENotify method
    dispatch(): void
}
