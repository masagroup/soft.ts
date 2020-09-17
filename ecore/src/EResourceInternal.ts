// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotificationChain } from "./ENotificationChain";
import { EResource } from "./EResource";
import { EResourceSet } from "./EResourceSet";

export interface EResourceInternal extends EResource {
    basicSetLoaded(isLoaded: boolean, msgs: ENotificationChain): ENotificationChain;
    basicSetResourceSet(resourceSet: EResourceSet, msgs: ENotificationChain): ENotificationChain;
}
