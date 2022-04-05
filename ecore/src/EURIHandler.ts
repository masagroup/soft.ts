// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs";

export interface EURIHandler {
    canHandle(uri: URL): boolean;

    createReadStream(uri: URL): fs.ReadStream;

    createWriteStream(uri: URL): fs.WriteStream;

    readSync(uri: URL): null | string | Buffer;

    writeSync(uri: URL, s: string | Buffer): void;
}
