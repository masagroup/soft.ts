// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BinaryDecoder } from "./BinaryDecoder.js"
import { BinaryEncoder } from "./BinaryEncoder.js"
import { ECodec } from "./ECodec.js"
import { EDecoder } from "./EDecoder.js"
import { EEncoder } from "./EEncoder.js"
import { EResource } from "./EResource.js"

export class BinaryOptions {
    static BINARY_OPTION_ID_ATTRIBUTE = "ID_ATTRIBUTE" // if true, save id attribute of the object
    static BINARY_OPTION_CODEC_EXTENSION = "CODEC_EXTENSION" // msgpack codec extension object

}

export class BinaryCodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new BinaryEncoder(eContext, options)
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new BinaryDecoder(eContext, options)
    }
}
