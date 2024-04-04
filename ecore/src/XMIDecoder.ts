// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EObject, EResource } from "./internal"
import { XMIConstants } from "./XMIConstants"
import { XMLDecoder } from "./XMLDecoder"

export class XMIDecoder extends XMLDecoder {
    private _xmiVersion: string

    constructor(resource: EResource, options: Map<string, any>) {
        super(resource, options)
        this._xmiVersion = "2.0"
        this._notFeatures.push(
            { uri: XMIConstants.xmiURI, local: XMIConstants.typeAttrib },
            { uri: XMIConstants.xmiURI, local: XMIConstants.versionAttrib },
            { uri: XMIConstants.xmiURI, local: XMIConstants.uuidAttrib }
        )
    }

    getXMIVersion(): string {
        return this._xmiVersion
    }

    protected getXSIType(): string {
        let xsiType = super.getXSIType()
        if ((xsiType == null || xsiType.length == 0) && this._attributes) {
            return this.getAttributeValue(XMIConstants.xmiURI, XMIConstants.typeAttrib)
        }
        return xsiType
    }

    protected handleAttributes(object: EObject) {
        let version = this.getAttributeValue(XMIConstants.xmiURI, XMIConstants.versionAttrib)
        if (version && version.length > 0) {
            this._xmiVersion = version
        }
        super.handleAttributes(object)
    }
}
