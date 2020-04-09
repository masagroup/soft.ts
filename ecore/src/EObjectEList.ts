// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { AbstractNotifyingList } from "./AbstractNotifyingList";
import { EObjectInternal, EOPPOSITE_FEATURE_BASE } from "./AbstractEObject";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { ENotificationChain } from "./ENotificationChain";

export class EObjectEList<E> extends AbstractNotifyingList<E> {
    private _owner : EObjectInternal;
    private _featureID : number;
    private _inverseFeatureID : number;
	private _containment : boolean;
	private _inverse : boolean;
    private _opposite : boolean;
    private _proxies : boolean;
    private _unset : boolean;


    constructor(owner : EObjectInternal, featureID : number , inverseFeatureID : number, containment : boolean , inverse : boolean , opposite : boolean , proxies : boolean ,unset : boolean) {
        super();
        this._featureID = featureID;
        this._inverseFeatureID= inverseFeatureID;
        this._containment = containment;
        this._inverse = inverse;
        this._opposite = opposite;
        this._proxies = proxies;
        this._unset = unset;
    }

    get notifier() : ENotifier {
        return this._owner;
    }

    get feature() : EStructuralFeature {
        return this._owner != null ? this._owner.eClass().getEStructuralFeature(this._featureID) : null;
    }

    get featureID() : number {
        return this._featureID;
    }

    inverseAdd(e : E, notifications : ENotificationChain) : ENotificationChain {
        const internal = this.forceCast<EObjectInternal>(e);
        if (internal != null && this._inverse) {
            if ( this._opposite ) {
                return internal.eInverseAdd(this._owner, this._inverseFeatureID, notifications)
            } else {
                return internal.eInverseAdd(this._owner, EOPPOSITE_FEATURE_BASE-this._featureID, notifications)
            }
        }
        return notifications
    }
    
    inverseRemove(e : E, notifications : ENotificationChain) : ENotificationChain {
        const internal = this.forceCast<EObjectInternal>(e);
        if (internal != null && this._inverse) {
            if ( this._opposite ){
                return internal.eInverseRemove(this._owner, this._inverseFeatureID, notifications)
            } else {
                return internal.eInverseRemove(this._owner, EOPPOSITE_FEATURE_BASE-this._featureID, notifications)
            }
        }
        return notifications
    }

    private forceCast<T>(input: any): T {
        // @ts-ignore
        return input;
      }

}