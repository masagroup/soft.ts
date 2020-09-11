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
import { AbstractNotifyingList } from "./AbstractNotifyingList";
import { ENotificationChain } from "./ENOtificationChain";
import { EObjectInternal } from "./EObjectInternal";
import { ETreeIterator } from "./ETreeIterator";
import { EObjectList } from "./EObjectList";

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

class ResourceContents extends AbstractNotifyingList<EObject> implements EObjectList<EObject> {
    private _resource : EResource;

    constructor( resource : EResource ) {
        super();
        this._resource = resource;
    }

    get notifier() : ENotifier {
        return this._resource;
    }

    get feature() : EStructuralFeature {
        return null;
    }

    get featureID() : number {
        return EResourceConstants.RESOURCE__CONTENTS;
    }

    getUnResolvedList(): EList<EObject> {
        return this;
    }

    protected inverseAdd(eObject: EObject, notifications: ENotificationChain): ENotificationChain {
        let n = (eObject as EObjectInternal).eSetResource( this._resource , notifications );
        this._resource.attached(eObject);
        return n;
    }

    protected inverseRemove(eObject: EObject, notifications: ENotificationChain): ENotificationChain {
        this._resource.detached(eObject);
        let n = (eObject as EObjectInternal).eSetResource( null, notifications );
        return n;
    }
}


export class EResourceImpl extends BasicNotifier implements EResource {
    
    private _uri : URL;
    private _resourceIDManager : EResourceIDManager;
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
        return this._uri;
    }

    set eURI( uri : URL ){
        let oldURI = this._uri;
        this._uri = uri;
        if (this.eNotificationRequired) {
            this.eNotify(new ResourceNotification(this, EResourceConstants.RESOURCE__URI , EventType.SET, oldURI, uri, -1 ));
        }
    }
 
    get eResourceIDManager() {
        return this._resourceIDManager;
    }

    set eResourceIDManager( eResourceIDManager: EResourceIDManager ) {
        this._resourceIDManager = eResourceIDManager;
    }

    get isLoaded() {
        return this._isLoaded;
    }
    
    eResourceSet() : EResourceSet {
        return this._resourceSet;
    }

    eContents() : EList<EObject> {
        if ( this._contents == null )
            this._contents = new ResourceContents(this);
        return this._contents;
    }

    eAllContents() : IterableIterator<EObject> {
        return this.eAllContentsResolve(true);
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
        if ( this._resourceIDManager )
            this._resourceIDManager.register(object);
    }
    
    detached( object : EObject ) : void {
        if ( this._resourceIDManager )
            this._resourceIDManager.unRegister(object);
    }
    
    private eAllContentsResolve(resolve : boolean ) : IterableIterator<EObject> {
        return new ETreeIterator<any,EObject>(this,false,function( o : any) : Iterator<EObject>{
            let contents : EList<EObject> = o.eContents();
            if (!resolve)
                contents = (contents as EObjectList<EObject>).getUnResolvedList();
            return contents[Symbol.iterator]();
        });
        
    }
}