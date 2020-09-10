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


export class EResourceConstans {

    public static readonly RESOURCE__RESOURCE_SET : number = 0;

    public static readonly RESOURCE__URI : number = 1;

    public static readonly RESOURCE__CONTENTS : number = 2;

    public static readonly RESOURCE__IS_LOADED : number = 4;
}

export interface EResource extends ENotifier {

    eURI : URL;

    eResourceSet() : EResourceSet;
    eContents() : EList<EObject>;
    eAllContents() : IterableIterator<EObject>;
    
    load() : void;
    loadFromString() : void;
    unload() : void;
    readonly isLoaded : boolean;

    save() : void;
    saveToString() : void;
}
