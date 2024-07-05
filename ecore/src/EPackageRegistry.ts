// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EPackage, EFactory, EPackageRegistryImpl } from "./internal.js"

export interface EPackageRegistry {
    registerPackage(pack: EPackage): void
    unregisterPackage(pack: EPackage): void

    getPackage(nsURI: string): EPackage
    getFactory(nsURI: string): EFactory
}

export function getPackageRegistry(): EPackageRegistry {
    return EPackageRegistryImpl.getInstance()
}
