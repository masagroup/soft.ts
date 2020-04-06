// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { AbstractNotifier } from "./AbstractNotifier";
import { EObject } from "./EObject";
import { EClass } from "./EClass";
import { EResource } from "./EResource";
import { EStructuralFeature } from "./EStructuralFeature";
import { EReference } from "./EReference";
import { EList } from ".";
import { ECollectionView } from "./ECollectionView";
import { EOperation } from "./EOperation";

export class AbstractEObject extends AbstractNotifier implements EObject {
    
    private _eResource : EResource;
    private _eContainer : EObject;
    private _eContainerFeatureID : number;
    private _eProxyURI? : URL;

    constructor() {
        super();
        this._eResource = null;
        this._eContainer = null;
        this._eContainerFeatureID = -1;
    }

    eClass() : EClass {
        return this.eStaticClass();
    }
    
    eIsProxy() : boolean {
        return false;
    }
    
    eResource() : EResource {
        return null;
    }
    
    eContainer() : EObject {
        return null;
    }
    
    eContainingFeature() : EStructuralFeature {
        return null;
    }
    
    eContainmentFeature() : EReference {
        return null;
    }
    
    eContents() : EList<EObject> {
        return null;
    }
    
    eAllContents() : ECollectionView<EObject> {
        return null;
    }
    
    eCrossReferencesList() : EList<EObject> {
        return null;
    }
    
    eGet(feature : EStructuralFeature, resolve : boolean = true) : any {
        return null;
    }
    
    eSet(feature : EStructuralFeature, newValue : any) : void {
        return null;
    }
    
    eIsSet(feature : EStructuralFeature) : boolean {
        return false;
    }
    
    eUnset(feature : EStructuralFeature) : void {
    }
    
    eInvoke(operation : EOperation, args : EList<any>) : any {
        return null;
    }

    protected eStaticClass() : EClass {
        return null;
    }

}