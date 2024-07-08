// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { Collection } from "./internal.js"

export interface List<E> extends Collection<E> {
    insert(index: number, e: E): boolean
    insertAll(index: number, c: Collection<E>): boolean
    removeAt(index: number): E
    get(index: number): E
    set(index: number, e: E): E
    indexOf(e: E): number
}
