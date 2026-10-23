// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EcoreConstants, EEnumLiteralImpl } from "./internal.js"

// EEnumLiteralExt tracks whether its literal is set: as in EMF, where an unset literal is null,
// an unset literal gives the name while a literal set to "" stays "".
export class EEnumLiteralExt extends EEnumLiteralImpl {
    private _isLiteralSet = false

    getLiteral(): string {
        return this._isLiteralSet ? super.getLiteral() : this.getName()
    }

    setLiteral(newLiteral: string): void {
        this._isLiteralSet = true
        super.setLiteral(newLiteral)
    }

    eUnsetFromID(featureID: number): void {
        super.eUnsetFromID(featureID)
        if (featureID == EcoreConstants.EENUM_LITERAL__LITERAL) {
            this._isLiteralSet = false
        }
    }

    eIsSetFromID(featureID: number): boolean {
        if (featureID == EcoreConstants.EENUM_LITERAL__LITERAL) {
            return this._isLiteralSet
        }
        return super.eIsSetFromID(featureID)
    }
}
