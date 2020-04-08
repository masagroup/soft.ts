// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifyingList } from "./ENotifyingList";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { ArrayEList } from "./ArrayEList";
import { AbstractNotification } from "./AbstractNotification";
import { EventType, ENotification } from "./ENotification";
import { ENotificationChain } from "./ENotificationChain";

export class NotifyingList<E> extends ArrayEList<E> implements ENotifyingList<E> {
    
    constructor( v : [] = [] ) {
        super(v,true);
    }

    get notifier() : ENotifier {
        return null;
    }

    get feature() : EStructuralFeature {
        return null;
    }

    get featureID() : number {
        return -1;
    }

    AddWithNotification(object: any, notifications: ENotificationChain): ENotificationChain {
        throw new Error("Method not implemented.");
    }

    RemoveWithNotification(object: any, notifications: ENotificationChain): ENotificationChain {
        throw new Error("Method not implemented.");
    }

    SetWithNotification(index: number, object: any, notifications: ENotificationChain): ENotificationChain {
        throw new Error("Method not implemented.");
    }

    private createNotification( eventType : EventType , oldValue : any , newValue : any , position : number = -1) : AbstractNotification {    
        return new class extends AbstractNotification {
            constructor( private list : NotifyingList<E>) {
                super(eventType,oldValue,newValue,position);
            }

            get feature() : EStructuralFeature {
                return this.list.feature;
            }

            get featureID() : number {
                return this.list.featureID;
            }

            get notifier( ) : ENotifier {
                return this.list.notifier;
            }
        }(this);
    }    
}

