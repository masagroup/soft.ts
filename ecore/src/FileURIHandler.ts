// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs"
import { EURIHandler, URI, uriToFilePath } from "./internal.js"

export class FileURIHandler implements EURIHandler {
    canHandle(uri: URI): boolean {
        return uri.scheme == "file" || (!uri.scheme && !uri.host && !uri.query)
    }

    createReadStream(uri: URI): fs.ReadStream {
        let path = uriToFilePath(uri)
        return fs.existsSync(path) ? fs.createReadStream(path) : null
    }

    createWriteStream(uri: URI): fs.WriteStream {
        let path = uriToFilePath(uri)
        return fs.createWriteStream(path)
    }

    readSync(uri: URI): null | Buffer {
        let path = uriToFilePath(uri)
        return fs.existsSync(path) ? fs.readFileSync(path) : null
    }

    writeSync(uri: URI, b: Buffer): void {
        let path = uriToFilePath(uri)
        fs.writeFileSync(path, b)
    }
}
