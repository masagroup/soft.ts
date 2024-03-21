// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClassifier, EcoreConstants, EDataType, EDataTypeImpl, EventType, Notification } from "./internal"

export function isEDataType(e: EClassifier): e is EDataType {
    return e == undefined ? undefined : "isSerializable" in e
}

export interface EDataTypeInternal extends EDataType {
    defaultValue: any
}

export class EDataTypeExt extends EDataTypeImpl implements EDataTypeInternal {
    private _defaultValue: any

    get defaultValue(): any {
        return this._defaultValue
    }

    set defaultValue(newDefaultValue: any) {
        let oldDefaultValue = this._defaultValue
        this._defaultValue = newDefaultValue
        if (this.eNotificationRequired) {
            this.eNotify(
                new Notification(
                    this,
                    EventType.SET,
                    EcoreConstants.EDATA_TYPE__DEFAULT_VALUE,
                    oldDefaultValue,
                    newDefaultValue,
                ),
            )
        }
    }
}
