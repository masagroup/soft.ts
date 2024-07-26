// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import stream from "stream"
import { EURIHandler, URI, uriToFilePath } from "./internal.js"

function readableNodeStreamToWebStream(stream: stream.Readable): ReadableStream {
    return new ReadableStream({
        async pull(controller) {
            for await (const chunk of stream) {
                controller.enqueue(new Uint8Array(chunk))
            }
            controller.close()
        }
    })
}

function writableNodeStreamToWebStream(stream: stream.Writable): WritableStream {
    return new WritableStream({
        write(chunk, controller) {
            stream.write(chunk)
        },
        close() {
            stream.end()
        },
        abort(err) {
            stream.destroy(err)
        }
    })
}

export class FileURIHandler implements EURIHandler {
    canHandle(uri: URI): boolean {
        return uri.scheme == "file" || (!uri.scheme && !uri.host && !uri.query)
    }

    async createReadStream(uri: URI): Promise<ReadableStream<Uint8Array> | null> {
        const path = uriToFilePath(uri)
        return fs.existsSync(path) ? readableNodeStreamToWebStream(fs.createReadStream(path)) : null
    }

    async createWriteStream(uri: URI): Promise<WritableStream<Uint8Array> | null> {
        const path = uriToFilePath(uri)
        return writableNodeStreamToWebStream(fs.createWriteStream(path))
    }

    readSync(uri: URI): Uint8Array {
        const path = uriToFilePath(uri)
        return fs.existsSync(path) ? fs.readFileSync(path) : null
    }

    writeSync(uri: URI, b: Uint8Array): void {
        const path = uriToFilePath(uri)
        fs.writeFileSync(path, b)
    }
}
