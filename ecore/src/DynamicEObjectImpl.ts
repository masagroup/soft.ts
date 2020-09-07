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
import { EStructuralFeature } from "./EStructuralFeature";
import { isEAttribute, isEReference } from "./BasicEObject";
import { BasicEList } from "./BasicEList";
import { BasicEObjectList } from "./BasicEObjectList";

class DynamicFeaturesAdapter extends Adapter {
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

function resize(arr, newSize, defaultValue) {
    return [...arr, ...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue)];
}

export class DynamicEObjectImpl extends EObjectImpl {
    private _clz: EClass;
    private _properties: any[];
    private _dynamicFeaturesAdapter: DynamicFeaturesAdapter;

    constructor() {
        super();
        this._clz = null;
        this._dynamicFeaturesAdapter = new DynamicFeaturesAdapter(this);
        this._properties = [];
    }

    resizeProperties(): void {
        resize(
            this._properties,
            this.eClass().getFeatureCount() - this.eStaticClass().getFeatureCount(),
            null
        );
    }

    eClass(): EClass {
        return this._clz == null ? this.eStaticClass() : this._clz;
    }

    setEClass(clz: EClass) {
        if (this._clz) this._clz.eAdapters.remove(this._dynamicFeaturesAdapter);

        this._clz = clz;
        this.resizeProperties();

        if (this._clz) this._clz.eAdapters.add(this._dynamicFeaturesAdapter);
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        let dynamicFeatureID = featureID - this.eStaticClass().getFeatureCount();
        if (dynamicFeatureID >= 0) {
            let feature = this.eDynamicFeature(featureID);
            let result = this._properties[dynamicFeatureID];
            if (result == null) {
                if (feature.isMany) result = this.createList(feature);
                this._properties[dynamicFeatureID] = result;
            }
            return result;
        }
        return super.eGetFromID(featureID, resolve);
    }

    private createList(feature: EStructuralFeature) {
        if (isEAttribute(feature)) {
            return new BasicEList([], feature.isUnique);
        } else if (isEReference(feature)) {
            let inverse = false;
            let opposite = false;
            let reverseID = -1;
            let reverseFeature = feature.eOpposite;
            if (reverseFeature) {
                reverseID = reverseFeature.featureID;
                inverse = true;
                opposite = true;
            } else if (feature.isContainment) {
                inverse = true;
                opposite = false;
            }
            return new BasicEObjectList(
                this,
                feature.featureID,
                reverseID,
                feature.isContainment,
                inverse,
                opposite,
                feature.isResolveProxies,
                feature.isUnsettable
            );
        }
        return null;
    }

    private eDynamicFeature(dynamicFeatureID: number): EStructuralFeature {
        return this.eClass().getEStructuralFeature(
            dynamicFeatureID + this.eStaticClass().getFeatureCount()
        );
    }
}
