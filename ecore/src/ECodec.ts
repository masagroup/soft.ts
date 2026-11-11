// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EDecoder } from "./EDecoder.js"
import { EEncoder } from "./EEncoder.js"
import { EResource } from "./EResource.js"

// CODEC_TEXT_OPTION is set by EResource.loadFromString and saveToString: the bytes are the UTF-8 of a
// text, whatever encoding the document declares. The XML codec reads them as UTF-8, and writes the
// characters the encoding of the document cannot represent as character references.
export const CODEC_TEXT_OPTION = "TEXT"

export interface ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder
}
