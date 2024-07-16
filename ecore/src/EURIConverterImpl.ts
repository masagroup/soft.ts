// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import { EList, EURIConverter, EURIHandler, FileURIHandler, ImmutableEList, URI } from "./internal.js"

export class EURIConverterImpl implements EURIConverter {
    private _uriHandlers: EList<EURIHandler>
    private _uriMap: Map<URI, URI>

    constructor() {
        this._uriHandlers = new ImmutableEList<EURIHandler>([new FileURIHandler()])
        this._uriMap = new Map<URI, URI>()
    }
    getURIMap(): Map<URI, URI> {
        return this._uriMap
    }

    createReadStream(uri: URI): fs.ReadStream {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.createReadStream(normalized) : null
    }

    createWriteStream(uri: URI): fs.WriteStream {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.createWriteStream(normalized) : null
    }

    readSync(uri: URI): null | Buffer {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
        return uriHandler ? uriHandler.readSync(normalized) : null
    }

    writeSync(uri: URI, s: Buffer): void {
        let normalized = this.normalize(uri)
        let uriHandler = this.getURIHandler(normalized)
        if (uriHandler) {
            uriHandler.writeSync(normalized, s)
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
