// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifier } from "./ENotifier";
import { EResource } from "./EResource";
import { EList } from "./EList";
import { EObject } from "./EObject";
import { EURIConverter } from "./EURIConverter";

export interface EResourceSet extends ENotifier {

    getResources() : EList<EResource>;
    getResource( uri : URL , loadOnDemand : boolean ) : EResource;
    createResource( uri : URL ): EResource;

    getEObject(uri : URL , loadOnDemand: boolean ) : EObject;

    getURIConverter() : EURIConverter;
    setURIConverter( uriConverter : EURIConverter ) : void;
}
