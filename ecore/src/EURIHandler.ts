// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { URI } from "./URI.js"

export interface EURIHandler {
    canHandle(uri: URI): boolean

    createReadStream(uri: URI): Promise<ReadableStream<Uint8Array> | null>

    createWriteStream(uri: URI): Promise<WritableStream<Uint8Array> | null>

    readSync(uri: URI): Uint8Array

    writeSync(uri: URI, arr: Uint8Array): void
}
