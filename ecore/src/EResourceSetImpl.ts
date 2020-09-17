// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EResourceSet, EResourceSetConstants } from "./EResourceSet";
import { EURIConverter } from "./EURIConverter";
import { EAdapter } from "./EAdapter";
import { EList } from "./EList";
import { ENotification } from "./ENotification";
import { EObject } from "./EObject";
import { EResource } from "./EResource";
import { AbstractNotifyingList } from "./AbstractNotifyingList";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { BasicNotifier } from "./BasicNotifier";
import { EResourceFactoryRegistry } from "./EResourceFactoryRegistry";
import { EPackageRegistry } from "./EPackageRegistry";

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
}

export class EResourceSetImpl extends BasicNotifier implements EResourceSet {
    private _resources: EList<EResource>;
    private _uriConverter: EURIConverter;
    private _uriResourceMap: Map<URL, EResource>;
    private _resourceFactoryRegistry: EResourceFactoryRegistry;
    private _packageRegistry: EPackageRegistry;

    getResources(): EList<EResource> {
        throw new Error("Method not implemented.");
    }

    getResource(uri: URL, loadOnDemand: boolean): EResource {
        throw new Error("Method not implemented.");
    }

    createResource(uri: URL): EResource {
        throw new Error("Method not implemented.");
    }

    getEObject(uri: URL, loadOnDemand: boolean): EObject {
        throw new Error("Method not implemented.");
    }

    getURIConverter(): EURIConverter {
        throw new Error("Method not implemented.");
    }

    setURIConverter(uriConverter: EURIConverter): void {
        throw new Error("Method not implemented.");
    }

    eNotify(notification: ENotification): void {
        throw new Error("Method not implemented.");
    }
}
