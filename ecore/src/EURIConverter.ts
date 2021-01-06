// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import { EList, EURIHandler } from "./internal";

export interface EURIConverter {
    createReadStream(uri: URL): fs.ReadStream;

    createWriteStream(uri: URL): fs.WriteStream;

    readSync(uri: URL) : null | string;

    writeSync(uri: URL, s: string );

    normalize(uri: URL): URL;

    getURIHandler(uri: URL): EURIHandler;

    getURIHandlers(): EList<EURIHandler>;
}
