// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EAttribute, EAttributeImpl, EClassExt, EcoreConstants, EDataType, EStructuralFeature } from "./internal.js"

export function isEAttribute(s: EStructuralFeature): s is EAttribute {
    return "eAttributeType" in s
}

export class EAttributeExt extends EAttributeImpl {
    constructor() {
        super()
    }

    get eAttributeType(): EDataType {
        return this.eType as EDataType
    }

    basicGetEAttributeType(): EDataType {
        return this.basicGetEType() as EDataType
    }

    get isID(): boolean {
        return super.isID
    }

    set isID(newIsID: boolean) {
        super.isID = newIsID
        let eClass = this.eContainingClass
        if (eClass != null) {
            ;(eClass as EClassExt).setModified(EcoreConstants.ECLASS__EATTRIBUTES)
        }
    }
}
