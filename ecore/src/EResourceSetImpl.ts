// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractNotifyingList,
    EList,
    ENotificationChain,
    ENotifier,
    ENotifierImpl,
    EObject,
    EPackageRegistry,
    EPackageRegistryImpl,
    EResource,
    EResourceFactoryRegistry,
    EResourceInternal,
    EResourceSet,
    EResourceSetConstants,
    EStructuralFeature,
    EURIConverter,
    EURIConverterImpl,
    getPackageRegistry,
    getResourceFactoryRegistry,
} from "./internal";

class ResourcesList extends AbstractNotifyingList<EResource> {
    constructor(private _resourceSet: EResourceSetImpl) {
        super();
    }

    get notifier(): ENotifier {
        return this._resourceSet;
    }

    get feature(): EStructuralFeature {
        return null;
    }

    get featureID(): number {
        return EResourceSetConstants.RESOURCE_SET__RESOURCES;
    }

    protected inverseAdd(e: EResource, notifications: ENotificationChain): ENotificationChain {
        return (e as EResourceInternal).basicSetResourceSet(this._resourceSet, notifications);
    }

    protected inverseRemove(e: EResource, notifications: ENotificationChain): ENotificationChain {
        return (e as EResourceInternal).basicSetResourceSet(null, notifications);
    }
}

export class EResourceSetImpl extends ENotifierImpl implements EResourceSet {
    private _resources: EList<EResource>;
    private _uriConverter: EURIConverter;
    private _uriResourceMap: Map<string, EResource>;
    private _resourceFactoryRegistry: EResourceFactoryRegistry;
    private _packageRegistry: EPackageRegistry;

    constructor() {
        super();
        this._resources = new ResourcesList(this);
        this._uriConverter = new EURIConverterImpl();
        this._resourceFactoryRegistry = getResourceFactoryRegistry();
        this._packageRegistry = new EPackageRegistryImpl(getPackageRegistry());
        this._uriResourceMap = null;
    }

    getPackageRegistry(): EPackageRegistry {
        return this._packageRegistry;
    }

    setPackageRegistry(packageRegistry: EPackageRegistry): void {
        this._packageRegistry = packageRegistry;
    }

    geResourceFactoryRegistry(): EResourceFactoryRegistry {
        return this._resourceFactoryRegistry;
    }

    setResourceFactoryRegistry(resourceFactoryRegistry: EResourceFactoryRegistry): void {
        this._resourceFactoryRegistry = resourceFactoryRegistry;
    }

    getURIResourceMap(): Map<string, EResource> {
        return this._uriResourceMap;
    }

    setURIResourceMap(uriMap: Map<string, EResource>): void {
        this._uriResourceMap = uriMap;
    }

    getResources(): EList<EResource> {
        return this._resources;
    }

    getResource(uri: URL, loadOnDemand: boolean): EResource {
        if (this._uriResourceMap) {
            let resource = this._uriResourceMap.get(uri.toString());
            if (resource) {
                if (loadOnDemand && !resource.isLoaded) {
                    resource.loadSync();
                }
                return resource;
            }
        }

        let normalizedURI = this._uriConverter.normalize(uri);
        for (const resource of this._resources) {
            let resourceURI = this._uriConverter.normalize(resource.eURI);
            if (resourceURI.toString() == normalizedURI.toString()) {
                if (loadOnDemand && !resource.isLoaded) {
                    resource.loadSync();
                }
                if (this._uriResourceMap) {
                    this._uriResourceMap.set(uri.toString(), resource);
                }
                return resource;
            }
        }

        if (loadOnDemand) {
            let resource = this.createResource(uri);
            if (resource) {
                resource.loadSync();
            }
            return resource;
        }

        return null;
    }

    createResource(uri: URL): EResource {
        let resourceFactory = this._resourceFactoryRegistry.getFactory(uri);
        if (resourceFactory) {
            let resource = resourceFactory.createResource(uri);
            this._resources.add(resource);
            return resource;
        }
        return null;
    }

    getEObject(uri: URL, loadOnDemand: boolean): EObject {
        let uriStr = uri.toString();
        let ndxHash = uriStr.lastIndexOf("#");
        let resource = this.getResource(
            ndxHash != -1 ? new URL(uriStr.slice(0, ndxHash)) : uri,
            loadOnDemand
        );
        return resource
            ? resource.getEObject(ndxHash != -1 ? uriStr.slice(ndxHash + 1) : "")
            : null;
    }

    getURIConverter(): EURIConverter {
        return this._uriConverter;
    }

    setURIConverter(uriConverter: EURIConverter): void {
        this._uriConverter = uriConverter;
    }
}
