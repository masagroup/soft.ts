// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

export interface Collection<E> extends Iterable<E> {
    add(e: E): boolean;
    addAll(c: Collection<E>): boolean;
    clear(): void;
    contains(e: E): boolean;
    isEmpty(): boolean;
    remove(e: E): boolean;
    removeAll(c: Collection<E>): boolean;
    retainAll(c: Collection<E>): boolean;
    size(): number;
    toArray(): E[];
}
