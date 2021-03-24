// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EResourceFactory,
    EResourceFactoryRegistry,
    XMIResourceFactory,
    XMLResourceFactory,
} from "./internal";

export class EResourceFactoryRegistryImpl implements EResourceFactoryRegistry {
    private _protocolToFactory: Map<string, EResourceFactory>;
    private _extensionToFactory: Map<string, EResourceFactory>;
    private static _instance: EResourceFactoryRegistryImpl = null;

    public static getInstance(): EResourceFactoryRegistryImpl {
        if (!this._instance) {
            this._instance = new EResourceFactoryRegistryImpl();
        }
        return this._instance;
    }

    private constructor() {
        this._protocolToFactory = new Map<string, EResourceFactory>();
        this._extensionToFactory = new Map<string, EResourceFactory>();
        this._extensionToFactory.set("ecore", new XMIResourceFactory());
        this._extensionToFactory.set("xml", new XMLResourceFactory());
    }

    getFactory(uri: URL): EResourceFactory {
        let factory = this._protocolToFactory.get(uri.protocol);
        if (factory) {
            return factory;
        }
        let ndx = uri.pathname.lastIndexOf(".");
        if (ndx != -1) {
            let extension = uri.pathname.slice(ndx + 1);
            factory = this._extensionToFactory.get(extension);
            if (factory) {
                return factory;
            }
        }
        factory = this._extensionToFactory.get("*");
        return factory ? factory : null;
    }

    getProtocolToFactoryMap(): Map<string, EResourceFactory> {
        return this._protocolToFactory;
    }

    getExtensionToFactoryMap(): Map<string, EResourceFactory> {
        return this._extensionToFactory;
    }
}
