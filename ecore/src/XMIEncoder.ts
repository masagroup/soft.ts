// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EResource } from "./internal"
import { XMIConstants } from "./XMIConstants"
import { XMLEncoder } from "./XMLEncoder"

export class XMIEncoder extends XMLEncoder {
    private _xmiVersion: string

    constructor(resource: EResource, options: Map<string, any>) {
        super(resource, options)
        this._xmiVersion = "2.0"
    }

    getXMIVersion(): string {
        return this._xmiVersion
    }

    setXMIVersion(xmiVersion: string) {
        this._xmiVersion = xmiVersion
    }

    protected saveNamespaces() {
        this._str.addAttribute(XMIConstants.xmiNS + ":" + XMIConstants.versionAttrib, this._xmiVersion)
        this._str.addAttribute(XMIConstants.xmlNS + ":" + XMIConstants.xmiNS, XMIConstants.xmiURI)
        super.saveNamespaces()
    }
}
