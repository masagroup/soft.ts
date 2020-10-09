// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EList, ENotifier, EStructuralFeature, ENotificationChain } from "./internal";

export interface ENotifyingList<E> extends EList<E> {
    readonly notifier: ENotifier;

    readonly feature: EStructuralFeature;

    readonly featureID: number;

    addWithNotification(e: E, notifications: ENotificationChain): ENotificationChain;

    removeWithNotification(e: E, notifications: ENotificationChain): ENotificationChain;

    setWithNotification(index: number, e: E, notifications: ENotificationChain): ENotificationChain;
}
