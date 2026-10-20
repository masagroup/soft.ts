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

    protected didAdd(index: number, e: EResource): void {
        super.didAdd(index, e)
        if (e) this._resourceSet.indexResource(e, e.getURI())
    }

    protected didRemove(index: number, e: EResource): void {
        super.didRemove(index, e)
        if (e) this._resourceSet.unindexResource(e)
    }

    protected didSet(index: number, newE: EResource, oldE: EResource): void {
        super.didSet(index, newE, oldE)
        if (oldE) this._resourceSet.unindexResource(oldE)
        if (newE) this._resourceSet.indexResource(newE, newE.getURI())
    }

    protected didClear(elements: EResource[]): void {
        this._resourceSet.clearResourceIndex()
    }
}

export class EResourceSetImpl extends ENotifierImpl implements EResourceSet {
    private _resources: EList<EResource>
    private _uriConverter: EURIConverter
    private _uriResourceMap: Map<string, EResource>
    private _resourceIndex: Map<string, EResource> = null
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

        const resource = this.getIndexedResource(uri)
        if (resource) {
            if (loadOnDemand && !resource.isLoaded()) {
                resource.loadSync()
            }
            if (this._uriResourceMap) {
                this._uriResourceMap.set(uri.toString(), resource)
            }
            return resource
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

        const resource = this.getIndexedResource(uri)
        if (resource) {
            if (loadOnDemand && !resource.isLoaded()) {
                await resource.load()
            }
            if (this._uriResourceMap) {
                this._uriResourceMap.set(uri.toString(), resource)
            }
            return resource
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
        // the index is keyed by normalized uri : rebuild it with the new converter
        this._resourceIndex = null
        for (const resource of this._resources) {
            this.indexResource(resource, resource.getURI())
        }
    }

    // the resource of the set whose uri, once normalized by the uri converter, is uri normalized,
    // or null. The resources are indexed by uri and by normalized uri, and the list of the
    // resources is only scanned when the index cannot answer.
    private getIndexedResource(uri: URI): EResource {
        // same uri : no normalization needed
        const resource = this._resourceIndex?.get(uri.toString())
        if (resource && uri.equals(resource.getURI())) {
            return resource
        }
        const normalizedURI = this._uriConverter.normalize(uri)
        const normalizedResource = this._resourceIndex?.get(normalizedURI.toString())
        if (normalizedResource) {
            // the uri map of the converter may have changed since the resource was indexed
            const resourceURI = normalizedResource.getURI()
            if (resourceURI && (resourceURI.equals(uri) || this._uriConverter.normalize(resourceURI).equals(normalizedURI))) {
                return normalizedResource
            }
        }
        // a uri the index can not answer : scan the resources
        for (const resource of this._resources) {
            const resourceURI = resource.getURI()
            if (resourceURI && this._uriConverter.normalize(resourceURI).equals(normalizedURI)) {
                this.setIndexedResource(normalizedURI.toString(), resource)
                return resource
            }
        }
        return null
    }

    // registers resource, whose uri is uri, in the index of the resources of the set, by uri and
    // by normalized uri. The first resource indexed for a uri is kept, as the first resource of
    // the list is the one getResource returns.
    indexResource(resource: EResource, uri: URI): void {
        if (!uri) {
            return
        }
        const key = uri.toString()
        if (!this._resourceIndex?.has(key)) {
            this.setIndexedResource(key, resource)
        }
        const normalizedKey = this._uriConverter.normalize(uri).toString()
        if (!this._resourceIndex.has(normalizedKey)) {
            this.setIndexedResource(normalizedKey, resource)
        }
    }

    // removes resource from the index of the resources of the set. Another resource of the set
    // with the same uri, if any, is indexed again by the next getResource that scans the list.
    unindexResource(resource: EResource): void {
        if (this._resourceIndex) {
            for (const [key, indexed] of this._resourceIndex) {
                if (indexed == resource) {
                    this._resourceIndex.delete(key)
                }
            }
        }
    }

    clearResourceIndex(): void {
        this._resourceIndex = null
    }

    // called by a resource of the set when its uri changes
    resourceURIChanged(resource: EResource, newURI: URI): void {
        this.unindexResource(resource)
        this.indexResource(resource, newURI)
    }

    private setIndexedResource(key: string, resource: EResource) {
        if (!this._resourceIndex) {
            this._resourceIndex = new Map<string, EResource>()
        }
        this._resourceIndex.set(key, resource)
    }
}
