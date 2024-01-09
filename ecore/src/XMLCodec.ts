// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EResource } from "./EResource";
import { ECodec } from "./ECodec";
import { EDecoder } from "./EDecoder";
import { EEncoder } from "./EEncoder";
import { XMLDecoder } from "./XMLDecoder";
import { XMLEncoder } from "./XMLEncoder";

export class XMLOptions {
    static EXTENDED_META_DATA = "EXTENDED_META_DATA";
    static SUPPRESS_DOCUMENT_ROOT = "SUPPRESS_DOCUMENT_ROOT";
    static DEFERRED_REFERENCE_RESOLUTION = "DEFERRED_REFERENCE_RESOLUTION";
    static DEFERRED_ROOT_ATTACHMENT = "DEFERRED_ROOT_ATTACHMENT";
    static ID_ATTRIBUTE_NAME = "ID_ATTRIBUTE_NAME";
    static ROOT_OBJECTS = "ROOT_OBJECTS";
}

export class XMLCodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new XMLEncoder(eContext, options);
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new XMLDecoder(eContext, options);
    }
}
