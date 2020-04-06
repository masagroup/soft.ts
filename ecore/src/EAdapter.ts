// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifier } from "./ENotifier";
import { ENotification } from "./ENotification";

export interface EAdapter
{
    // the target from which the adapter receives notification.
    // In general, an adapter may be shared by more than one notifier.
    eNotifier : ENotifier;

    // NotifyChanged Notifies that a change to some feature has occurred.
	notifyChanged(notification : ENotification) : void;
}