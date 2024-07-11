// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { List } from "./List.js"

export interface EList<E> extends List<E> {
    move(to: number, e: E): void

    moveTo(from: number, to: number): E
}
