// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { List } from "./List";

export interface EList<E> extends List<E> {
    move(to: number, e: E): void;

    moveTo(to: number, from: number): E;
}
