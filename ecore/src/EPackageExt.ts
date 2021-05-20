// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EAdapter,
    EClassifier,
    ENotification,
    EventType,
    EcoreConstants,
    AbstractEAdapter,
    EPackageImpl,
    EResource,
    EResourceImpl,
} from "./internal";

class EPackageExtAdapter extends AbstractEAdapter {
    constructor(private _pack: EPackageExt) {
        super();
    }

    notifyChanged(notification: ENotification): void {
        if (
            notification.eventType != EventType.REMOVING_ADAPTER &&
            notification.featureID == EcoreConstants.EPACKAGE__ECLASSIFIERS
        ) {
            this._pack._nameToClassifier = null;
        }
    }
}

export class EPackageExt extends EPackageImpl {
    _nameToClassifier: Map<string, EClassifier> = null;
    _adapter: EAdapter = null;

    constructor() {
        super();
        this._adapter = new EPackageExtAdapter(this);
        this.eAdapters.add(this._adapter);
    }

    getEClassifier(name: string): EClassifier {
        if (!this._nameToClassifier) {
            this._nameToClassifier = new Map<string, EClassifier>();
            for (const classifier of this.eClassifiers) {
                this._nameToClassifier.set(classifier.name, classifier);
            }
        }
        return this._nameToClassifier.get(name);
    }

    protected createResource(): EResource {
        let resource = this.eResource();
        if (!resource) {
            let uri = new URL(this.nsURI);
            resource = new EResourceImpl();
            resource.eURI = uri;
            resource.eContents().add(this);
        }
        return resource;
    }
}
