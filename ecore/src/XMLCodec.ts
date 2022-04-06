// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EResource } from "./EResource";
import { EResourceCodec } from "./EResourceCodec";
import { EResourceDecoder } from "./EResourceDecoder";
import { EResourceEncoder } from "./EResourceEncoder";

export class XMLOptions {
    static EXTENDED_META_DATA = "EXTENDED_META_DATA";
    static SUPPRESS_DOCUMENT_ROOT = "SUPPRESS_DOCUMENT_ROOT";
    static DEFERRED_REFERENCE_RESOLUTION = "DEFERRED_REFERENCE_RESOLUTION";
    static DEFERRED_ROOT_ATTACHMENT      = "DEFERRED_ROOT_ATTACHMENT";
    static ID_ATTRIBUTE_NAME = "ID_ATTRIBUTE_NAME";
    static ROOT_OBJECTS = "ROOT_OBJECTS";
}

export class XMLCodec implements EResourceCodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EResourceEncoder {
        throw new Error("Method not implemented.");
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EResourceDecoder {
        throw new Error("Method not implemented.");
    }
}
