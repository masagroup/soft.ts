// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotificationChain, EResource, EResourceSet } from "./internal";

export interface EResourceInternal extends EResource {
    basicSetLoaded(isLoaded: boolean, msgs: ENotificationChain): ENotificationChain;
    basicSetResourceSet(resourceSet: EResourceSet, msgs: ENotificationChain): ENotificationChain;
}
