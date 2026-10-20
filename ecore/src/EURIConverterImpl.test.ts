// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EURIConverterImpl, URI } from "./internal.js"

describe("EURIConverterImpl", () => {
    test("normalize", () => {
        const c = new EURIConverterImpl()
        c.getURIMap().set(new URI("test:/a/"), new URI("file:/b/"))
        expect(c.normalize(new URI("test:/a/x.xml")).toString()).toBe("file:/b/x.xml")
        expect(c.normalize(new URI("test:/c/x.xml")).toString()).toBe("test:/c/x.xml")
    })

    test("normalize-identity", () => {
        const c = new EURIConverterImpl()
        c.getURIMap().set(new URI("file:/a/"), new URI("file:/a/"))
        expect(c.normalize(new URI("file:/a/b.xml")).toString()).toBe("file:/a/b.xml")
    })

    test("normalize-chained", () => {
        const c = new EURIConverterImpl()
        c.getURIMap().set(new URI("a:/"), new URI("b:/"))
        c.getURIMap().set(new URI("b:/"), new URI("c:/"))
        expect(c.normalize(new URI("a:/x")).toString()).toBe("c:/x")
    })

    test("normalize-delegate", () => {
        const delegate = new EURIConverterImpl()
        delegate.getURIMap().set(new URI("test:/a/"), new URI("file:/delegate/"))
        delegate.getURIMap().set(new URI("test:/d/"), new URI("file:/d/"))
        const c = new EURIConverterImpl(delegate)
        c.getURIMap().set(new URI("test:/a/"), new URI("file:/own/"))
        // the entries of the converter override the ones of the delegate
        expect(c.normalize(new URI("test:/a/x.xml")).toString()).toBe("file:/own/x.xml")
        expect(c.normalize(new URI("test:/d/x.xml")).toString()).toBe("file:/d/x.xml")
    })
})
