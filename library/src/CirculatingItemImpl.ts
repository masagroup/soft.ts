// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore"
import { Borrower, CirculatingItem, Item, ItemImpl, Lendable, LibraryConstants, getLibraryPackage } from "./internal.js"

export class CirculatingItemImpl extends ItemImpl implements CirculatingItem {
    protected _borrowers: ecore.EList<Borrower>
    protected _copies: number

    constructor() {
        super()
        this._borrowers = null
        this._copies = 0
    }

    eStaticClass(): ecore.EClass {
        return getLibraryPackage().getCirculatingItem()
    }

    // get the value of borrowers
    get borrowers(): ecore.EList<Borrower> {
        if (this._borrowers == null) {
            this._borrowers = new ecore.BasicEObjectList<Borrower>(
                this,
                LibraryConstants.CIRCULATING_ITEM__BORROWERS,
                LibraryConstants.BORROWER__BORROWED,
                false,
                true,
                true,
                true,
                false
            )
        }
        return this._borrowers
    }

    // get the value of copies
    get copies(): number {
        return this._copies
    }

    // set the value of copies
    set copies(newCopies: number) {
        let oldCopies = this._copies
        this._copies = newCopies
        if (this.eNotificationRequired) {
            this.eNotify(
                new ecore.Notification(
                    this,
                    ecore.EventType.SET,
                    LibraryConstants.CIRCULATING_ITEM__COPIES,
                    oldCopies,
                    newCopies
                )
            )
        }
    }

    eDerivedFeatureID(eContainer: ecore.EObject, featureID: number): number {
        let eClass = eContainer as ecore.EClass
        if (eClass == getLibraryPackage().getLendable()) {
            switch (featureID) {
                case LibraryConstants.LENDABLE__COPIES: {
                    return LibraryConstants.CIRCULATING_ITEM__COPIES
                }
                case LibraryConstants.LENDABLE__BORROWERS: {
                    return LibraryConstants.CIRCULATING_ITEM__BORROWERS
                }
                default: {
                    return -1
                }
            }
        }
        return super.eDerivedFeatureID(eContainer, featureID)
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case LibraryConstants.CIRCULATING_ITEM__BORROWERS: {
                return !resolve && ecore.isEObjectList(this.borrowers)
                    ? this.borrowers.getUnResolvedList()
                    : this.borrowers
            }
            case LibraryConstants.CIRCULATING_ITEM__COPIES: {
                return this.copies
            }
            default: {
                return super.eGetFromID(featureID, resolve)
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case LibraryConstants.CIRCULATING_ITEM__BORROWERS: {
                this.borrowers.clear()
                this.borrowers.addAll(newValue as ecore.EList<Borrower>)
                break
            }
            case LibraryConstants.CIRCULATING_ITEM__COPIES: {
                this.copies = newValue as number
                break
            }
            default: {
                super.eSetFromID(featureID, newValue)
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case LibraryConstants.CIRCULATING_ITEM__BORROWERS: {
                this.borrowers.clear()
                break
            }
            case LibraryConstants.CIRCULATING_ITEM__COPIES: {
                this.copies = 0
                break
            }
            default: {
                super.eUnsetFromID(featureID)
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case LibraryConstants.CIRCULATING_ITEM__BORROWERS: {
                return this.borrowers != null && this.borrowers.size() != 0
            }
            case LibraryConstants.CIRCULATING_ITEM__COPIES: {
                return this._copies != 0
            }
            default: {
                return super.eIsSetFromID(featureID)
            }
        }
    }

    eBasicInverseAdd(
        otherEnd: ecore.EObject,
        featureID: number,
        notifications: ecore.ENotificationChain
    ): ecore.ENotificationChain {
        switch (featureID) {
            case LibraryConstants.CIRCULATING_ITEM__BORROWERS: {
                let list = this.borrowers as ecore.ENotifyingList<Borrower>
                let end = otherEnd as Borrower
                return list.addWithNotification(end, notifications)
            }
            default: {
                return super.eBasicInverseAdd(otherEnd, featureID, notifications)
            }
        }
    }

    eBasicInverseRemove(
        otherEnd: ecore.EObject,
        featureID: number,
        notifications: ecore.ENotificationChain
    ): ecore.ENotificationChain {
        switch (featureID) {
            case LibraryConstants.CIRCULATING_ITEM__BORROWERS: {
                let list = this.borrowers as ecore.ENotifyingList<Borrower>
                let end = otherEnd as Borrower
                return list.removeWithNotification(end, notifications)
            }
            default: {
                return super.eBasicInverseRemove(otherEnd, featureID, notifications)
            }
        }
    }
}
