// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************
import { instance, mock } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { AbstractEAdapter, ENotification, ENotifier } from "./internal.js"

class EAdapterTest extends AbstractEAdapter {
    notifyChanged(notification: ENotification): void {
        throw new Error("Method not implemented.")
    }
}

describe("AbstractEAdapter", () => {
    test("get", () => {
        let a = new EAdapterTest()
        expect(a.getTarget()).toBeNull()
    })
    test("set", () => {
        let a = new EAdapterTest()
        let mockNotifier = mock<ENotifier>()
        let notifier = instance(mockNotifier)
        a.setTarget(notifier)
        expect(a.getTarget()).not.toBeNull()
        expect(a.getTarget()).toBe(notifier)
    })
    test("unset", () => {
        let a = new EAdapterTest()
        let mockNotifier = mock<ENotifier>()
        let notifier = instance(mockNotifier)
        a.unsetTarget(notifier)
        expect(a.getTarget()).toBeNull()
        a.setTarget(notifier)
        a.unsetTarget(notifier)
        expect(a.getTarget()).toBeNull()
    })
})
