// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EEnumLiteralImpl } from "./internal.js"

export class EEnumLiteralExt extends EEnumLiteralImpl {
    getLiteral(): string {
        const l = super.getLiteral()
        return l.length == 0 ? this.getName() : l
    }
}
