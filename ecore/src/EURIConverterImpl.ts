// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { BasicEList, EList, EURIConverter, EURIHandler, FileURIHandler, URI } from "./internal.js"

export class EURIConverterImpl implements EURIConverter {
    private _uriHandlers: EList<EURIHandler>
    private _uriMap: Map<URI, URI>

    constructor() {
        this._uriHandlers = new BasicEList<EURIHandler>([new FileURIHandler()])
        this._uriMap = new Map<URI, URI>()
    }
    getURIMap(): Map<URI, URI> {
        return this._uriMap
    }

    async createReadStream(uri: URI): Promise<ReadableStream<Uint8Array> | null> {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.createReadStream(normalized) : null
    }

    async createWriteStream(uri: URI): Promise<WritableStream<Uint8Array> | null> {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.createWriteStream(normalized) : null
    }

    readSync(uri: URI): Uint8Array {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.readSync(normalized) : null
    }

    writeSync(uri: URI, arr: Uint8Array): void {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
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
        return null
    }

    getURIHandlers(): EList<EURIHandler> {
        return this._uriHandlers
    }

    normalize(uri: URI): URI {
        let normalized = this.getURIFromMap(uri)
        return uri == normalized ? normalized : this.normalize(normalized)
    }

    private getURIFromMap(uri: URI): URI {
        for (let [oldPrefix, newPrefix] of this._uriMap) {
            let r = uri.replacePrefix(oldPrefix, newPrefix)
            if (r) {
                return r
            }
        }
        return uri
    }
}
