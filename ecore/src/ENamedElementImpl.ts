// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EClass,
    EList,
    EModelElement,
    EModelElementExt,
    ENamedElement,
    ENotification,
    ENotificationChain,
    ENotifyingList,
    EOPPOSITE_FEATURE_BASE,
    EObject,
    EObjectInternal,
    EcoreConstants,
    EventType,
    Notification,
    getEcorePackage,
    isEObjectInternal,
    isEObjectList,
} from "./internal";

export class ENamedElementImpl extends EModelElementExt implements ENamedElement {
    protected _name: string;

    constructor() {
        super();
        this._name = "";
    }

    eStaticClass(): EClass {
        return getEcorePackage().getENamedElement();
    }

    // get the value of name
    get name(): string {
        return this._name;
    }

    // set the value of name
    set name(newName: string) {
        let oldName = this._name;
        this._name = newName;
        if (this.eNotificationRequired) {
            this.eNotify(new Notification(this, EventType.SET, EcoreConstants.ENAMED_ELEMENT__NAME, oldName, newName));
        }
    }

    eGetFromID(featureID: number, resolve: boolean): any {
        switch (featureID) {
            case EcoreConstants.ENAMED_ELEMENT__NAME: {
                return this.name;
            }
            default: {
                return super.eGetFromID(featureID, resolve);
            }
        }
    }

    eSetFromID(featureID: number, newValue: any) {
        switch (featureID) {
            case EcoreConstants.ENAMED_ELEMENT__NAME: {
                this.name = newValue as string;
                break;
            }
            default: {
                super.eSetFromID(featureID, newValue);
            }
        }
    }

    eUnsetFromID(featureID: number) {
        switch (featureID) {
            case EcoreConstants.ENAMED_ELEMENT__NAME: {
                this.name = "";
                break;
            }
            default: {
                super.eUnsetFromID(featureID);
            }
        }
    }

    eIsSetFromID(featureID: number): boolean {
        switch (featureID) {
            case EcoreConstants.ENAMED_ELEMENT__NAME: {
                return this._name != "";
            }
            default: {
                return super.eIsSetFromID(featureID);
            }
        }
    }
}
