// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractEAdapter,
    EClass,
    EcoreConstants,
    EDynamicProperties,
    ENotification,
    EObjectImpl,
    EventType,
    getEcorePackage,
} from "./internal";

class DynamicFeaturesAdapter extends AbstractEAdapter {
    constructor(private _obj: DynamicEObjectImpl) {
        super();
    }

    notifyChanged(notification: ENotification): void {
        if (notification.eventType != EventType.REMOVING_ADAPTER) {
            if (notification.featureID == EcoreConstants.ECLASS__ESTRUCTURAL_FEATURES) {
                this._obj.resizeProperties();
            }
        }
    }
}

function resize(arr: any[], newSize: number, defaultValue: any) {
    while (newSize > arr.length) arr.push(defaultValue);
    arr.length = newSize;
}

export class DynamicEObjectImpl extends EObjectImpl implements EDynamicProperties {
    private _clz: EClass;
    private _properties: any[];
    private _dynamicFeaturesAdapter: DynamicFeaturesAdapter;

    constructor() {
        super();
        this._clz = null;
        this._dynamicFeaturesAdapter = new DynamicFeaturesAdapter(this);
        this._properties = [];
        this.resizeProperties();
    }

    eStaticClass(): EClass {
        return getEcorePackage().getEObject();
    }

    eStaticFeatureCount(): number {
        return 0;
    }

    eClass(): EClass {
        return this._clz ? this._clz : this.eStaticClass();
    }

    setEClass(clz: EClass) {
        if (this._clz) this._clz.eAdapters.remove(this._dynamicFeaturesAdapter);

        this._clz = clz;
        this.resizeProperties();

        if (this._clz) this._clz.eAdapters.add(this._dynamicFeaturesAdapter);
    }

    eDynamicProperties(): EDynamicProperties {
        return this;
    }

    eDynamicGet(dynamicFeatureID: number): any {
        return this._properties[dynamicFeatureID];
    }
    eDynamicSet(dynamicFeatureID: number, newValue: any): void {
        this._properties[dynamicFeatureID] = newValue;
    }
    eDynamicUnset(dynamicFeatureID: number): void {
        this._properties[dynamicFeatureID] = null;
    }

    resizeProperties(): void {
        resize(
            this._properties,
            this.eClass().getFeatureCount() - this.eStaticClass().getFeatureCount(),
            null
        );
    }
}
