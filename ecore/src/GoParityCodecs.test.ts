// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

// regressions of the codec fixes of soft.go #209

import { describe, expect, test } from "vitest"
import {
    BinaryDecoder,
    BinaryEncoder,
    EAttribute,
    EClass,
    EObject,
    EPackage,
    EResourceSetImpl,
    getEcoreFactory,
    getEcorePackage,
    IncrementalIDManager,
    UNBOUNDED_MULTIPLICITY,
    URI,
    XMLDecoder,
    XMLEncoder
} from "./internal.js"
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind.js"
import { XMIDecoder } from "./XMIDecoder.js"

const encoder = new TextEncoder()

// a package whose class C has the features a (string) and b (int) in the given order
function model(nsURI: string, order: string[] = ["a", "b"]) {
    const f = getEcoreFactory()
    const p = f.createEPackage()
    p.setName("p")
    p.setNsPrefix("p")
    p.setNsURI(nsURI)
    p.setEFactoryInstance(f.createEFactory())
    const eInt = f.createEDataType()
    eInt.setName("Int")
    eInt.setInstanceTypeName("int")
    p.getEClassifiers().add(eInt)
    const eEnum = f.createEEnum()
    eEnum.setName("E")
    p.getEClassifiers().add(eEnum)
    const literal = f.createEEnumLiteral()
    literal.setName("x")
    literal.setLiteral("x")
    literal.setValue(0)
    eEnum.getELiterals().add(literal)
    const c = f.createEClass()
    c.setName("C")
    p.getEClassifiers().add(c)
    const features: Record<string, EAttribute> = {}
    for (const name of order) {
        const a = f.createEAttribute()
        a.setName(name)
        a.setEType(name == "a" ? getEcorePackage().getEString() : eInt)
        c.getEStructuralFeatures().add(a)
        features[name] = a
    }
    const count = f.createEAttribute()
    count.setName("count")
    count.setEType(eInt)
    c.getEStructuralFeatures().add(count)
    const e = f.createEAttribute()
    e.setName("e")
    e.setEType(eEnum)
    c.getEStructuralFeatures().add(e)
    const s = f.createEAttribute()
    s.setName("s")
    s.setEType(getEcorePackage().getEString())
    c.getEStructuralFeatures().add(s)
    const rs = new EResourceSetImpl()
    rs.getPackageRegistry().registerPackage(p)
    return { p, c, features, count, e, s, rs }
}

