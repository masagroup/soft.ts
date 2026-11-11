// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EDataType, EDiagnosticImpl, EStructuralFeature } from "./internal.js"

// IllegalValueDiagnostic reports a value its data type does not accept, as EMF's
// IllegalValueException: the decoder leaves the feature unset and goes on, so a reader that tells
// a refused value from the other diagnostics can fail the load instead of losing the value.
export class IllegalValueDiagnostic extends EDiagnosticImpl {
    // the feature the value was read for
    readonly feature: EStructuralFeature
    // the type that refused the value
    readonly dataType: EDataType
    // the text read
    readonly value: string

    constructor(
        message: string,
        location: string,
        line: number,
        column: number,
        feature: EStructuralFeature,
        dataType: EDataType,
        value: string
    ) {
        super(message, location, line, column)
        this.feature = feature
        this.dataType = dataType
        this.value = value
    }

    get name(): string {
        return "IllegalValueDiagnostic"
    }
}
