// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ETypedElementImpl, UNBOUNDED_MULTIPLICITY } from "./internal";

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
