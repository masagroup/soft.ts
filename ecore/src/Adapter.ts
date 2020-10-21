// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EAdapter, ENotifier, ENotification } from "./internal";

export abstract class Adapter implements EAdapter {
    private _target: ENotifier;

    get target(): ENotifier {
        return this._target;
    }

    set target(notifier: ENotifier) {
        this._target = notifier;
    }

    unsetTarget(notifier: ENotifier) {
        if (this._target == notifier) {
            this._target = null;
        }
    }

    abstract notifyChanged(notification: ENotification): void;
}
