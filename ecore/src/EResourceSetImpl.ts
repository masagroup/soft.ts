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

    protected didMove(from: number, index: number, e: EResource): void {
        super.didMove(from, index, e)
        // the first resource of the list wins for a uri: the order of the resources changed
        this._resourceSet.reindexResources()
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
    // the keys of each resource in the resource index
    private _resourceKeys: Map<EResource, string[]> = null
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
        this.reindexResources()
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
    // by normalized uri. For a uri shared by several resources, the index keeps the first one
    // of the list, as it is the one getResource returns.
    indexResource(resource: EResource, uri: URI): void {
        if (!uri) {
            return
        }
        this.indexResourceKey(uri.toString(), resource)
        this.indexResourceKey(this._uriConverter.normalize(uri).toString(), resource)
    }

    // removes resource from the index of the resources of the set. Another resource of the set
    // with the same uri, if any, is indexed again by the next getResource that scans the list.
    unindexResource(resource: EResource): void {
        const keys = this._resourceKeys?.get(resource)
        if (keys) {
            for (const key of keys) {
                this._resourceIndex.delete(key)
            }
            this._resourceKeys.delete(resource)
        }
    }

    clearResourceIndex(): void {
        this._resourceIndex = null
        this._resourceKeys = null
    }

    // rebuilds the index of the resources of the set
    reindexResources(): void {
        this.clearResourceIndex()
        for (const resource of this._resources) {
            this.indexResource(resource, resource.getURI())
        }
    }

    // called by a resource of the set when its uri changes
    resourceURIChanged(resource: EResource, newURI: URI): void {
        this.unindexResource(resource)
        this.indexResource(resource, newURI)
    }

    private indexResourceKey(key: string, resource: EResource) {
        const indexed = this._resourceIndex?.get(key)
        if (indexed == resource) {
            return
        }
        if (indexed) {
            // keep the first resource of the list
            const indexedIndex = this._resources.indexOf(indexed)
            if (indexedIndex != -1 && indexedIndex < this._resources.indexOf(resource)) {
                return
            }
        }
        this.setIndexedResource(key, resource)
    }

    private setIndexedResource(key: string, resource: EResource) {
        if (!this._resourceIndex) {
            this._resourceIndex = new Map<string, EResource>()
            this._resourceKeys = new Map<EResource, string[]>()
        }
        const indexed = this._resourceIndex.get(key)
        if (indexed == resource) {
            return
        }
        if (indexed) {
            // the key moves from indexed to resource
            const indexedKeys = this._resourceKeys.get(indexed)
            const i = indexedKeys ? indexedKeys.indexOf(key) : -1
            if (i != -1) {
                indexedKeys.splice(i, 1)
            }
        }
        this._resourceIndex.set(key, resource)
        const keys = this._resourceKeys.get(resource)
        if (keys) {
            keys.push(key)
        } else {
            this._resourceKeys.set(resource, [key])
        }
    }
}
