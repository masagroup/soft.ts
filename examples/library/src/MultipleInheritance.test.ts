// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { expect, test } from "vitest"
import { getLibraryFactory } from "./internal.js"
// Book is a CirculatingItem whose super types are Item and Lendable: the borrowers feature of
// Lendable has id 1 in Lendable but 2 in CirculatingItem
test("borrowed <-> borrowers across multiple inheritance", () => {
    const f = getLibraryFactory()
    const borrower = f.createBorrower()
    const item = f.createBook()
    borrower.getBorrowed().add(item)
    expect(item.getBorrowers().toArray()).toEqual([borrower])
    borrower.getBorrowed().remove(item)
    expect(item.getBorrowers().isEmpty()).toBeTruthy()
    item.getBorrowers().add(borrower)
    expect(borrower.getBorrowed().toArray()).toEqual([item])
})
