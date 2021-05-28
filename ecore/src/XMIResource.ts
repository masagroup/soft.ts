// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EObject, XMLResource, XMLResourceImpl, XMLLoad, XMLSave } from "./internal";

class XMIConstants {
    static xmiURI = "http://www.omg.org/XMI";
    static xmiNS = "xmi";
    static versionAttrib = "version";
    static uuidAttrib = "uuid";
    static typeAttrib = "type";
    static xmlNS = "xmlns";
}

export interface XMIResource extends XMLResource {
    xmiVersion: string;
}

export class XMIResourceImpl extends XMLResourceImpl implements XMIResource {
    private _xmiVersion: string = "";

    public get xmiVersion(): string {
        return this._xmiVersion;
    }
    public set xmiVersion(v: string) {
        this._xmiVersion = v;
    }

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

    protected saveNamespaces() {
        this._str.addAttribute(
            XMIConstants.xmiNS + ":" + XMIConstants.versionAttrib,
            (this._resource as XMIResource).xmiVersion
        );
        this._str.addAttribute(XMIConstants.xmlNS + ":" + XMIConstants.xmiNS, XMIConstants.xmiURI);
        super.saveNamespaces();
    }
}
