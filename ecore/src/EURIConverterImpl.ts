// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs"
import { EList, EURIConverter, EURIHandler, FileURIHandler, ImmutableEList, URI } from "./internal"

export class EURIConverterImpl implements EURIConverter {
    private _uriHandlers: EList<EURIHandler>

    constructor() {
        this._uriHandlers = new ImmutableEList<EURIHandler>([new FileURIHandler()])
    }

    createReadStream(uri: URI): fs.ReadStream {
        let uriHandler = this.getURIHandler(uri)
        return uriHandler ? uriHandler.createReadStream(uri) : null
    }

    createWriteStream(uri: URI): fs.WriteStream {
        let uriHandler = this.getURIHandler(uri)
        return uriHandler ? uriHandler.createWriteStream(uri) : null
    }

    readSync(uri: URI): null | Buffer {
        let uriHandler = this.getURIHandler(uri)
        return uriHandler ? uriHandler.readSync(uri) : null
    }

    writeSync(uri: URI, s: Buffer): void {
        let uriHandler = this.getURIHandler(uri)
        if (uriHandler) {
            uriHandler.writeSync(uri, s)
        }
    }

    normalize(uri: URI): URI {
        return uri
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
}
