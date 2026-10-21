// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClass, EFactory, EObject, EPackage, EPackageRegistry } from "./internal.js"

// EObjectFactory is implemented by the objects of an implementation of a package shared by
// several implementations: it tells which factory, hence which implementation, built them
export interface EObjectFactory {
    // the factory of the implementation of the object
    eFactory(): EFactory
}

export function isEObjectFactory(o: any): o is EObjectFactory {
    return typeof o === "object" && o !== null && typeof o.eFactory === "function"
}

// getObjectFactory returns the factory of the implementation of eObject, or the factory
// instance of the package of its class when the object does not tell
export function getObjectFactory(eObject: EObject): EFactory {
    if (isEObjectFactory(eObject)) {
        return eObject.eFactory()
    }
    return eObject?.eClass()?.getEPackage()?.getEFactoryInstance() ?? null
}

// getClassFactory returns the factory that builds an object of eClass for owner: the factory
// of the implementation of owner when it builds the classes of the package of eClass, else the
// factory instance of that package
export function getClassFactory(owner: any, eClass: EClass): EFactory {
    const ePackage = eClass.getEPackage()
    if (isEObjectFactory(owner)) {
        const factory = owner.eFactory()
        if (factory?.getEPackage() == ePackage) {
            return factory
        }
    }
    return ePackage?.getEFactoryInstance() ?? null
}

// getRegistryFactory returns the factory packageRegistry chose for ePackage, else the factory
// instance of ePackage
export function getRegistryFactory(packageRegistry: EPackageRegistry, ePackage: EPackage): EFactory {
    const factory = packageRegistry?.getFactory(ePackage.getNsURI())
    return factory ?? ePackage.getEFactoryInstance()
}

let implementationChecks = false

// setImplementationChecks turns on or off the checks that objects of two implementations of
// one shared package are not mixed (checkSameImplementation). They are off by default: turn
// them on in tests and debug builds.
export function setImplementationChecks(on: boolean): void {
    implementationChecks = on
}

export function isImplementationChecks(): boolean {
    return implementationChecks
}

// checkSameImplementation throws when owner and value are objects of two implementations of
// the same package. Does nothing while the checks are off.
export function checkSameImplementation(owner: any, value: any): void {
    if (!implementationChecks) {
        return
    }
    doCheckSameImplementation(owner, value)
}

function doCheckSameImplementation(owner: any, value: any): void {
    if (!isEObjectFactory(owner) || !isEObjectFactory(value)) {
        return
    }
    const ownerFactory = owner.eFactory()
    const valueFactory = value.eFactory()
    if (ownerFactory == valueFactory) {
        return
    }
    const ePackage = ownerFactory?.getEPackage()
    if (ePackage && ePackage == valueFactory?.getEPackage()) {
        throw new Error(
            "cannot mix implementations of the package '" +
                ePackage.getNsURI() +
                "': " +
                owner.constructor?.name +
                " and " +
                value.constructor?.name
        )
    }
}

// checkSameRootImplementation checks eObject against the first other root of roots built by an
// implementation of the same package. Does nothing while the checks are off.
export function checkSameRootImplementation(roots: Iterable<any>, eObject: any): void {
    if (!implementationChecks || !isEObjectFactory(eObject)) {
        return
    }
    const ePackage = eObject.eFactory()?.getEPackage()
    for (const root of roots) {
        if (root != eObject && isEObjectFactory(root) && root.eFactory()?.getEPackage() == ePackage) {
            doCheckSameImplementation(root, eObject)
            return
        }
    }
}
