// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EResource, EResourceImpl, EResourceSetImpl, EURIConverterImpl, getEcoreFactory, URI } from "./internal.js"

function resourceIndex(rs: EResourceSetImpl): Map<string, EResource> {
    return (rs as any)._resourceIndex ?? new Map<string, EResource>()
}

describe("EResourceSetImpl index", () => {
    test("add and lookup", () => {
        const rs = new EResourceSetImpl()
        expect(resourceIndex(rs).size).toBe(0)

        const uri1 = new URI("test://file1.t")
        const uri2 = new URI("test://file2.t")
        const r1 = rs.createResource(uri1)
        const r2 = new EResourceImpl()
        r2.setURI(uri2)
        rs.getResources().add(r2)

        // indexed on add
        expect(resourceIndex(rs).size).toBe(2)
        expect(resourceIndex(rs).get(uri1.toString())).toBe(r1)
        expect(resourceIndex(rs).get(uri2.toString())).toBe(r2)

        // found through the index, with the same or an equal uri
        expect(rs.getResource(uri1, false)).toBe(r1)
        expect(rs.getResource(new URI("test://file2.t"), false)).toBe(r2)
        expect(rs.getResource(new URI("test://file3.t"), false)).toBeNull()

        // a resource without uri is not indexed
        rs.getResources().add(new EResourceImpl())
        expect(resourceIndex(rs).size).toBe(2)
    })

    test("uri change", () => {
        const rs = new EResourceSetImpl()
        const oldURI = new URI("test://old.t")
        const newURI = new URI("test://new.t")
        const r = rs.createResource(oldURI)
        expect(rs.getResource(oldURI, false)).toBe(r)

        r.setURI(newURI)
        expect(resourceIndex(rs).size).toBe(1)
        expect(resourceIndex(rs).get(newURI.toString())).toBe(r)
        expect(rs.getResource(oldURI, false)).toBeNull()
        expect(rs.getResource(newURI, false)).toBe(r)

        r.setURI(null)
        expect(resourceIndex(rs).size).toBe(0)
        expect(rs.getResource(newURI, false)).toBeNull()

        // the uri of a resource outside the set does not touch the index
        const other = new EResourceImpl()
        other.setURI(oldURI)
        expect(resourceIndex(rs).size).toBe(0)
        expect(rs.getResource(oldURI, false)).toBeNull()
    })

    test("remove", () => {
        const rs = new EResourceSetImpl()
        const uri1 = new URI("test://file1.t")
        const uri2 = new URI("test://file2.t")
        const uri3 = new URI("test://file3.t")
        const r1 = rs.createResource(uri1)
        const r2 = rs.createResource(uri2)
        const r3 = rs.createResource(uri3)

        rs.getResources().remove(r1)
        expect(resourceIndex(rs).size).toBe(2)
        expect(rs.getResource(uri1, false)).toBeNull()
        expect(rs.getResource(uri2, false)).toBe(r2)

        // a resource moved to another set is not found anymore
        const rs2 = new EResourceSetImpl()
        rs2.getResources().add(r2)
        expect(rs.getResource(uri2, false)).toBeNull()
        expect(rs2.getResource(uri2, false)).toBe(r2)
        expect(resourceIndex(rs).size).toBe(1)

        // set
        const r4 = new EResourceImpl()
        r4.setURI(new URI("test://file4.t"))
        rs.getResources().set(0, r4)
        expect(rs.getResource(uri3, false)).toBeNull()
        expect(rs.getResource(r4.getURI(), false)).toBe(r4)
        expect(resourceIndex(rs).size).toBe(1)

        // clear
        rs.getResources().add(r3)
        rs.getResources().clear()
        expect(resourceIndex(rs).size).toBe(0)
        expect(rs.getResource(uri3, false)).toBeNull()
        expect(rs.getResource(r4.getURI(), false)).toBeNull()
    })

    test("duplicate uri", () => {
        const rs = new EResourceSetImpl()
        const uri = new URI("test://file.t")
        const r1 = rs.createResource(uri)
        const r2 = rs.createResource(uri)
        // the first resource of the list wins
        expect(rs.getResource(uri, false)).toBe(r1)

        // once it is removed, the second one is found by scanning the list, and indexed
        rs.getResources().remove(r1)
        expect(resourceIndex(rs).size).toBe(0)
        expect(rs.getResource(uri, false)).toBe(r2)
        expect(resourceIndex(rs).get(uri.toString())).toBe(r2)
    })

    test("uri converter path prefix", () => {
        const rs = new EResourceSetImpl()
        rs.getURIConverter().getURIMap().set(new URI("test://h/old/"), new URI("test://h/new/"))

        // indexed by uri and by normalized uri
        const r = rs.createResource(new URI("test://h/old/file.t"))
        expect(resourceIndex(rs).size).toBe(2)
        expect(resourceIndex(rs).get("test://h/old/file.t")).toBe(r)
        expect(resourceIndex(rs).get("test://h/new/file.t")).toBe(r)
        expect(rs.getResource(new URI("test://h/old/file.t"), false)).toBe(r)
        expect(rs.getResource(new URI("test://h/new/file.t"), false)).toBe(r)

        // a mapping added after the resource was indexed : found by scanning the list, and re-indexed
        rs.getURIConverter().getURIMap().set(new URI("test://h/new/"), new URI("test://h/newer/"))
        expect(rs.getResource(new URI("test://h/newer/file.t"), false)).toBe(r)
        expect(resourceIndex(rs).get("test://h/newer/file.t")).toBe(r)
        expect(rs.getResource(new URI("test://h/old/file.t"), false)).toBe(r)
        expect(rs.getResource(new URI("test://h/new/file.t"), false)).toBe(r)

        // a stale index entry is not trusted
        rs.getURIConverter().getURIMap().set(new URI("test://h/other/"), new URI("test://h/new/"))
        const other = rs.createResource(new URI("test://unrelated.t"))
        resourceIndex(rs).set("test://h/newer/file.t", other)
        expect(rs.getResource(new URI("test://h/other/file.t"), false)).toBe(r)
        expect(resourceIndex(rs).get("test://h/newer/file.t")).toBe(r)

        // a new converter rebuilds the index
        rs.setURIConverter(new EURIConverterImpl())
        expect(resourceIndex(rs).size).toBe(2)
        expect(resourceIndex(rs).get("test://h/old/file.t")).toBe(r)
        expect(resourceIndex(rs).get("test://unrelated.t")).toBe(other)
        expect(rs.getResource(new URI("test://h/old/file.t"), false)).toBe(r)
        expect(rs.getResource(new URI("test://h/new/file.t"), false)).toBeNull()
    })

    test("getEObject", () => {
        const rs = new EResourceSetImpl()
        const r = rs.createResource(new URI("test://doc.xml"))
        const root = getEcoreFactory().createEPackage()
        r.eContents().add(root)
        expect(rs.getEObject(new URI("test://doc.xml#/"), false)).toBe(root)
    })
})

