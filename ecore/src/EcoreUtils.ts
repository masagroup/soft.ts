// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { isEObjectInternal } from "./EObjectInternal";
import {
    DeepCopy,
    DeepEqual,
    EDataType,
    EList,
    EObject,
    EObjectInternal,
    EResource,
    EResourceSet,
    getPackageRegistry,
} from "./internal";

export class EcoreUtils {
    static getEObjectID(eObject: EObject): string {
        let eClass = eObject.eClass();
        let eIDAttribute = eClass.eIDAttribute;
        return !eIDAttribute || !eObject.eIsSet(eIDAttribute)
            ? ""
            : this.convertToString(eIDAttribute.eAttributeType, eObject.eGet(eIDAttribute));
    }

    static setEObjectID(eObject: EObject, id: string) {
        let eClass = eObject.eClass();
        let eIDAttribute = eClass.eIDAttribute;
        if ((eIDAttribute = null)) throw new Error("The object doesn't have an ID feature.");
        else if (id.length == 0) eObject.eUnset(eIDAttribute);
        else eObject.eSet(eIDAttribute, this.createFromString(eIDAttribute.eAttributeType, id));
    }

    static convertToString(eDataType: EDataType, value: any): string {
        let eFactory = eDataType.ePackage.eFactoryInstance;
        return eFactory.convertToString(eDataType, value);
    }

    static createFromString(eDataType: EDataType, literal: string): any {
        let eFactory = eDataType.ePackage.eFactoryInstance;
        return eFactory.createFromString(eDataType, literal);
    }

    static resolveInObject(proxy: EObject, context: EObject): EObject {
        return this.resolveInResourceSet(proxy, context?.eResource()?.eResourceSet());
    }

    static resolveInResource(proxy: EObject, resource: EResource): EObject {
        return this.resolveInResourceSet(proxy, resource?.eResourceSet());
    }

    static resolveInResourceSet(proxy: EObject, resourceSet: EResourceSet): EObject {
        let proxyURI = (proxy as EObjectInternal).eProxyURI();
        if (proxyURI) {
            let resolved: EObject;
            if (resourceSet) {
                resolved = resourceSet.getEObject(proxyURI, true);
            } else {
                let proxyURIStr = proxyURI.toString();
                let ndxHash = proxyURIStr.lastIndexOf("#");
                let ePackage = getPackageRegistry().getPackage(
                    ndxHash != -1 ? proxyURIStr.slice(0, ndxHash) : proxyURIStr,
                );
                if (ePackage) {
                    let eResource = ePackage.eResource();
                    if (eResource) {
                        resolved = eResource.getEObject(
                            ndxHash != -1 ? proxyURIStr.slice(ndxHash + 1) : "",
                        );
                    }
                }
            }
            if (resolved && resolved != proxy) {
                return this.resolveInResourceSet(resolved, resourceSet);
            }
        }
        return proxy;
    }

    static copy(eObject: EObject): EObject {
        let dc = new DeepCopy(true, true);
        let c = dc.copy(eObject);
        dc.copyReferences();
        return c;
    }

    static copyAll(l: EList<EObject>): EList<EObject> {
        let dc = new DeepCopy(true, true);
        let c = dc.copyAll(l);
        dc.copyReferences();
        return c;
    }

    static equals(eObj1: EObject, eObj2: EObject): boolean {
        let dE = new DeepEqual();
        return dE.equals(eObj1, eObj2);
    }

    static equalsAll(l1: EList<EObject>, l2: EList<EObject>): boolean {
        let dE = new DeepEqual();
        return dE.equalsAll(l1, l2);
    }

    static remove(eObject: EObject) {
        if (isEObjectInternal(eObject)) {
            let eContainer = eObject.eInternalContainer();
            let eFeature = eObject.eContainmentFeature();
            if (eContainer && eFeature) {
                if (eFeature.isMany) {
                    let l = eContainer.eGet(eFeature) as EList<EObject>;
                    l.remove(eObject);
                } else {
                    eContainer.eUnset(eFeature);
                }
            }
            let eResource = eObject.eInternalResource();
            if (eResource) {
                eResource.eContents().remove(eObject);
            }
        }
    }
}
