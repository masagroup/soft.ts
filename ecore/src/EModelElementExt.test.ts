// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EObject, EPackage, EResourceImpl, getEcoreFactory, URI } from "./internal.js"

function newPackage(): EPackage {
    const p = getEcoreFactory().createEPackage()
    p.setName("p")
    p.setNsURI("urn:p")
    return p
}

function newResource(p: EPackage): EResourceImpl {
    const r = new EResourceImpl()
    r.setURI(new URI("p.ecore"))
    r.eContents().add(p)
    return r
}

function expectRoundTrip(r: EResourceImpl, o: EObject, fragment: string) {
    expect(r.getURIFragment(o)).toBe(fragment)
    expect(r.getEObject(fragment)).toBe(o)
}

describe("EModelElementExt", () => {
    test("named element fragments", () => {
        const p = newPackage()
        const names = ["C", "My Class", "a/b", "a?b", "a#b", "a%b", "a.b", "v.2", "", "a:b@c"]
        const classes = names.map((name) => {
            const c = getEcoreFactory().createEClass()
            c.setName(name)
            p.getEClassifiers().add(c)
            return c
        })
        const r = newResource(p)
        expectRoundTrip(r, classes[0], "//C")
        expectRoundTrip(r, classes[1], "//My%20Class")
        expectRoundTrip(r, classes[2], "//a%2Fb")
        expectRoundTrip(r, classes[3], "//a%3Fb")
        expectRoundTrip(r, classes[4], "//a%23b")
        expectRoundTrip(r, classes[5], "//a%25b")
        expectRoundTrip(r, classes[6], "//a.b")
        expectRoundTrip(r, classes[7], "//v%2E2")
        expectRoundTrip(r, classes[8], "//%")
        expectRoundTrip(r, classes[9], "//a:b@c")
    })

    test("named element fragments with count", () => {
        const p = newPackage()
        const c1 = getEcoreFactory().createEClass()
        c1.setName("My Class")
        const c2 = getEcoreFactory().createEClass()
        c2.setName("My Class")
        p.getEClassifiers().add(c1)
        p.getEClassifiers().add(c2)
        const r = newResource(p)
        expectRoundTrip(r, c1, "//My%20Class")
        expectRoundTrip(r, c2, "//My%20Class.1")
    })

    test("annotation fragments", () => {
        const p = newPackage()
        const c = getEcoreFactory().createEClass()
        c.setName("C")
        p.getEClassifiers().add(c)
        const a1 = getEcoreFactory().createEAnnotation()
        a1.setSource("http://www.eclipse.org/emf/2002/GenModel")
        const a2 = getEcoreFactory().createEAnnotation()
        a2.setSource("http://www.eclipse.org/emf/2002/GenModel")
        const a3 = getEcoreFactory().createEAnnotation()
        c.getEAnnotations().add(a1)
        c.getEAnnotations().add(a2)
        c.getEAnnotations().add(a3)
        const r = newResource(p)
        expectRoundTrip(r, a1, "//C/%http:%2F%2Fwww.eclipse.org%2Femf%2F2002%2FGenModel%")
        expectRoundTrip(r, a2, "//C/%http:%2F%2Fwww.eclipse.org%2Femf%2F2002%2FGenModel%.1")
        expectRoundTrip(r, a3, "//C/%%%")
    })
})
