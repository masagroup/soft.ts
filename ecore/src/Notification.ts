// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import {
    EStructuralFeature,
    ENotifier,
    EObject,
    EventType,
    AbstractNotification,
} from "./internal";

export class Notification extends AbstractNotification {
    private _object: EObject;
    private _feature: EStructuralFeature;
    private _featureID: number;

    constructor(
        object: EObject,
        eventType: EventType,
        feature: EStructuralFeature | number,
        oldValue: any,
        newValue: any,
        position: number = -1
    ) {
        super(eventType, oldValue, newValue, position);
        this._object = object;
        if (typeof feature === "number") {
            this._featureID = feature;
            this._feature = null;
        } else {
            this._featureID = -1;
            this._feature = feature;
        }
    }

    get feature(): EStructuralFeature {
        if (this._feature != null) return this._feature;
        else return this._object.eClass().getEStructuralFeature(this._featureID);
    }

    get featureID(): number {
        if (this._featureID != -1) return this._featureID;
        if (this._feature != null) return this._feature.featureID;
        return -1;
    }

    get notifier(): ENotifier {
        return this._object;
    }
}
