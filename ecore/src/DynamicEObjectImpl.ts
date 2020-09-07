// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EObjectImpl } from "./EObjectImpl";
import { EClass } from "./EClass";
import { Adapter } from "./Adapter";
import { ENotification, EventType } from "./ENotification";
import { EcoreConstants } from "./EcoreConstants";

class DynamicFeaturesAdapter extends Adapter {
    
    constructor( private _obj : DynamicEObjectImpl ) {
        super();
    }

    notifyChanged(notification: ENotification): void {
        if (notification.eventType != EventType.REMOVING_ADAPTER ) {
            if (notification.featureID == EcoreConstants.ECLASS__ESTRUCTURAL_FEATURES ) {
                this._obj.resizeProperties();
            }
        }
    }
}

export class DynamicEObjectImpl extends EObjectImpl {
   private _clz : EClass;
   private _properties : any[];
   private _dynamicFeaturesAdapter : DynamicFeaturesAdapter;

    constructor() {
        super();
        this._clz = null;
        this._dynamicFeaturesAdapter = new DynamicFeaturesAdapter(this);
        this._properties = [];
    }

   resizeProperties() : void {

   }
}