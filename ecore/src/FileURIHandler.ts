// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
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

    readSync(uri: URL): null | string {
        return fs.existsSync(uri) ? fs.readFileSync(uri).toString() : null;
    }

    writeSync(uri: URL, s: string) {
        fs.writeFileSync(uri, s);
    }
}
