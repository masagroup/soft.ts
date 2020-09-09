// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ETypedElementImpl } from "./ETypedElementImpl";
import { UNBOUNDED_MULTIPLICITY } from "./Constants";

export class ETypedElementExt extends ETypedElementImpl {
    constructor() {
        super();
    }

    get isMany(): boolean {
        return this.upperBound > 1 || this.upperBound == UNBOUNDED_MULTIPLICITY;
    }

    get isRequired(): boolean {
        return this.lowerBound >= 1;
    }
}
