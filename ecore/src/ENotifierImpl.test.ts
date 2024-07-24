// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, verify } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { EAdapter, ENotification, ENotifierImpl } from "./internal.js"

describe("ENotifierImpl", () => {
    test("constructor", () => {
        let n = new ENotifierImpl()
        expect(n.eDeliver()).toBeTruthy()
        expect(n.eAdapters().isEmpty()).toBeTruthy()
    })
    test("eDeliver", () => {
        let n = new ENotifierImpl()
        expect(n.eDeliver()).toBeTruthy()
        n.eSetDeliver(false)
        expect(n.eDeliver()).toBeFalsy()
    })
    test("eAdapters", () => {
        let n = new ENotifierImpl()
        expect(n.eBasicAdapters()).toBeNull()
        expect(n.eAdapters()).not.toBeNull()
        expect(n.eBasicAdapters()).not.toBeNull()
    })
    test("eNotify", () => {
        // mocks
        const mockAdapter = mock<EAdapter>()
        const mockNotification = mock<ENotification>()
        const adapter = instance(mockAdapter)
        const notification = instance(mockNotification)

        // call
        let n = new ENotifierImpl()
        n.eAdapters().add(adapter)
        n.eNotify(notification)

        // checks
        verify(mockAdapter.notifyChanged(notification)).called()
    })
})
