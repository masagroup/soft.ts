// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EResource, EResourceFactory, XMIResource } from "./internal";

export class XMIResourceFactory implements EResourceFactory {
    createResource(uri: URL): EResource {
        let r = new XMIResource();
        r.eURI = uri;
        return r;
    }
}
