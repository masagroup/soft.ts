// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EFactory, EPackage, EPackageRegistryImpl } from "./internal.js"

export interface EPackageRegistry {
    registerPackage(pack: EPackage): void
    // unregisterPackage removes the package; a factory registered for its nsURI is kept
    unregisterPackage(pack: EPackage): void

    // putFactory registers factory as the factory of the package nsURI: getFactory(nsURI)
    // returns it instead of the factory instance of the package. Several implementations
    // of one shared package each bring their own factory, and each registry picks one.
    putFactory(nsURI: string, factory: EFactory): void
    // removeFactory removes the factory registered for nsURI
    removeFactory(nsURI: string): void
    // registerFactory is putFactory keyed by the nsURI of the package of factory
    registerFactory(factory: EFactory): void
    // unregisterFactory is removeFactory keyed by the nsURI of the package of factory
    unregisterFactory(factory: EFactory): void

    getPackage(nsURI: string): EPackage
    // getFactory returns the factory registered for nsURI, else the factory instance of the
    // package nsURI, else the factory of the delegate registry
    getFactory(nsURI: string): EFactory
}

export function getPackageRegistry(): EPackageRegistry {
    return EPackageRegistryImpl.getInstance()
}
