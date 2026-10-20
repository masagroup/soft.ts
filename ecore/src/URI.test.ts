// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { createFileURI, createMemoryURI, URI, uriToFilePath } from "./URI.js"

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

    test("constructor-undefined", () => {
        const uri = new URI()
        expect(uri.isEmpty()).toBeTruthy()
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
        expect(new URI("http://host:10020/path/").relativize(new URI("http://host:10020/path/path2"))).toEqual(new URI("path2"))
        expect(new URI("testdata/path2").relativize(new URI("testdata/path1"))).toEqual(new URI("path1"))
        // A URI of another scheme is kept as it is.
        expect(new URI("http://host/path/").relativize(new URI("https://host/path/path2"))).toEqual(new URI("https://host/path/path2"))
    })

    test("resolve", () => {
        expect(new URI("http://host:10020/path/").resolve(new URI("http://host:10020/path2/"))).toEqual(new URI("http://host:10020/path2/"))
        expect(new URI("http://host:10020/path/").resolve(new URI("../path2"))).toEqual(new URI("http://host:10020/path2"))
        expect(new URI("http://host:10020/path/").resolve(new URI("/path2"))).toEqual(new URI("http://host:10020/path2"))
        expect(new URI("http://host:10020/path/").resolve(new URI("./path2"))).toEqual(new URI("http://host:10020/path/path2"))
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
    test("equals", () => {
        const uri1 = createMemoryURI("simulation")
        const uri2 = new URI("memory:simulation")
        expect(uri1.equals(uri2)).toBeTruthy()
    })
})

describe("URI file paths", () => {
    test("createFileURI-posix", () => {
        const uri = createFileURI("/dir/file.ecore")
        expect(uri.scheme).toBe("file")
        expect(uri.path).toBe("/dir/file.ecore")
        expect(uri.toString()).toBe("file:/dir/file.ecore")
        expect(uriToFilePath(uri)).toBe("/dir/file.ecore")
        expect(createFileURI("dir/file.ecore").toString()).toBe("dir/file.ecore")
        expect(createFileURI("")).toBeNull()
    })

    test("createFileURI-windows", () => {
        const uri = createFileURI("D:\\dev\\models\\a.ecore")
        expect(uri.scheme).toBe("file")
        expect(uri.path).toBe("/D:/dev/models/a.ecore")
        expect(uri.toString()).toBe("file:/D:/dev/models/a.ecore")
        expect(uriToFilePath(uri)).toBe("D:/dev/models/a.ecore")
        const resolved = uri.resolve(new URI("b.ecore"))
        expect(resolved.toString()).toBe("file:/D:/dev/models/b.ecore")
        expect(uriToFilePath(resolved)).toBe("D:/dev/models/b.ecore")
        expect(createFileURI("dir\\a.ecore").toString()).toBe("dir/a.ecore")
    })

    test("createFileURI-unc", () => {
        const uri = createFileURI("\\\\server\\share\\a.ecore")
        expect(uri.scheme).toBe("file")
        expect(uri.host).toBe("server")
        expect(uri.path).toBe("/share/a.ecore")
        expect(uri.toString()).toBe("file://server/share/a.ecore")
        expect(uriToFilePath(uri)).toBe("//server/share/a.ecore")
    })

    test("createFileURI-escaped", () => {
        const uri = createFileURI("/my dir/a%b#c?.ecore")
        expect(uri.toString()).toBe("file:/my%20dir/a%25b%23c%3F.ecore")
        const parsed = new URI(uri.toString())
        expect(parsed.fragment).toBe("")
        expect(parsed.query).toBe("")
        expect(uriToFilePath(parsed)).toBe("/my dir/a%b#c?.ecore")
    })

    test("windows path", () => {
        const uri = new URI("D:\\dev\\models\\a.ecore")
        expect(uri.scheme).toBe("")
        expect(uri.path).toBe("D:/dev/models/a.ecore")
        const resolved = uri.resolve(new URI("b.ecore"))
        expect(resolved.path).toBe("D:/dev/models/b.ecore")
        expect(uriToFilePath(resolved)).toBe("D:/dev/models/b.ecore")
        // a scheme of more than one letter is a scheme
        expect(new URI("ab:/path").scheme).toBe("ab")
    })

    test("uriToFilePath", () => {
        expect(uriToFilePath(new URI("file:///D:/dev/a.ecore"))).toBe("D:/dev/a.ecore")
        expect(uriToFilePath(new URI("file:///dev/a.ecore"))).toBe("/dev/a.ecore")
        expect(uriToFilePath(new URI("file:/dev/a%20b.ecore"))).toBe("/dev/a b.ecore")
        expect(uriToFilePath(new URI("file:/dev/a%zz.ecore"))).toBe("/dev/a%zz.ecore")
        expect(uriToFilePath(new URI("dev/../a.ecore"))).toBe("a.ecore")
    })
})

describe("URI authority", () => {
    test("empty authority", () => {
        const uri = new URI("file:///abs/dir/x.xml")
        expect(uri.hasAuthority).toBeTruthy()
        expect(uri.authority()).toBe("")
        const resolved = uri.resolve(new URI("a.xml"))
        expect(resolved.toString()).toBe("file:///abs/dir/a.xml")
        expect(resolved.equals(new URI("file:///abs/dir/a.xml"))).toBeTruthy()
        expect(new URI("file:///abs/dir/./x.xml").normalize().toString()).toBe("file:///abs/dir/x.xml")
        expect(uri.trimFragment().toString()).toBe("file:///abs/dir/x.xml")
        expect(new URI("file:///abs/x.xml#f").trimFragment().toString()).toBe("file:///abs/x.xml")
        expect(new URI("file:///abs/x.xml?q").trimQuery().toString()).toBe("file:///abs/x.xml")
        // no authority
        expect(new URI("file:/abs/dir/x.xml").resolve(new URI("a.xml")).toString()).toBe("file:/abs/dir/a.xml")
        expect(new URI("file:/abs/dir/x.xml").hasAuthority).toBeFalsy()
    })

    test("user and password", () => {
        const uri = new URI("http://user:password@host:10/path")
        expect(uri.user).toBe("user:password")
        expect(uri.authority()).toBe("user:password@host:10")
        expect(uri.toString()).toBe("http://user:password@host:10/path")
        expect(uri.resolve(new URI("other")).toString()).toBe("http://user:password@host:10/other")
    })

    test("resolve with authority", () => {
        expect(new URI("http://host/a/b").resolve(new URI("//other/c")).toString()).toBe("http://other/c")
    })
})

describe("URI references", () => {
    test("relativize without directory", () => {
        expect(new URI("a.xml").relativize(new URI("b.xml"))).toEqual(new URI("b.xml"))
        expect(new URI("a.xml").relativize(new URI("a.xml#f"))).toEqual(new URI("#f"))
        expect(new URI("dir/a.xml").relativize(new URI("b.xml"))).toEqual(new URI("b.xml"))
    })

    test("resolve lone fragment", () => {
        const base = new URI("http://host/path/file.xml?q")
        expect(base.resolve(new URI("#frag")).toString()).toBe("http://host/path/file.xml?q#frag")
        const withFragment = new URI("http://host/file.xml#frag")
        expect(withFragment.resolve(new URI("#frag"))).toBe(withFragment)
        expect(withFragment.resolve(new URI("#other")).toString()).toBe("http://host/file.xml#other")
        expect(new URI("file.xml").resolve(new URI("#frag")).toString()).toBe("file.xml#frag")
    })
})
