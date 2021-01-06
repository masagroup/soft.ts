// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import { EURIHandler } from "./internal";

export class FileURIHandler implements EURIHandler {
    canHandle(uri: URL): boolean {
        return uri.protocol == "file:" || (!uri.protocol && uri.host && !uri.search);
    }

    createReadStream(uri: URL): fs.ReadStream {
        return fs.existsSync(uri) ? fs.createReadStream(uri) : null;
    }

    createWriteStream(uri: URL): fs.WriteStream {
        return fs.createWriteStream(uri);
    }

    readSync(uri: URL) : null | string {
        return fs.existsSync(uri) ? fs.readFileSync(uri).toString() : null;
    }

    writeSync(uri: URL, s: string ) {
        fs.writeFileSync(uri,s);
    }
}
