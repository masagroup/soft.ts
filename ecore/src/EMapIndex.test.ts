// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { BasicEMap, getEcoreFactory } from "./internal.js"

describe("EMapIndex", () => {
    test("value set on the entry", () => {
        const m = new BasicEMap<string, string>()
        m.put("k", "v")
        m.get(0).setValue("w")
        expect(m.getValue("k")).toBe("w")
        expect(m.toMap()).toEqual(new Map([["k", "w"]]))
    })

    test("key set on the entry", () => {
        const m = new BasicEMap<string, string>()
        m.put("k", "v")
        m.get(0).setKey("l")
        // the change is detected when the old key is looked up
        expect(m.containsKey("k")).toBeFalsy()
        expect(m.getValue("l")).toBe("v")
        expect(m.removeKey("l")).toBe("v")
        expect(m.isEmpty()).toBeTruthy()
    })

    test("entry added before its key and value", () => {
        // decoders add the entry to its container before setting its features
        const eAnnotation = getEcoreFactory().createEAnnotation()
        const details = eAnnotation.getDetails()
        const entry = getEcoreFactory().createEStringToStringMapEntry()
        details.add(entry)
        entry.setKey("k")
        entry.setValue("v")
        expect(details.getValue("k")).toBe("v")
        expect(details.toMap()).toEqual(new Map([["k", "v"]]))
        details.put("k", "w")
        expect(details.size()).toBe(1)
        expect(entry.getValue()).toBe("w")
    })

    test("remove pending entry", () => {
        const eAnnotation = getEcoreFactory().createEAnnotation()
        const details = eAnnotation.getDetails()
        const entry = getEcoreFactory().createEStringToStringMapEntry()
        details.add(entry)
        details.remove(entry)
        entry.setKey("k")
        expect(details.containsKey("k")).toBeFalsy()
    })

    test("put is not quadratic", () => {
        const m = new BasicEMap<number, number>()
        const n = 50000
        const start = performance.now()
        for (let i = 0; i < n; i++) {
            m.put(i, i)
        }
        for (let i = 0; i < n; i++) {
            expect(m.getValue(i)).toBe(i)
        }
        expect(performance.now() - start).toBeLessThan(2000)
    })
})
