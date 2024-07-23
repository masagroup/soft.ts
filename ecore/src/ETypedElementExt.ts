// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ETypedElementImpl, UNBOUNDED_MULTIPLICITY } from "./internal.js"

export class ETypedElementExt extends ETypedElementImpl {
    constructor() {
        super()
    }

    isMany(): boolean {
        return this.getUpperBound() > 1 || this.getUpperBound() == UNBOUNDED_MULTIPLICITY
    }

    isRequired(): boolean {
        return this.getLowerBound() >= 1
    }
}
