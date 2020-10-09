// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";

export interface EURIHandler {
    canHandle(uri: URL): boolean;

    createReadStream(uri: URL): fs.ReadStream;

    createWriteStream(uri: URL): fs.WriteStream;
}
