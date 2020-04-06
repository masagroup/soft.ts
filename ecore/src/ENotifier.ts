// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import {EList} from "./EList"
import {EAdapter} from "./EAdapter"
import { ENotification } from "./ENotification"

export interface ENotifier 
{
    // list of the adapters associated with this notifier.
    readonly eAdapters : EList<EAdapter>;

    // whether this notifier will deliver notifications to the adapters.
    eDeliver : boolean;

    // Notifies a change to a feature of this notifier as described by the notification.
    eNotify(notification:ENotification) : void;
}