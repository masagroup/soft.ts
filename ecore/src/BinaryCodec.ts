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
    static BINARY_OPTION_NAMESPACE_ATTRIBUTE = "NAMESPACE_ATTRIBUTE" // if true, namespaces informations are encoded
    static BINARY_OPTION_MAX_DEPTH = "MAX_DEPTH" // number, the maximum nesting of the objects a decoder reads (BINARY_DEFAULT_MAX_DEPTH)
    // BINARY_DEFAULT_MAX_DEPTH is the maximum nesting of the objects the decoder reads when
    // BINARY_OPTION_MAX_DEPTH is not given. An object is decoded inside the object that first refers
    // to it, by containment or by a plain reference, so the nesting of a resource is the length of
    // its longest chain of first references: a deeper input is refused with an error. The stack of
    // the javascript engine may be exhausted before: that is an error of the decoding too.
    static BINARY_DEFAULT_MAX_DEPTH = 100_000
}

export class BinaryCodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new BinaryEncoder(eContext, options)
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new BinaryDecoder(eContext, options)
    }
}
