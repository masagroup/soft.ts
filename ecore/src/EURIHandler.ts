// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import { URI } from "./URI.js"

export interface EURIHandler {
    canHandle(uri: URI): boolean

    createReadStream(uri: URI): fs.ReadStream

    createWriteStream(uri: URI): fs.WriteStream

    readSync(uri: URI): null | Buffer

    writeSync(uri: URI, s: Buffer): void
}
