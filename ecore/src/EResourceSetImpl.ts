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
    URI
} from "./internal.js"

class ResourcesList extends AbstractNotifyingList<EResource> {
    constructor(private _resourceSet: EResourceSetImpl) {
        super()
    }

    get notifier(): ENotifier {
        return this._resourceSet
    }

    get feature(): EStructuralFeature {
        return null
    }

    get featureID(): number {
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
        this._uriConverter = new EURIConverterImpl()
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
        let resource = new EResourceImpl()
        resource.eURI = uri
        this._resources.add(resource)
        return resource
    }

    getResource(uri: URI, loadOnDemand: boolean): EResource {
        if (this._uriResourceMap) {
            let resource = this._uriResourceMap.get(uri.toString())
            if (resource) {
                if (loadOnDemand && !resource.isLoaded) {
                    resource.loadSync()
                }
                return resource
            }
        }

        let normalizedURI = this._uriConverter.normalize(uri)
        for (const resource of this._resources) {
            let resourceURI = this._uriConverter.normalize(resource.eURI)
            if (resourceURI.toString() == normalizedURI.toString()) {
                if (loadOnDemand && !resource.isLoaded) {
                    resource.loadSync()
                }
                if (this._uriResourceMap) {
                    this._uriResourceMap.set(uri.toString(), resource)
                }
                return resource
            }
        }

        let ePackage = this.getPackageRegistry().getPackage(uri.toString())
        if (ePackage) return ePackage.eResource()

        if (loadOnDemand) {
            let resource = this.createResource(uri)
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

    getResourceAsync(uri: URI, loadOnDemand: boolean): Promise<EResource> {
        let rs = this
        return new Promise(function (resolve, reject) {
            if (rs._uriResourceMap) {
                let resource = rs._uriResourceMap.get(uri.toString())
                if (resource) {
                    if (loadOnDemand && !resource.isLoaded) {
                        resource.load().then(function () {
                            resolve(resource)
                        }, reject)
                    } else {
                        resolve(resource)
                    }
                    return
                }
            }

            let normalizedURI = rs._uriConverter.normalize(uri)
            for (const resource of rs._resources) {
                let resourceURI = rs._uriConverter.normalize(resource.eURI)
                if (resourceURI.toString() == normalizedURI.toString()) {
                    if (loadOnDemand && !resource.isLoaded) {
                        resource.load().then(function () {
                            if (rs._uriResourceMap) {
                                rs._uriResourceMap.set(uri.toString(), resource)
                            }
                            resolve(resource)
                        }, reject)
                    } else {
                        resolve(resource)
                    }
                    return
                }
            }

            let ePackage = rs.getPackageRegistry().getPackage(uri.toString())
            if (ePackage) return ePackage.eResource()

            if (loadOnDemand) {
                let resource = rs.createResource(uri)
                if (resource) {
                    resource.load().then(function () {
                        if (this._uriResourceMap) {
                            this._uriResourceMap.set(uri.toString(), resource)
                        }
                        resolve(resource)
                    }, reject)
                } else {
                    resolve(resource)
                }
                return
            }
            resolve(null)
        })
    }

    getEObject(uri: URI, loadOnDemand: boolean): EObject {
        let uriStr = uri.toString()
        let ndxHash = uriStr.lastIndexOf("#")
        let resource = this.getResource(ndxHash != -1 ? new URI(uriStr.slice(0, ndxHash)) : uri, loadOnDemand)
        return resource?.getEObject(ndxHash != -1 ? uriStr.slice(ndxHash + 1) : "")
    }

    getEObjectAsync(objectURI: URI, loadOnDemand: boolean): Promise<EObject> {
        let objectURIStr = objectURI.toString()
        let ndxHash = objectURIStr.lastIndexOf("#")
        let resourceURI = ndxHash != -1 ? new URI(objectURIStr.slice(0, ndxHash)) : objectURI
        let objectFragment = ndxHash != -1 ? objectURIStr.slice(ndxHash + 1) : ""
        return this.getResourceAsync(resourceURI, loadOnDemand).then((resource) => resource?.getEObject(objectFragment))
    }

    getURIConverter(): EURIConverter {
        return this._uriConverter
    }

    setURIConverter(uriConverter: EURIConverter): void {
        this._uriConverter = uriConverter
    }
}
