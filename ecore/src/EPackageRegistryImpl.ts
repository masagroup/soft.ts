// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EPackageRegistry } from "./EPackageRegistry";
import { EFactory } from "./EFactory";
import { EPackage } from "./EPackage";

export class EPackageRegistryImpl implements EPackageRegistry {
    private _packages: Map<string, EPackage>;
    private _delegate: EPackageRegistry;

    constructor(delegate: EPackageRegistry = null) {
        this._packages = new Map<string, EPackage>();
        this._delegate = delegate;
    }

    registerPackage(pack: EPackage): void {
        this._packages.set(pack.nsURI, pack);
    }
    unregisterPackage(pack: EPackage): void {
        this._packages.delete(pack.nsURI);
    }

    getPackage(nsURI: string): EPackage {
        let p = this._packages.get(nsURI);
        if (p) {
            return p;
        } else {
            if (this._delegate) {
                return this._delegate.getPackage(nsURI);
            }
        }
        return null;
    }

    getFactory(nsURI: string): EFactory {
        let p = this._packages.get(nsURI);
        if (p) {
            return p.eFactoryInstance;
        } else {
            if (this._delegate) {
                return this._delegate.getFactory(nsURI);
            }
        }
        return null;
    }
}
