// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EAdapter, ENotifier, ENotification } from "./internal";

export abstract class AbstractEAdapter implements EAdapter {
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
