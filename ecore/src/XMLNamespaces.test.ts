// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { XMLNamespaces } from "./XMLNamespaces.js"

describe("XMLNamespaces", () => {
    test("constructor", () => {
        const n = new XMLNamespaces()
        expect(n.getPrefix("uri")).toBeNull()
        expect(n.getURI("prefix")).toBeNull()
    })

    test("empty", () => {
        const n = new XMLNamespaces()
        n.pushContext()
        expect(n.getPrefix("uri")).toBeNull()
        expect(n.getURI("prefix")).toBeNull()
        const c = n.popContext()
        expect(c.length).toBe(0)
    })

    test("context ", () => {
        const n = new XMLNamespaces()
        n.pushContext()
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy()
        expect(n.getPrefix("uri")).toBe("prefix")
        expect(n.getURI("prefix")).toBe("uri")

        n.pushContext()
        expect(n.declarePrefix("prefix", "uri2")).toBeFalsy()
        expect(n.getPrefix("uri2")).toBe("prefix")
        expect(n.getURI("prefix")).toBe("uri2")

        n.popContext()
        expect(n.getPrefix("uri")).toBe("prefix")
        expect(n.getURI("prefix")).toBe("uri")

        n.popContext()
        expect(n.getPrefix("uri")).toBeNull()
        expect(n.getURI("prefix")).toBeNull()
    })

    test("contextRemap", () => {
        const n = new XMLNamespaces()
        n.pushContext()
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy()
        expect(n.getPrefix("uri")).toBe("prefix")
        expect(n.getURI("prefix")).toBe("uri")

        expect(n.declarePrefix("prefix", "uri2")).toBeTruthy()
        expect(n.getPrefix("uri2")).toBe("prefix")
        expect(n.getURI("prefix")).toBe("uri2")
    })

    test("contextNoRemap ", () => {
        const n = new XMLNamespaces()
        n.pushContext()
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy()
        expect(n.getPrefix("uri")).toBe("prefix")
        expect(n.getURI("prefix")).toBe("uri")

        n.pushContext()
        expect(n.declarePrefix("prefix", "uri2")).toBeFalsy()
        expect(n.getPrefix("uri2")).toBe("prefix")
        expect(n.getURI("prefix")).toBe("uri2")
    })
})
