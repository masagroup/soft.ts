// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import { EURIHandler } from "./EURIHandler";
import { EList } from "./EList";
import { EURIConverter } from "./EURIConverter";
import { ImmutableEList } from "./ImmutableEList";
import { FileURIHandler } from "./FileURIHandler";


export class EURIConverterImpl implements EURIConverter {

    private _uriHandlers: EList<EURIHandler>;

    constructor() {
        this._uriHandlers = new ImmutableEList<EURIHandler>([new FileURIHandler()]);
    }

    createReadStream(uri: URL): fs.ReadStream {
        let uriHandler = this.getURIHandler(uri);
        return uriHandler ? uriHandler.createReadStream(uri) : null;
    }

    createWriteStream(uri: URL): fs.WriteStream {
        let uriHandler = this.getURIHandler(uri);
        return uriHandler ? uriHandler.createWriteStream(uri) : null;
    }

    normalize(uri: URL): URL {
        return uri;
    }

    getURIHandler(uri: URL): EURIHandler {
        for (const uriHandler of this._uriHandlers) {
            if ( uriHandler.canHandle(uri) ) {
                return uriHandler;
            }
        }
        return null;
    }

    getURIHandlers(): EList<EURIHandler> {
        return this._uriHandlers;
    }
}


