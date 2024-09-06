// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { createMemoryURI, URI } from "./URI.js"

describe("URI", () => {
    test("constructor", () => {
        const uri = new URI("file:///path#fragment")
        expect(uri.scheme).toBe("file")
        expect(uri.host).toBe("")
        expect(uri.port).toBe("")
        expect(uri.path).toBe("/path")
        expect(uri.fragment).toBe("fragment")
        expect(uri.toString()).toBe("file:///path#fragment")
    })

    test("constructor-host", () => {
        const uri = new URI("http://user@host:10/path#fragment")
        expect(uri.scheme).toBe("http")
        expect(uri.user).toBe("user")
        expect(uri.host).toBe("host")
        expect(uri.port).toBe("10")
        expect(uri.path).toBe("/path")
        expect(uri.fragment).toBe("fragment")
        expect(uri.toString()).toBe("http://user@host:10/path#fragment")
    })

    test("constructor-relative", () => {
        const uri = new URI("path#fragment")
        expect(uri.scheme).toBe("")
        expect(uri.user).toBe("")
        expect(uri.host).toBe("")
        expect(uri.port).toBe("")
        expect(uri.path).toBe("path")
        expect(uri.fragment).toBe("fragment")
        expect(uri.toString()).toBe("path#fragment")
    })

    test("normalize", () => {
        expect(new URI("http://host:10020").normalize()).toEqual(new URI("http://host:10020"))
        expect(new URI("http://host:10020/path").normalize()).toEqual(new URI("http://host:10020/path"))
        expect(new URI("http://host:10020/./path").normalize()).toEqual(new URI("http://host:10020/path"))
        expect(new URI("http://host:10020/path/../path2").normalize()).toEqual(new URI("http://host:10020/path2"))
        expect(new URI("http://host:10020/path/./path2").normalize()).toEqual(new URI("http://host:10020/path/path2"))
    })

    test("authority", () => {
        expect(new URI("file:///file.text").authority()).toEqual("")
        expect(new URI("file:/file.text").authority()).toEqual("")
        expect(new URI("http://host/file.text").authority()).toEqual("host")
        expect(new URI("http://host:10/file.text").authority()).toEqual("host:10")
        expect(new URI("http://userinfo@host:10/file.text").authority()).toEqual("userinfo@host:10")
    })

    test("relativize", () => {
        expect(new URI("http://host:10020/path/").relativize(new URI("http://host:10020/path/path2"))).toEqual(
            new URI("path2")
        )
        expect(new URI("testdata/path2").relativize(new URI("testdata/path1"))).toEqual(new URI("path1"))
    })

    test("resolve", () => {
        expect(new URI("http://host:10020/path/").resolve(new URI("http://host:10020/path2/"))).toEqual(
            new URI("http://host:10020/path2/")
        )
        expect(new URI("http://host:10020/path/").resolve(new URI("../path2"))).toEqual(
            new URI("http://host:10020/path2")
        )
        expect(new URI("http://host:10020/path/").resolve(new URI("/path2"))).toEqual(
            new URI("http://host:10020/path2")
        )
        expect(new URI("http://host:10020/path/").resolve(new URI("./path2"))).toEqual(
            new URI("http://host:10020/path/path2")
        )
        expect(new URI("path/path2").resolve(new URI("path3"))).toEqual(new URI("path/path3"))
    })
    test("isAbsolute", () => {
        expect(new URI("http://toto").isAbsolute()).toBeTruthy()
        expect(new URI("/toto").isAbsolute()).toBeFalsy()
    })
    test("isOpaque", () => {
        expect(new URI("http://toto").isOpaque()).toBeTruthy()
        expect(new URI("http://toto/").isOpaque()).toBeFalsy()
    })
    test("replacePrefix", () => {
        expect(new URI("http://").replacePrefix(new URI("file://"), null)).toBeNull()
        expect(new URI("http://host").replacePrefix(new URI("http://host2/path"), null)).toBeNull()
        expect(new URI("test/toto").replacePrefix(new URI("info"), null)).toBeNull()
        {
            const uri = new URI("test:///toto").replacePrefix(new URI({ scheme: "test" }), new URI({ scheme: "file" }))
            expect(uri).not.toBeNull()
            expect(uri.scheme).toBe("file")
        }
        {
            const uri = new URI().replacePrefix(new URI(), new URI("file"))
            expect(uri).not.toBeNull()
            expect(uri.path).toBe("file")
        }
        {
            const uri = new URI("toto").replacePrefix(new URI(), new URI("test/"))
            expect(uri).not.toBeNull()
            expect(uri.path).toBe("test/toto")
        }
        {
            const uri = new URI("test/toto").replacePrefix(new URI("test/toto"), new URI("test2"))
            expect(uri).not.toBeNull()
            expect(uri.path).toBe("test2")
        }
        {
            const uri = new URI("test/toto").replacePrefix(new URI("test"), new URI("test2"))
            expect(uri).not.toBeNull()
            expect(uri.path).toBe("test2/toto")
        }
    })
    test("toString", () => {
        expect(createMemoryURI("clock.xml").toString()).toEqual("memory:clock.xml")
    })
})
