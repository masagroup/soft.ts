// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EClassifierImpl } from "./internal";

export class EClassifierExt extends EClassifierImpl {
    constructor() {
        super();
    }

    protected initClassifierID(): number {
        return this.ePackage != null ? this.ePackage.eClassifiers.indexOf(this) : -1;
    }
}
