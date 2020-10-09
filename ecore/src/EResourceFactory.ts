// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EResource } from "./internal";

export interface EResourceFactory {
    createResource(uri: URL): EResource;
}
