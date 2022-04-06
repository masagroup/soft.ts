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
import { XMIDecoder } from "./XMIDecoder";
import { XMIEncoder } from "./XMIEncoder";

export class XMICodec implements EResourceCodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EResourceEncoder {
        return new XMIEncoder(eContext, options);
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EResourceDecoder {
        return new XMIDecoder(eContext, options);
    }
}
