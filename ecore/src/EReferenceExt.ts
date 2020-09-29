// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EReferenceImpl } from "./internal";

export class EReferenceExt extends EReferenceImpl {
    constructor() {
        super();
    }

    get isContainer(): boolean {
        return this.eOpposite && this.eOpposite.isContainment;
    }
}
