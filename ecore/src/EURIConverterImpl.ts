// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BasicEList, EList, EURIConverter, EURIHandler, URI } from "./internal.js"

export class EURIConverterImpl implements EURIConverter {
    private _uriHandlers: EList<EURIHandler>
    private _uriMap: Map<URI, URI>
    private _delegate: EURIConverter
    private static _instance: EURIConverterImpl = new EURIConverterImpl()

    constructor(delegate?: EURIConverter) {
        this._delegate = delegate
        this._uriHandlers = new BasicEList<EURIHandler>()
        this._uriMap = new Map<URI, URI>()
    }

    static getInstance(): EURIConverterImpl {
        return this._instance
    }

    async createReadStream(uri: URI): Promise<ReadableStream<Uint8Array> | null> {
        const normalized = this.normalize(uri)
        const uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.createReadStream(normalized) : null
    }

    async createWriteStream(uri: URI): Promise<WritableStream<Uint8Array> | null> {
        const normalized = this.normalize(uri)
        const uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.createWriteStream(normalized) : null
    }

    readSync(uri: URI): Uint8Array {
        const normalized = this.normalize(uri)
        const uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.readSync(normalized) : null
    }

    writeSync(uri: URI, arr: Uint8Array): void {
        const normalized = this.normalize(uri)
        const uriHandler = this.getURIHandler(normalized)
        if (uriHandler) {
            uriHandler.writeSync(normalized, arr)
        }
    }

    getURIHandler(uri: URI): EURIHandler {
        for (const uriHandler of this._uriHandlers) {
            if (uriHandler.canHandle(uri)) {
                return uriHandler
            }
        }
        if (this._delegate) {
            return this._delegate.getURIHandler(uri)
        }
        return null
    }

    getURIHandlers(): EList<EURIHandler> {
        return this._uriHandlers
    }

    normalize(uri: URI): URI {
        // the uri is mapped until it does not change, or until a uri already met: a cycle of mappings
        let visited: Set<string> = null
        let current = uri
        for (;;) {
            const normalized = this.getURIFromMap(current)
            if (current.equals(normalized)) {
                return normalized
            }
            if (!visited) visited = new Set<string>()
            visited.add(current.toString())
            if (visited.has(normalized.toString())) {
                return current
            }
            current = normalized
        }
    }

    getURIMap(): Map<URI, URI> {
        return this._uriMap
    }

    // the uri with its prefix replaced by the first matching entry of the uri map of the
    // converter, else of the uri map of the delegate: the entries of the converter override
    // the ones of the delegate
    private getURIFromMap(uri: URI): URI {
        return replacePrefix(uri, this._uriMap) ?? (this._delegate ? replacePrefix(uri, this._delegate.getURIMap()) : null) ?? uri
    }
}

// replacePrefix maps uri with the longest prefix of uriMap matching it, as EMF does: the map
// iteration order does not choose between overlapping prefixes. A prefix matches whole path
// segments: it ends with '/', or the path of uri is the prefix or continues with '/'.
function replacePrefix(uri: URI, uriMap: Map<URI, URI>): URI {
    let result: URI = null
    let bestLength = -1
    let bestKey = ""
    const path = uri.path ?? ""
    for (const [oldPrefix, newPrefix] of uriMap) {
        const oldPath = oldPrefix.path ?? ""
        if (oldPath.length > 0 && !oldPath.endsWith("/") && path.length > oldPath.length && path[oldPath.length] != "/") {
            continue
        }
        const mapped = uri.replacePrefix(oldPrefix, newPrefix)
        if (mapped) {
            const key = oldPrefix.toString()
            if (oldPath.length > bestLength || (oldPath.length == bestLength && key < bestKey)) {
                result = mapped
                bestLength = oldPath.length
                bestKey = key
            }
        }
    }
    return result
}
