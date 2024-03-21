// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { spy, verify, when } from "ts-mockito"
import { AbstractEList, Collection } from "./internal"

class EListTest<E> extends AbstractEList<E> {
    removeAt(index: number): E {
        throw new Error("Method not implemented.")
    }
    moveTo(from: number, to: number): E {
        throw new Error("Method not implemented.")
    }
    size(): number {
        throw new Error("Method not implemented.")
    }
    toArray(): E[] {
        throw new Error("Method not implemented.")
    }
    protected doGet(index: number): E {
        throw new Error("Method not implemented.")
    }
    protected doAdd(e: E): void {
        throw new Error("Method not implemented.")
    }
    protected doAddAll(c: Collection<E>): boolean {
        throw new Error("Method not implemented.")
    }
    protected doInsert(index: number, e: E): void {
        throw new Error("Method not implemented.")
    }
    protected doInsertAll(index: number, c: Collection<E>): boolean {
        throw new Error("Method not implemented.")
    }
    protected doSet(index: number, e: E): E {
        throw new Error("Method not implemented.")
    }
}

describe("AbstractEList", () => {
    test("clear", () => {
        let l = new EListTest<number>(false)
        let s = spy(l)
        when(s.size()).thenReturn(2)
        when(s.removeAt(1)).thenReturn(5)
        when(s.removeAt(0)).thenReturn(4)
        l.clear()
        verify(s.removeAt(1)).once()
        verify(s.removeAt(0)).once()
    })
})
