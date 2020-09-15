// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { XMLResource, XMLLoad, XMLSave } from "./XMLResource";

export class XMIResource extends XMLResource {
    version: string = "";

    protected createLoad(): XMLLoad {
        return new XMILoad(this);
    }

    protected createSave(): XMLSave {
        return new XMISave(this);
    }
}

export class XMILoad extends XMLLoad {
    constructor(resource: XMLResource) {
        super(resource);
    }
}

export class XMISave extends XMLSave {
    constructor(resource: XMLResource) {
        super(resource);
    }
}
