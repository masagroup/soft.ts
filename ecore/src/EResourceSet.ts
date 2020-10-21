// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import {
    ENotifier,
    EResource,
    EList,
    EObject,
    EURIConverter,
    EPackageRegistry,
    EResourceFactoryRegistry,
} from "./internal";

export class EResourceSetConstants {
    public static readonly RESOURCE_SET__RESOURCES: number = 0;
}

export interface EResourceSet extends ENotifier {
    getResources(): EList<EResource>;
    getResource(uri: URL, loadOnDemand: boolean): EResource;
    createResource(uri: URL): EResource;

    getEObject(uri: URL, loadOnDemand: boolean): EObject;

    getURIConverter(): EURIConverter;
    setURIConverter(uriConverter: EURIConverter): void;

    getPackageRegistry(): EPackageRegistry;
    setPackageRegistry(packageRegistry: EPackageRegistry): void;

    geResourceFactoryRegistry(): EResourceFactoryRegistry;
    setResourceFactoryRegistry(resourceFactoryRegistry: EResourceFactoryRegistry): void;

    getURIResourceMap(): Map<string, EResource>;
    setURIResourceMap(uriMap: Map<string, EResource>): void;
}

export function isEResourceSet(o: any): o is EResourceSet {
    return o == undefined ? undefined : typeof o["getResources"] === "function";
}
