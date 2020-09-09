// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
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
