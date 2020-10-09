// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EcoreConstants, EDataType, EClassExt, EAttributeImpl } from "./internal";

export class EAttributeExt extends EAttributeImpl {
    constructor() {
        super();
    }

    get eAttributeType(): EDataType {
        return this.eType as EDataType;
    }

    basicGetEAttributeType(): EDataType {
        return this.basicGetEType() as EDataType;
    }

    get isID(): boolean {
        return super.isID;
    }

    set isID(newIsID: boolean) {
        super.isID = newIsID;
        let eClass = this.eContainingClass;
        if (eClass != null) {
            (eClass as EClassExt).setModified(EcoreConstants.ECLASS__EATTRIBUTES);
        }
    }
}
