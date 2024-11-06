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
    private static _instance : EURIConverterImpl = new EURIConverterImpl()

    constructor(delegate?: EURIConverter) {
        this._delegate = delegate
        this._uriHandlers = new BasicEList<EURIHandler>()
        this._uriMap = new Map<URI, URI>()
    }

    static getInstance() : EURIConverterImpl {
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
        const normalized = this.getURIFromMap(uri)
        return uri == normalized ? normalized : this.normalize(normalized)
    }

    getURIMap(): Map<URI, URI> {
        return this._uriMap
    }

    private getURIFromMap(uri: URI): URI {
        const uriMap = this._delegate ? new Map([...this._delegate.getURIMap().entries(), ...this.getURIMap().entries()])
            : this.getURIMap()
        for (const [oldPrefix, newPrefix] of uriMap) {
            const r = uri.replacePrefix(oldPrefix, newPrefix)
            if (r) {
                return r
            }
        }
        return uri
    }
}
