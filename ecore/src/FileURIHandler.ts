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
        return (
            uri.protocol == "file:" ||
            (uri.protocol == null && uri.host == null && uri.search == null)
        );
    }

    createReadStream(uri: URL): fs.ReadStream {
        return fs.createReadStream(uri);
    }

    createWriteStream(uri: URL): fs.WriteStream {
        return fs.createWriteStream(uri);
    }
}