describe("XMLDecoder go parity", () => {
    test("an invalid literal is reported and not set", () => {
        const m = model("http://p1")
        const r = m.rs.createResource(new URI("file:///c.xml"))
        new XMLDecoder(r, null).decode(encoder.encode(`<p:C xmlns:p="http://p1" count="12x" s="n"/>`))
        expect(r.getErrors().size()).toBe(1)
        const o = r.eContents().get(0)
        expect(o.eIsSet(m.count)).toBeFalsy()
        expect(o.eGet(m.s)).toBe("n")
    })

    test("an invalid enum literal does not lose the resource", () => {
        const m = model("http://p2")
        const r = m.rs.createResource(new URI("file:///c.xml"))
        new XMLDecoder(r, null).decode(encoder.encode(`<p:C xmlns:p="http://p2" e="zz" s="n"/>`))
        expect(r.getErrors().size()).toBe(1)
        expect(r.eContents().size()).toBe(1)
        expect(r.eContents().get(0).eGet(m.s)).toBe("n")
    })

    test("diagnostics of a resource without uri", () => {
        const f = getEcoreFactory()
        const p = f.createEPackage()
        p.setName("q")
        p.setNsPrefix("q")
        p.setNsURI("http://q")
        p.setEFactoryInstance(f.createEFactory())
        const c = f.createEClass()
        c.setName("C")
        p.getEClassifiers().add(c)
        const refs = f.createEReference()
        refs.setName("refs")
        refs.setEType(c)
        refs.setUpperBound(UNBOUNDED_MULTIPLICITY)
        c.getEStructuralFeatures().add(refs)
        const rs = new EResourceSetImpl()
        rs.getPackageRegistry().registerPackage(p)

        const r = rs.createResource(null)
        new XMLDecoder(r, null).decode(encoder.encode(`<q:Unknown xmlns:q="http://q"/>`))
        expect(r.getErrors().size()).toBe(1)
        expect(r.getErrors().get(0).location).toBe("")
    })

    test("xmi:id", () => {
        const doc = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore" xmi:id="_p" name="p">
  <eClassifiers xsi:type="ecore:EClass" xmi:id="_a" name="A" eSuperTypes="_b"/>
  <eClassifiers xsi:type="ecore:EClass" xmi:id="_b" name="B"/>
</ecore:EPackage>`
        for (const withIDManager of [false, true]) {
            const r = new EResourceSetImpl().createResource(new URI("file:///p.ecore"))
            if (withIDManager) r.setObjectIDManager(new (class extends IncrementalIDManager {})())
            new XMIDecoder(r, null).decode(encoder.encode(doc))
            expect(r.getErrors().isEmpty()).toBeTruthy()
            const ePackage = r.eContents().get(0) as EPackage
            const a = ePackage.getEClassifier("A") as EClass
            expect(a.getESuperTypes().toArray()).toEqual([ePackage.getEClassifier("B")])
        }
    })
})

describe("XMLEncoder go parity", () => {
    test("white spaces of attribute values are escaped", () => {
        const m = model("http://p3")
        const o = m.p.getEFactoryInstance().create(m.c)
        o.eSet(m.s, "a\nb\tc\r<&>")
        const r = m.rs.createResource(new URI("file:///e.xml"))
        r.eContents().add(o)
        const str = new TextDecoder().decode(new XMLEncoder(r, null).encode(r).unwrap())
        expect(str).toContain(`s="a&#xA;b&#x9;c&#13;&lt;&amp;&gt;"`)

        const r2 = m.rs.createResource(new URI("file:///e2.xml"))
        new XMLDecoder(r2, null).decode(encoder.encode(str))
        expect(r2.eContents().get(0).eGet(m.s)).toBe("a\nb\tc\r<&>")
    })
})

describe("Binary go parity", () => {
    test("features are decoded by name", () => {
        const m1 = model("http://pb", ["a", "b"])
        const o = m1.p.getEFactoryInstance().create(m1.c)
        o.eSet(m1.features["a"], "hello")
        o.eSet(m1.features["b"], 42)
        const r = m1.rs.createResource(new URI("file:///o.bin"))
        r.eContents().add(o)
        const bytes = new BinaryEncoder(r, null).encode(r).unwrap()

        // the reader numbers its features differently
        const m2 = model("http://pb", ["b", "a"])
        const r2 = m2.rs.createResource(new URI("file:///o2.bin"))
        expect(new BinaryDecoder(r2, null).decode(bytes).isOk()).toBeTruthy()
        const d = r2.eContents().get(0)
        expect(d.eGet(m2.features["a"])).toBe("hello")
        expect(d.eGet(m2.features["b"])).toBe(42)
    })

    test("an invalid object id is an error", () => {
        const m = model("http://pc")
        const o = m.p.getEFactoryInstance().create(m.c)
        const r = m.rs.createResource(new URI("file:///o.bin"))
        r.eContents().add(o)
        const bytes = new BinaryEncoder(r, null).encode(r).unwrap()
        // signature (9 bytes), version, number of objects, then the id of the first object
        const corrupt = Uint8Array.from(bytes)
        expect(corrupt[12]).toBe(0)
        corrupt[12] = 0xfb
        const r2 = m.rs.createResource(new URI("file:///o2.bin"))
        const result = new BinaryDecoder(r2, null).decode(corrupt)
        expect(result.isErr()).toBeTruthy()
        expect(result.isErr() && result.error.message).toBe("invalid object id -5")
    })

    test("the feature kind comes from the GenGo instance type", () => {
        const f = getEcoreFactory()
        const dt = f.createEDataType()
        dt.setName("Small")
        dt.setInstanceTypeName("org.Foo")
        const annotation = f.createEAnnotation()
        annotation.setSource("http://net.masagroup/soft/2019/GenGo")
        annotation.getDetails().put("instanceTypeName", "int64")
        dt.getEAnnotations().add(annotation)
        const a = f.createEAttribute()
        a.setName("v")
        a.setEType(dt)
        expect(getBinaryCodecFeatureKind(a)).toBe(BinaryFeatureKind.bfkNumber)
    })

    test("int64 values held as bigint", () => {
        const f = getEcoreFactory()
        const p = f.createEPackage()
        p.setName("l")
        p.setNsPrefix("l")
        p.setNsURI("http://l")
        p.setEFactoryInstance(f.createEFactory())
        const c = f.createEClass()
        c.setName("C")
        p.getEClassifiers().add(c)
        const values = f.createEAttribute()
        values.setName("v")
        values.setEType(getEcorePackage().getELong())
        c.getEStructuralFeatures().add(values)
        const rs = new EResourceSetImpl()
        rs.getPackageRegistry().registerPackage(p)

        for (const value of [12n, 2n ** 60n, -(2n ** 60n)]) {
            const o: EObject = p.getEFactoryInstance().create(c)
            o.eSet(values, value)
            const r = rs.createResource(new URI("file:///l.bin"))
            r.eContents().add(o)
            const bytes = new BinaryEncoder(r, null).encode(r).unwrap()
            const r2 = rs.createResource(new URI("file:///l2.bin"))
            expect(new BinaryDecoder(r2, null).decode(bytes).isOk()).toBeTruthy()
            expect(BigInt(r2.eContents().get(0).eGet(values))).toBe(value)
            rs.getResources().clear()
        }
    })
})
