// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotification, ENotificationChain } from "./internal";

export class NotificationChain implements ENotificationChain {
    private _notifications: ENotification[];

    constructor() {
        this._notifications = [];
    }

    add(notification: ENotification): boolean {
        if (!notification) return false;

        for (const n of this._notifications) {
            if (n.merge(notification)) return false;
        }

        this._notifications.push(notification);
        return true;
    }
    dispatch(): void {
        for (const notification of this._notifications) {
            if (notification.notifier != null && notification.eventType != -1)
                notification.notifier.eNotify(notification);
        }
    }
}
