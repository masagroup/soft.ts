// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EFactory, EPackage, EPackageRegistry, getEcorePackage } from "./internal.js"

function factoryNsURI(factory: EFactory): string {
    const ePackage = factory.getEPackage()
    if (!ePackage) {
        throw new Error("the factory has no package")
    }
    return ePackage.getNsURI()
}

export class EPackageRegistryImpl implements EPackageRegistry {
    private _packages: Map<string, EPackage>
    private _factories: Map<string, EFactory> = null
    private _delegate: EPackageRegistry
    private static _instance = null

    public static getInstance(): EPackageRegistryImpl {
        if (!this._instance) {
            this._instance = new EPackageRegistryImpl()
            this._instance.registerPackage(getEcorePackage())
        }
        return this._instance
    }

    constructor(delegate: EPackageRegistry = null) {
        this._packages = new Map<string, EPackage>()
        this._delegate = delegate
    }

    registerPackage(pack: EPackage): void {
        this._packages.set(pack.getNsURI(), pack)
    }
    unregisterPackage(pack: EPackage): void {
        this._packages.delete(pack.getNsURI())
    }

    getPackage(nsURI: string): EPackage {
        const p = this._packages.get(nsURI)
        if (p) {
            return p
        } else {
            if (this._delegate) {
                return this._delegate.getPackage(nsURI)
            }
        }
        return null
    }

    putFactory(nsURI: string, factory: EFactory): void {
        if (!this._factories) {
            this._factories = new Map<string, EFactory>()
        }
        this._factories.set(nsURI, factory)
    }

    removeFactory(nsURI: string): void {
        this._factories?.delete(nsURI)
    }

    registerFactory(factory: EFactory): void {
        this.putFactory(factoryNsURI(factory), factory)
    }

    unregisterFactory(factory: EFactory): void {
        this.removeFactory(factoryNsURI(factory))
    }

    getFactory(nsURI: string): EFactory {
        const f = this._factories?.get(nsURI)
        if (f) {
            return f
        }
        const p = this._packages.get(nsURI)
        if (p) {
            return p.getEFactoryInstance()
        } else {
            if (this._delegate) {
                return this._delegate.getFactory(nsURI)
            }
        }
        return null
    }
}
