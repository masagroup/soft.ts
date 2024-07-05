// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { AbstractNotification, ENotifier, EObject, EStructuralFeature, EventType } from "./internal.js"

export class Notification extends AbstractNotification {
    private _object: EObject
    private _feature: EStructuralFeature
    private _featureID: number

    constructor(
        object: EObject,
        eventType: EventType,
        feature: EStructuralFeature | number,
        oldValue: any,
        newValue: any,
        position: number = -1
    ) {
        super(eventType, oldValue, newValue, position)
        this._object = object
        if (typeof feature === "number") {
            this._featureID = feature
            this._feature = null
        } else {
            this._featureID = -1
            this._feature = feature
        }
    }

    get feature(): EStructuralFeature {
        if (this._feature != null) return this._feature
        else return this._object.eClass().getEStructuralFeature(this._featureID)
    }

    get featureID(): number {
        if (this._featureID != -1) return this._featureID
        if (this._feature != null) return this._feature.featureID
        return -1
    }

    get notifier(): ENotifier {
        return this._object
    }
}