describe("EResourceSetImpl index order", () => {
    test("first resource of the list wins", () => {
        const rs = new EResourceSetImpl()
        const r1 = rs.createResource(new URI("test://a"))
        const r0 = new EResourceImpl()
        r0.setURI(new URI("test://a"))
        rs.getResources().insert(0, r0)
        expect(rs.getResources().get(0)).toBe(r0)
        expect(rs.getResource(new URI("test://a"), false)).toBe(r0)

        // a resource added after keeps the first one indexed
        const r2 = new EResourceImpl()
        r2.setURI(new URI("test://a"))
        rs.getResources().add(r2)
        expect(rs.getResource(new URI("test://a"), false)).toBe(r0)

        // removing the first one gives the next one
        rs.getResources().remove(r0)
        expect(rs.getResource(new URI("test://a"), false)).toBe(r1)
    })

    test("move", () => {
        const rs = new EResourceSetImpl()
        const r1 = rs.createResource(new URI("test://a"))
        const r2 = rs.createResource(new URI("test://a"))
        expect(rs.getResource(new URI("test://a"), false)).toBe(r1)
        rs.getResources().moveTo(0, 1)
        expect(rs.getResources().get(0)).toBe(r2)
        expect(rs.getResource(new URI("test://a"), false)).toBe(r2)
    })

    test("uri change of a shadowed resource", () => {
        const rs = new EResourceSetImpl()
        const r1 = rs.createResource(new URI("test://a"))
        const r2 = rs.createResource(new URI("test://a"))
        r2.setURI(new URI("test://b"))
        expect(rs.getResource(new URI("test://a"), false)).toBe(r1)
        expect(rs.getResource(new URI("test://b"), false)).toBe(r2)
        r1.setURI(new URI("test://c"))
        expect(rs.getResource(new URI("test://a"), false)).toBeNull()
        expect(rs.getResource(new URI("test://c"), false)).toBe(r1)
    })

    test("unindex keeps the other resources", () => {
        const rs = new EResourceSetImpl()
        const resources = []
        for (let i = 0; i < 100; i++) {
            resources.push(rs.createResource(new URI(`test://r${i}`)))
        }
        for (let i = 0; i < 100; i += 2) {
            rs.getResources().remove(resources[i])
        }
        for (let i = 0; i < 100; i++) {
            expect(rs.getResource(new URI(`test://r${i}`), false)).toBe(i % 2 == 0 ? null : resources[i])
        }
        expect(resourceIndex(rs).size).toBe(50)
    })

    test("resolved file uri", () => {
        const rs = new EResourceSetImpl()
        const r = rs.createResource(new URI("file:///abs/dir/a.xml"))
        const resolved = new URI("file:///abs/dir/x.xml").resolve(new URI("a.xml"))
        expect(rs.getResource(resolved, false)).toBe(r)
    })
})
