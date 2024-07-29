// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    ECodecRegistry,
    EList,
    ENotifier,
    EObject,
    EPackageRegistry,
    EResource,
    EURIConverter,
    URI
} from "./internal.js"

export class EResourceSetConstants {
    public static readonly RESOURCE_SET__RESOURCES: number = 0
}

export interface EResourceSet extends ENotifier {
    createResource(uri: URI): EResource

    getResources(): EList<EResource>

    getResource(uri: URI, loadOnDemand: boolean): EResource
    getResourceAsync(uri: URI, loadOnDemand: boolean): Promise<EResource>

    getEObject(uri: URI, loadOnDemand: boolean): EObject
    getEObjectAsync(uri: URI, loadOnDemand: boolean): Promise<EObject>

    getURIConverter(): EURIConverter
    setURIConverter(uriConverter: EURIConverter): void

    getPackageRegistry(): EPackageRegistry
    setPackageRegistry(packageRegistry: EPackageRegistry): void

    getCodecRegistry(): ECodecRegistry
    setCodecRegistry(resourceCodecRegistry: ECodecRegistry): void

    getURIResourceMap(): Map<string, EResource>
    setURIResourceMap(uriMap: Map<string, EResource>): void
}

export function isEResourceSet(o: any): o is EResourceSet {
    return o == undefined ? undefined : "getResources" in o
}
