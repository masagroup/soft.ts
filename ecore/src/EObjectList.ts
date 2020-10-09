// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EList, ENotifyingList } from "./internal";

export interface EObjectList<E> extends EList<E> {
    getUnResolvedList(): EList<E>;
}

export function isEObjectList<E>(l: EList<E>): l is EObjectList<E> {
    return "getUnResolvedList" in l;
}
