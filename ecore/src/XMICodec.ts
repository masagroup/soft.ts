// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ECodec } from "./ECodec.js"
import { EDecoder } from "./EDecoder.js"
import { EEncoder } from "./EEncoder.js"
import { EResource } from "./EResource.js"
import { XMIDecoder } from "./XMIDecoder.js"
import { XMIEncoder } from "./XMIEncoder.js"

export class XMICodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new XMIEncoder(eContext, options)
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new XMIDecoder(eContext, options)
    }
}
