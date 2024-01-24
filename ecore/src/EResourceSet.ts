// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ENotifier, EResource, EList, EObject, EURIConverter, EPackageRegistry, ECodecRegistry, URI } from "./internal"

export class EResourceSetConstants {
    public static readonly RESOURCE_SET__RESOURCES: number = 0
}

export interface EResourceSet extends ENotifier {
    getResources(): EList<EResource>
    getResource(uri: URI, loadOnDemand: boolean): EResource
    createResource(uri: URI): EResource

    getEObject(uri: URI, loadOnDemand: boolean): EObject

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
    return o == undefined ? undefined : typeof o["getResources"] === "function"
}
