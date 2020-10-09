// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotification } from "./internal";

// ENotificationChain is an accumulator of notifications.
// As notifications are produced,they are accumulated in a chain,
// and possibly even merged, before finally being dispatched to the notifier.
export interface ENotificationChain {
    // Adds a notification to the chain.
    add(notification: ENotification): boolean;

    // Dispatches each notification to the appropriate notifier via notifier.ENotify method
    dispatch(): void;
}
