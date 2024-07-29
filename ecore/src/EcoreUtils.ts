// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    DeepCopy,
    DeepEqual,
    EClass,
    EDataType,
    EList,
    EObject,
    EObjectInternal,
    EResource,
    EResourceSet,
    EventType,
    Notification,
    URI,
    getPackageRegistry,
    isEObjectInternal
} from "./internal.js"

export class EcoreUtils {
    static getEObjectID(eObject: EObject): string {
        const eClass = eObject.eClass()
        const eIDAttribute = eClass.getEIDAttribute()
        return !eIDAttribute || !eObject.eIsSet(eIDAttribute)
            ? ""
            : this.convertToString(eIDAttribute.getEAttributeType(), eObject.eGet(eIDAttribute))
    }

    static setEObjectID(eObject: EObject, id: string) {
        const eClass = eObject.eClass()
        const eIDAttribute = eClass.getEIDAttribute()
        if (!eIDAttribute) throw new Error("The object doesn't have an ID feature.")
        else if (id.length == 0) eObject.eUnset(eIDAttribute)
        else eObject.eSet(eIDAttribute, this.createFromString(eIDAttribute.getEAttributeType(), id))
    }

    static convertToString(eDataType: EDataType, value: any): string {
        const eFactory = eDataType.getEPackage().getEFactoryInstance()
        return eFactory.convertToString(eDataType, value)
    }

    static createFromString(eDataType: EDataType, literal: string): any {
        const eFactory = eDataType.getEPackage().getEFactoryInstance()
        return eFactory.createFromString(eDataType, literal)
    }

    static resolveInObject(proxy: EObject, context: EObject): EObject {
        return this.resolveInResourceSet(proxy, context?.eResource()?.eResourceSet())
    }

    static async resolveInObjectAsync(proxy: EObject, context: EObject): Promise<EObject> {
        return this.resolveInResourceSetAsync(proxy, context?.eResource()?.eResourceSet())
    }

    static resolveInResource(proxy: EObject, resource: EResource): EObject {
        return this.resolveInResourceSet(proxy, resource?.eResourceSet())
    }

    static async resolveInResourceAsync(proxy: EObject, resource: EResource): Promise<EObject> {
        return this.resolveInResourceSetAsync(proxy, resource?.eResourceSet())
    }

    static resolveInResourceSet(proxy: EObject, resourceSet: EResourceSet): EObject {
        const proxyURI = (proxy as EObjectInternal).eProxyURI()
        if (proxyURI) {
            let resolved: EObject
            if (resourceSet) {
                resolved = resourceSet.getEObject(proxyURI, true)
            } else {
                const proxyURIStr = proxyURI.toString()
                const ndxHash = proxyURIStr.lastIndexOf("#")
                const ePackage = getPackageRegistry().getPackage(
                    ndxHash != -1 ? proxyURIStr.slice(0, ndxHash) : proxyURIStr
                )
                if (ePackage) {
                    const eResource = ePackage.eResource()
                    if (eResource) {
                        resolved = eResource.getEObject(ndxHash != -1 ? proxyURIStr.slice(ndxHash + 1) : "")
                    }
                }
            }
            if (resolved && resolved != proxy) {
                return this.resolveInResourceSet(resolved, resourceSet)
            }
        }
        return proxy
    }

    static async resolveInResourceSetAsync(proxy: EObject, resourceSet: EResourceSet): Promise<EObject> {
        const proxyURI = (proxy as EObjectInternal).eProxyURI()
        if (proxyURI) {
            let resolved: EObject
            if (resourceSet) {
                resolved = await resourceSet.getEObjectAsync(proxyURI, true)
            } else {
                const proxyURIStr = proxyURI.toString()
                const ndxHash = proxyURIStr.lastIndexOf("#")
                const ePackage = getPackageRegistry().getPackage(
                    ndxHash != -1 ? proxyURIStr.slice(0, ndxHash) : proxyURIStr
                )
                if (ePackage) {
                    const eResource = ePackage.eResource()
                    if (eResource) {
                        resolved = eResource.getEObject(ndxHash != -1 ? proxyURIStr.slice(ndxHash + 1) : "")
                    }
                }
            }
            if (resolved && resolved != proxy) {
                return this.resolveInResourceSetAsync(resolved, resourceSet)
            }
        }
        return proxy
    }

    static copy(eObject: EObject): EObject {
        const dc = new DeepCopy(true, true)
        const c = dc.copy(eObject)
        dc.copyReferences()
        return c
    }

    static copyAll(l: EList<EObject>): EList<EObject> {
        const dc = new DeepCopy(true, true)
        const c = dc.copyAll(l)
        dc.copyReferences()
        return c
    }

    static equals(eObj1: EObject, eObj2: EObject): boolean {
        const dE = new DeepEqual()
        return dE.equals(eObj1, eObj2)
    }

    static equalsAll(l1: EList<EObject>, l2: EList<EObject>): boolean {
        const dE = new DeepEqual()
        return dE.equalsAll(l1, l2)
    }

    static remove(eObject: EObject) {
        if (isEObjectInternal(eObject)) {
            const eContainer = eObject.eInternalContainer()
            const eFeature = eObject.eContainmentFeature()
            if (eContainer && eFeature) {
                if (eFeature.isMany()) {
                    const l = eContainer.eGet(eFeature) as EList<EObject>
                    l.remove(eObject)
                } else {
                    eContainer.eUnset(eFeature)
                }
            }
            const eResource = eObject.eInternalResource()
            if (eResource) {
                eResource.eContents().remove(eObject)
            }
        }
    }

