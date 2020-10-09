// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EResource, EResourceFactory, XMLResource } from "./internal";

export class XMLResourceFactory implements EResourceFactory {
    createResource(uri: URL): EResource {
        let r = new XMLResource();
        r.eURI = uri;
        return r;
    }
}
