// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EResource, EResourceConstants } from "./EResource";
import { BasicNotifier } from "./BasicNotifier";
import { AbstractNotification } from "./AbstractNotification";
import { ENotifier } from "./ENotifier";
import { EventType } from "./ENotification";
import { EStructuralFeature } from "./EStructuralFeature";
import { EResourceSet } from "./EResourceSet";
import { EDiagnostic } from "./EDiagnostic";
import { EList } from "./EList";
import { EObject } from "./EObject";
import { EResourceIDManager } from "./EResourceIDManager";
import * as fs from "fs";

class ResourceNotification extends AbstractNotification {
    private _notifier : ENotifier;
    private _featureID : number;

    constructor( notifier : ENotifier, featureID : number , eventType : EventType, oldValue : any, newValue : any , position : number  )
    {
        super(eventType,oldValue,newValue,position);
        this._notifier = notifier;
        this._featureID = featureID;
    }

    get notifier() : ENotifier {
        return this._notifier;
    }

    get feature() : EStructuralFeature {
        return null;
    }

    get featureID() : number {
        return this._featureID;
    }
}


export class EResourceImpl extends BasicNotifier implements EResource {
    
    private _eURI : URL;
    private _eResourceIDManager : EResourceIDManager;
    private _isLoaded : boolean;
    private _resourceSet : EResourceSet;
    private _contents : EList<EObject>;
    private _errors : EList<EDiagnostic>;
    private _warnings :  EList<EDiagnostic>;

    constructor() {
        super();
        this._isLoaded = false;
    }

    get eURI() : URL {
        return this._eURI;
    }

    set eURI( uri : URL ){
        let oldURI = this._eURI;
        this._eURI = uri;
        if (this.eNotificationRequired) {
            this.eNotify(new ResourceNotification(this, EResourceConstants.RESOURCE__URI , EventType.SET, oldURI, uri, -1 ));
        }
    }
 
    get eResourceIDManager() {
        return this._eResourceIDManager;
    }

    set eResourceIDManager( eResourceIDManager: EResourceIDManager ) {
        this._eResourceIDManager = eResourceIDManager;
    }

    get isLoaded() {
        return this._isLoaded;
    }
    
    eResourceSet() : EResourceSet {
        return this._resourceSet;
    }

    eContents() : EList<EObject> {
        return null;
    }

    eAllContents() : IterableIterator<EObject> {
        return null;
    }

    getEObject( uriFragment : string ) : EObject {
        return null;
    }
    
    getURIFragment( object: EObject ) : string {
        return null;
    }

    getErrors() : EList<EDiagnostic> {
        return null;
    }

    getWarnings() : EList<EDiagnostic> {
        return null;
    }

    load() : void {

    }

    loadFromString( xml : string ) : void {

    }

    loadFromStream( s : fs.ReadStream) : void {

    }

    unload() : void {

    }

    save() : void {

    }

    saveToString() : string {
        return null;
    }

    saveToStream( s : fs.WriteStream ) : void {

    }

    attached( object : EObject ) : void {

    }
    
    detached( object : EObject ) : void {
        
    }


}