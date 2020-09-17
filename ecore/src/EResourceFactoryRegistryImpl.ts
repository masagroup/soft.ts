// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EResourceFactory } from "./EResourceFactory";
import { EResourceFactoryRegistry } from "./EResourceFactoryRegistry";
import { XMIResourceFactory } from "./XMIResourceFactory";
import { XMLResourceFactory } from "./XMLResourceFactory";

export class EResourceFactoryRegistryImpl implements EResourceFactoryRegistry {
    private _protocolToFactory: Map<string, EResourceFactory>;
    private _extensionToFactory: Map<string, EResourceFactory>;
    public instance: EResourceFactoryRegistryImpl = new EResourceFactoryRegistryImpl();

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
