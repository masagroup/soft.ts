// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EList, ENotificationChain, ENotifier, EStructuralFeature, isEList } from "./internal.js"

export interface ENotifyingList<E> extends EList<E> {
    getNotifier(): ENotifier

    getFeature(): EStructuralFeature

    getFeatureID(): number

    addWithNotification(e: E, notifications: ENotificationChain): ENotificationChain

    removeWithNotification(e: E, notifications: ENotificationChain): ENotificationChain

    setWithNotification(index: number, e: E, notifications: ENotificationChain): ENotificationChain
}

// EUnsettableList is the list of a many-valued feature, which tells whether the feature is set and
// unsets it, as EMF InternalEList.Unsettable. The list of a feature that is not unsettable is set
// when it is not empty, and unset clears it. The list of an unsettable feature is set from its first
// change, a clear of an empty list included, until unset, which clears it and notifies UNSET.
export interface EUnsettableList<E> extends EList<E> {
    isSet(): boolean

    unset(): void
}

export function isEUnsettableList<E>(l: any): l is EUnsettableList<E> {
    return isEList(l) && "isSet" in l && "unset" in l
}

// isSetList returns true when the list of a many-valued feature is set: as an EUnsettableList
// tells, else when it is not empty.
export function isSetList(list: EList<any>): boolean {
    return isEUnsettableList(list) ? list.isSet() : !list.isEmpty()
}

// unsetList unsets the list of a many-valued feature: as an EUnsettableList does, else clearing it.
export function unsetList(list: EList<any>): void {
    if (isEUnsettableList(list)) {
        list.unset()
    } else {
        list.clear()
    }
}
