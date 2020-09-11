// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifier } from "./ENotifier";
import { EObject } from "./EObject";
import { EList } from "./EList";
import { EResourceSet } from "./EResourceSet";
import { EDiagnostic } from "./EDiagnostic";
import * as fs from "fs";
import { EResourceIDManager } from "./EResourceIDManager";

export class EResourceConstants {

    public static readonly RESOURCE__RESOURCE_SET : number = 0;

    public static readonly RESOURCE__URI : number = 1;

    public static readonly RESOURCE__CONTENTS : number = 2;

    public static readonly RESOURCE__IS_LOADED : number = 4;
}

export interface EResource extends ENotifier {

    eURI : URL;
    eResourceIDManager : EResourceIDManager;

    eResourceSet() : EResourceSet;
    eContents() : EList<EObject>;
    eAllContents() : IterableIterator<EObject>;
    
    load() : void;
    loadFromString( xml : string ) : void;
    loadFromStream( s : fs.ReadStream) : void;
    unload() : void;
    readonly isLoaded : boolean;

    save() : void;
    saveToString() : string;
    saveToStream( s : fs.WriteStream ) : void;

    attached( object : EObject ) : void;
    detached( object : EObject ) : void;

    getEObject( uriFragment : string ) : EObject;
    getURIFragment( object: EObject ) : string;

    getErrors() : EList<EDiagnostic>;
    getWarnings() : EList<EDiagnostic>;
}
