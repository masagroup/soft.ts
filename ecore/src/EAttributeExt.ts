// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EAttributeImpl } from "./EAttributeImpl";
import { EDataType } from "./EDataType";
import { EClassExt } from "./EClassExt";
import { EcoreConstants } from "./EcoreConstants";

export class EAttributeExt extends EAttributeImpl {
    constructor() {
        super();
    }

    getEAttributeType() : EDataType {
        return this.eType as EDataType;
    }

    get isID() : boolean {
        return super.isID;
    }

    set isID( newIsID : boolean ) {
        super.isID = newIsID;
        let eClass = this.eContainingClass;
        if ( eClass != null ) {
            (eClass as EClassExt).setModified(EcoreConstants.ECLASS__EATTRIBUTES);
        }
    }

}
