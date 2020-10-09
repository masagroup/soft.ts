// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { Collection } from "./internal";

export interface List<E> extends Collection<E> {
    insert(index: number, e: E): boolean;
    insertAll(index: number, c: Collection<E>): boolean;
    removeAt(index: number): E;
    get(index: number): E;
    set(index: number, e: E): E;
    indexOf(e: E): number;
}
