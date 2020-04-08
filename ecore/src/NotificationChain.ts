// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotificationChain } from "./ENotificationChain";
import { ENotification } from "./ENotification";
import { EList } from "./EList";
import { ArrayEList } from "./ArrayEList";

export class NotificationChain implements ENotificationChain {
    private _notifications: EList<ENotification>;

    constructor() {
        this._notifications = new ArrayEList<ENotification>();
    }

    add(notification: ENotification): boolean {
        if (notification == null) return false;

        for (const n of this._notifications) {
            if (n.merge(notification)) return false;
        }

        this._notifications.add(notification);
        return true;
    }
    dispatch(): void {
        for (const notification of this._notifications) {
            if (notification.notifier != null && notification.eventType != -1)
                notification.notifier.eNotify(notification);
        }
    }
}
