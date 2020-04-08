// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EList } from "./EList";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { ENotificationChain } from "./ENotificationChain";

export interface ENotifyingList<E> extends EList<E> {
    
    readonly notifier : ENotifier;

    readonly feature : EStructuralFeature;
    
    readonly featureID : number;

	AddWithNotification(object : any, notifications : ENotificationChain) : ENotificationChain;

	RemoveWithNotification(object : any, notifications : ENotificationChain) : ENotificationChain;

	SetWithNotification(index : number, object : any, notifications : ENotificationChain) : ENotificationChain;
}