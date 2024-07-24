// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EList, ENotificationChain, ENotifier, EStructuralFeature } from "./internal.js"

export interface ENotifyingList<E> extends EList<E> {
    getNotifier(): ENotifier

    getFeature(): EStructuralFeature

    getFeatureID(): number

    addWithNotification(e: E, notifications: ENotificationChain): ENotificationChain

    removeWithNotification(e: E, notifications: ENotificationChain): ENotificationChain

    setWithNotification(index: number, e: E, notifications: ENotificationChain): ENotificationChain
}
