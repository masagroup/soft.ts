// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ENotification, ENotificationChain } from "./internal"

export class NotificationChain implements ENotificationChain {
    private _notifications: ENotification[]

    constructor() {
        this._notifications = []
    }

    add(notification: ENotification): boolean {
        if (!notification) return false

        for (const n of this._notifications) {
            if (n.merge(notification)) return false
        }

        this._notifications.push(notification)
        return true
    }
    dispatch(): void {
        for (const notification of this._notifications) {
            if (notification.notifier) notification.notifier.eNotify(notification)
        }
    }
}
