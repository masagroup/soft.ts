// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifyingList } from "./ENotifyingList";
import { EList } from "./EList";

export interface EObjectList<E> extends ENotifyingList<E> {
    getUnResolvedList(): EList<E>;
}
