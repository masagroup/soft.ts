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
import { XMLOptions } from "./XMLCodec.js"

export class XMICodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new XMIEncoder(eContext, options)
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new XMIDecoder(eContext, options)
    }
}

// EcoreCodec is the XMI codec of the .ecore resources: as EMF's EcoreResourceFactoryImpl, it
// saves the cross resource references in the encoded attribute style and wraps the attributes at
// a line width of 80, unless the options of the save set XMLOptions.USE_ENCODED_ATTRIBUTE_STYLE
// or XMLOptions.LINE_WIDTH.
export class EcoreCodec extends XMICodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        const o = new Map<string, any>([
            [XMLOptions.USE_ENCODED_ATTRIBUTE_STYLE, true],
            [XMLOptions.LINE_WIDTH, 80]
        ])
        options?.forEach((value, key) => o.set(key, value))
        return new XMIEncoder(eContext, o)
    }
}
