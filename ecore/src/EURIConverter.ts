// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs"
import { EList, EURIHandler, URI } from "./internal.js"

export interface EURIConverter {
    createReadStream(uri: URI): fs.ReadStream

    createWriteStream(uri: URI): fs.WriteStream

    readSync(uri: URI): null | Buffer

    writeSync(uri: URI, s: Buffer): void

    normalize(uri: URI): URI

    getURIHandler(uri: URI): EURIHandler

    getURIHandlers(): EList<EURIHandler>
}