    static getAncestor(eObject: EObject, eClass: EClass): EObject {
        let eCurrent = eObject
        while (eCurrent != null && eCurrent.eClass() != eClass) {
            eCurrent = eCurrent.eContainer()
        }
        return eCurrent
    }

    static isAncestor(eAncestor: EObject, eObject: EObject): boolean {
        let eCurrent = eObject
        while (eCurrent != null && eCurrent != eAncestor) {
            eCurrent = eCurrent.eContainer()
        }
        return eCurrent == eAncestor
    }

    static getURI(eObject: EObject): URI {
        if (eObject.eIsProxy()) {
            return (eObject as EObjectInternal).eProxyURI()
        } else {
            const resource = eObject.eResource()
            if (resource) {
                const uri = resource.getURI()
                return new URI({
                    scheme: uri.scheme,
                    host: uri.host,
                    port: uri.port,
                    user: uri.user,
                    path: uri.path,
                    query: uri.query,
                    fragment: resource.getURIFragment(eObject)
                })
            } else {
                const id = EcoreUtils.getEObjectID(eObject)
                if (id.length == 0) {
                    return new URI({ fragment: "//" + EcoreUtils.getRelativeURIFragmentPath(null, eObject, false) })
                } else {
                    return new URI({ fragment: id })
                }
            }
        }
    }

    static getRelativeURIFragmentPath(ancestor: EObject, descendant: EObject, resolve: boolean): string {
        if (ancestor == descendant) {
            return ""
        }
        let eObject = descendant
        let eContainer = eObject.eContainer()
        const visited = new Set<EObject>()
        const paths = []
        while (eContainer != null && !visited.has(eObject)) {
            visited.add(eObject)
            const path = (eContainer as EObjectInternal).eURIFragmentSegment(eObject.eContainingFeature(), eObject)
            paths.slice().unshift(path)
            eObject = eContainer
            if (eContainer == ancestor) {
                break
            }
            eContainer = eObject.eContainer()
        }
        if (eObject != ancestor && ancestor != null) {
            throw Error("The ancestor not found")
        }
        return paths.join("/")
    }

    static resolveAllInResourceSet(resourceSet: EResourceSet) {
        for (const resource of resourceSet.getResources()) this.resolveAllInResource(resource)
    }

    static resolveAllInResource(resource: EResource) {
        for (const object of resource.eContents()) this.resolveAll(object)
    }

    static resolveAll(eObject: EObject) {
        this.resolveCrossReferences(eObject)
        for (const child of eObject.eAllContents()) this.resolveCrossReferences(child)
    }

    private static resolveCrossReferences(eObject: EObject) {
        for (const _ of eObject.eCrossReferences()) {
            // The loop resolves the cross references by visiting them.
        }
    }

    static async resolveAllInResourceSetAsync(resourceSet: EResourceSet): Promise<void> {
        const promises = []
        for (const resource of resourceSet.getResources()) promises.push(this.resolveAllInResourceAsync(resource))
        await Promise.all(promises)
    }

    static async resolveAllInResourceAsync(resource: EResource): Promise<void> {
        const promises = []
        for (const object of resource.eContents()) promises.push(this.resolveAllAsync(object))
        await Promise.all(promises)
    }

    static async resolveAllAsync(eObject: EObject): Promise<void> {
        const promises = [this.resolveCrossReferencesAsync(eObject)]
        for (const child of eObject.eAllContents()) promises.push(this.resolveCrossReferencesAsync(child))
        await Promise.all(promises)
    }

    private static async resolveCrossReferencesAsync(eObject: EObject): Promise<void> {
        const eClass = eObject.eClass()
        const eFeatures = eClass.getECrossReferenceFeatures()
        for (const eFeature of eFeatures) {
            if (eObject.eIsSet(eFeature)) {
                if (eFeature.isMany()) {
                    const promises = []
                    const list = eObject.eGetResolve(eFeature, false) as EList<EObject>
                    for (let i = 0; i < list.size(); i++) {
                        const oldValue = list.get(i)
                        if (oldValue?.eIsProxy()) {
                            promises.push(
                                new Promise(function (resolve, reject) {
                                    this.resolveInObjectAsync(oldValue, eObject)
                                        .then(function (newValue: EObject) {
                                            resolve({ index: i, oldValue: oldValue, newValue: newValue })
                                        })
                                        .catch((e: Error) => reject(e))
                                })
                            )
                        }
                    }
                    for (const resolve of await Promise.all(promises)) {
                        const eDeliver = eObject.eDeliver()
                        list.set(resolve.index, resolve.newValue)
                        eObject.eSetDeliver(eDeliver)
                        if (eDeliver && !eObject.eAdapters().isEmpty()) {
                            eObject.eNotify(
                                new Notification(
                                    eObject,
                                    EventType.RESOLVE,
                                    eFeature,
                                    resolve.oldValue,
                                    resolve.newValue,
                                    resolve.index
                                )
                            )
                        }
                    }
                } else {
                    await eObject.eGetResolveAsync(eFeature, true)
                }
            }
        }
    }
}
