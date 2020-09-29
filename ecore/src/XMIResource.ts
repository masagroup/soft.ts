// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EObject, XMLResource, XMLLoad, XMLSave } from "./internal";

class XMIConstants {
    static xmiURI = "http://www.omg.org/XMI";
    static xmiNS = "xmi";
    static versionAttrib = "version";
    static uuidAttrib = "uuid";
    static typeAttrib = "type";
}

export class XMIResource extends XMLResource {
    xmiVersion: string = "";

    protected createLoad(): XMLLoad {
        return new XMILoad(this);
    }

    protected createSave(): XMLSave {
        return new XMISave(this);
    }
}

export class XMILoad extends XMLLoad {
    constructor(resource: XMIResource) {
        super(resource);
        this._notFeatures.push(
            { uri: XMIConstants.xmiURI, local: XMIConstants.typeAttrib },
            { uri: XMIConstants.xmiURI, local: XMIConstants.versionAttrib },
            { uri: XMIConstants.xmiURI, local: XMIConstants.uuidAttrib }
        );
    }

    protected getXSIType(): string {
        let xsiType = super.getXSIType();
        if ((xsiType == null || xsiType.length == 0) && this._attributes) {
            return this.getAttributeValue(XMIConstants.xmiURI, XMIConstants.typeAttrib);
        }
        return xsiType;
    }

    protected handleAttributes(object: EObject) {
        let version = this.getAttributeValue(XMIConstants.xmiURI, XMIConstants.versionAttrib);
        if (version && version.length > 0) {
            (this._resource as XMIResource).xmiVersion = version;
        }
        super.handleAttributes(object);
    }
}

export class XMISave extends XMLSave {
    constructor(resource: XMIResource) {
        super(resource);
    }
}
