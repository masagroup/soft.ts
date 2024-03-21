// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EResource } from "./EResource"
import { ECodec } from "./ECodec"
import { EDecoder } from "./EDecoder"
import { EEncoder } from "./EEncoder"
import { XMIDecoder } from "./XMIDecoder"
import { XMIEncoder } from "./XMIEncoder"

export class XMICodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new XMIEncoder(eContext, options)
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new XMIDecoder(eContext, options)
    }
}
