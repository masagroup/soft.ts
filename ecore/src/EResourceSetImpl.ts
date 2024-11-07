// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { ECodecRegistryImpl } from "./ECodecRegistryImpl.js"
import { EResourceImpl } from "./EResourceImpl.js"
import {
    AbstractNotifyingList,
    ECodecRegistry,
    EList,
    ENotificationChain,
    ENotifier,
    ENotifierImpl,
    EObject,
    EPackageRegistry,
    EPackageRegistryImpl,
    EResource,
    EResourceInternal,
    EResourceSet,
    EResourceSetConstants,
    EStructuralFeature,
    EURIConverter,
    EURIConverterImpl,
    getCodecRegistry,
    getPackageRegistry,
    getURIConverterRegistry,
    URI
} from "./internal.js"

class ResourcesList extends AbstractNotifyingList<EResource> {
    constructor(private _resourceSet: EResourceSetImpl) {
        super()
    }

    getNotifier(): ENotifier {
        return this._resourceSet
    }

    getFeature(): EStructuralFeature {
        return null
    }

    getFeatureID(): number {
        return EResourceSetConstants.RESOURCE_SET__RESOURCES
    }

    protected inverseAdd(e: EResource, notifications: ENotificationChain): ENotificationChain {
        return (e as EResourceInternal).basicSetResourceSet(this._resourceSet, notifications)
    }

    protected inverseRemove(e: EResource, notifications: ENotificationChain): ENotificationChain {
        return (e as EResourceInternal).basicSetResourceSet(null, notifications)
    }
}

export class EResourceSetImpl extends ENotifierImpl implements EResourceSet {
    private _resources: EList<EResource>
    private _uriConverter: EURIConverter
    private _uriResourceMap: Map<string, EResource>
    private _resourceCodecRegistry: ECodecRegistry
    private _packageRegistry: EPackageRegistry

    constructor() {
        super()
        this._resources = new ResourcesList(this)
        this._uriConverter = new EURIConverterImpl(getURIConverterRegistry())
        this._resourceCodecRegistry = new ECodecRegistryImpl(getCodecRegistry())
        this._packageRegistry = new EPackageRegistryImpl(getPackageRegistry())
        this._uriResourceMap = null
    }

    getPackageRegistry(): EPackageRegistry {
        return this._packageRegistry
    }

    setPackageRegistry(packageRegistry: EPackageRegistry): void {
        this._packageRegistry = packageRegistry
    }

    getCodecRegistry(): ECodecRegistry {
        return this._resourceCodecRegistry
    }

    setCodecRegistry(resourceCodecRegistry: ECodecRegistry): void {
        this._resourceCodecRegistry = resourceCodecRegistry
    }

    getURIResourceMap(): Map<string, EResource> {
        return this._uriResourceMap
    }

    setURIResourceMap(uriMap: Map<string, EResource>): void {
        this._uriResourceMap = uriMap
    }

    getResources(): EList<EResource> {
        return this._resources
    }

    createResource(uri: URI): EResource {
        const resource = new EResourceImpl()
        resource.setURI(uri)
        this._resources.add(resource)
        return resource
    }

    getResource(uri: URI, loadOnDemand: boolean): EResource {
        if (this._uriResourceMap) {
            const resource = this._uriResourceMap.get(uri.toString())
            if (resource) {
                if (loadOnDemand && !resource.isLoaded()) {
                    resource.loadSync()
                }
                return resource
            }
        }

        const normalizedURI = this._uriConverter.normalize(uri)
        for (const resource of this._resources) {
            const resourceURI = this._uriConverter.normalize(resource.getURI())
            if (resourceURI.equals(normalizedURI)) {
                if (loadOnDemand && !resource.isLoaded()) {
                    resource.loadSync()
                }
                if (this._uriResourceMap) {
                    this._uriResourceMap.set(uri.toString(), resource)
                }
                return resource
            }
        }

        const ePackage = this.getPackageRegistry().getPackage(uri.toString())
        if (ePackage) return ePackage.eResource()

        if (loadOnDemand) {
            const resource = this.createResource(uri)
            if (resource) {
                resource.loadSync()
            }
            if (this._uriResourceMap) {
                this._uriResourceMap.set(uri.toString(), resource)
            }
            return resource
        }

        return null
    }

    async getResourceAsync(uri: URI, loadOnDemand: boolean): Promise<EResource> {
        if (this._uriResourceMap) {
            const resource = this._uriResourceMap.get(uri.toString())
            if (resource) {
                if (loadOnDemand && !resource.isLoaded()) {
                    await resource.load()
                }
                return resource
            }
        }

        const normalizedURI = this._uriConverter.normalize(uri)
        for (const resource of this._resources) {
            const resourceURI = this._uriConverter.normalize(resource.getURI())
            if (resourceURI.equals(normalizedURI)) {
                if (loadOnDemand && !resource.isLoaded()) {
                    await resource.load()
                }
                if (this._uriResourceMap) {
                    this._uriResourceMap.set(uri.toString(), resource)
                }
                return resource
            }
        }

        const ePackage = this.getPackageRegistry().getPackage(uri.toString())
        if (ePackage) return ePackage.eResource()

        if (loadOnDemand) {
            const resource = this.createResource(uri)
            if (resource) {
                await resource.load()
            }
            if (this._uriResourceMap) {
                this._uriResourceMap.set(uri.toString(), resource)
            }
            return resource
        }

        return null
    }

    getEObject(uri: URI, loadOnDemand: boolean): EObject {
        const uriStr = uri.toString()
        const ndxHash = uriStr.lastIndexOf("#")
        const resource = this.getResource(ndxHash != -1 ? new URI(uriStr.slice(0, ndxHash)) : uri, loadOnDemand)
        return resource?.getEObject(ndxHash != -1 ? uriStr.slice(ndxHash + 1) : "")
    }

    async getEObjectAsync(uri: URI, loadOnDemand: boolean): Promise<EObject> {
        const uriStr = uri.toString()
        const ndxHash = uriStr.lastIndexOf("#")
        const resource = await this.getResourceAsync(ndxHash != -1 ? new URI(uriStr.slice(0, ndxHash)) : uri, loadOnDemand)
        return resource?.getEObject(ndxHash != -1 ? uriStr.slice(ndxHash + 1) : "")
    }

    getURIConverter(): EURIConverter {
        return this._uriConverter
    }

    setURIConverter(uriConverter: EURIConverter): void {
        this._uriConverter = uriConverter
    }
}
