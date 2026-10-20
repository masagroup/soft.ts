// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import stream from "stream"
import { EURIHandler, getURIConverterRegistry, URI, uriToFilePath } from "./internal.js"

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

type FS = typeof import("fs")

// the fs module, loaded synchronously when the runtime allows it (node >= 20.16 or 22.3), else
// asynchronously: the synchronous methods of the handler fail until it is loaded
let fsModule: FS | undefined = undefined
let fsError: unknown = undefined

function loadFSSync(): FS | undefined {
    try {
        const p: any = (globalThis as any).process
        return typeof p?.getBuiltinModule === "function" ? p.getBuiltinModule("fs") : undefined
    } catch {
        return undefined
    }
}

fsModule = loadFSSync()
const fsPromise: Promise<FS | undefined> = fsModule
    ? Promise.resolve(fsModule)
    : import("fs").then(
          (m: any) => (fsModule = m.default ?? m),
          (e) => {
              fsError = e
              return undefined
          }
      )

function getFSSync(): FS {
    if (fsModule) {
        return fsModule
    }
    if (fsError) {
        throw new Error(`file system is not supported: ${fsError}`)
    }
    throw new Error("file system is not loaded yet: await a load or a save before a synchronous one")
}

async function getFS(): Promise<FS> {
    const fs = await fsPromise
    if (!fs) {
        throw new Error(`file system is not supported: ${fsError}`)
    }
    return fs
}

export class FileURIHandler implements EURIHandler {
    canHandle(uri: URI): boolean {
        return uri.scheme == "file" || (!uri.scheme && !uri.host && !uri.query)
    }

    async createReadStream(uri: URI): Promise<ReadableStream<Uint8Array> | null> {
        const fs = await getFS()
        const path = uriToFilePath(uri)
        return fs.existsSync(path) ? readableNodeStreamToWebStream(fs.createReadStream(path)) : null
    }

    async createWriteStream(uri: URI): Promise<WritableStream<Uint8Array> | null> {
        const fs = await getFS()
        const path = uriToFilePath(uri)
        return writableNodeStreamToWebStream(fs.createWriteStream(path))
    }

    readSync(uri: URI): Uint8Array {
        const fs = getFSSync()
        const path = uriToFilePath(uri)
        return fs.existsSync(path) ? fs.readFileSync(path) : null
    }

    writeSync(uri: URI, b: Uint8Array): void {
        const fs = getFSSync()
        const path = uriToFilePath(uri)
        fs.writeFileSync(path, b)
    }
}

getURIConverterRegistry().getURIHandlers().add(new FileURIHandler())
