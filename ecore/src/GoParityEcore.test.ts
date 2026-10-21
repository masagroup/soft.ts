// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

// regressions of the ecore fixes of soft.go #209
import { describe, expect, test } from "vitest"
import {
    BasicEList,
    EcoreUtils,
    EObject,
    EObjectInternal,
    EResourceImpl,
    EResourceSetImpl,
    EURIConverterImpl,
    getEcoreFactory,
    getEcorePackage,
    IncrementalIDManager,
    ImmutableEList,
    Notification,
    EventType,
    URI,
    EStoreList,
    EStore
} from "./internal.js"

function model() {
    const f = getEcoreFactory()
    const p = f.createEPackage()
    p.setName("p")
    p.setNsURI("http://p")
    const x = f.createEClass()
    x.setName("X")
    const x1 = f.createEAttribute()
    x1.setName("x1")
    x1.setEType(getEcorePackage().getEString())
    x.getEStructuralFeatures().add(x1)
    const y = f.createEClass()
    y.setName("Y")
    const y1 = f.createEAttribute()
    y1.setName("y1")
    y1.setEType(getEcorePackage().getEInt())
    y.getEStructuralFeatures().add(y1)
    const c = f.createEClass()
    c.setName("C")
    c.getESuperTypes().add(x)
    c.getESuperTypes().add(y)
    p.getEClassifiers().addAll(new ImmutableEList([x, y, c]))
    return { f, p, x, y, c, x1, y1 }
}

describe("ecore go parity", () => {
    test("BasicEList moveTo size", () => {
        const l = new BasicEList<number>([1, 2])
        expect(() => l.moveTo(0, 2)).toThrow()
    })

    test("UniqueIDManager id taken from previous owner", () => {
        const m = new IncrementalIDManager()
        const { f, c } = model()
        const { p } = model()
        const a = p.getEFactoryInstance().create(p.getEClassifier("C") as any)
        const b = p.getEFactoryInstance().create(p.getEClassifier("C") as any)
        m.setID(a, 1)
        m.setID(b, 1)
        expect(m.getEObject(1)).toBe(b)
        expect(m.getID(a)).toBeUndefined()
    })

    test("Notification feature id in class of notifier", () => {
        const { p, c, y1 } = model()
        const o = p.getEFactoryInstance().create(c)
        const n = new Notification(o, EventType.SET, y1, 0, 1)
        expect(y1.getFeatureID()).toBe(0)
        expect(n.getFeatureID()).toBe(c.getFeatureID(y1))
    })

    test("uri map cycle", () => {
        const conv = new EURIConverterImpl()
        conv.getURIMap().set(new URI("file:/a/"), new URI("file:/b/"))
        conv.getURIMap().set(new URI("file:/b/"), new URI("file:/a/"))
        expect(() => conv.normalize(new URI("file:/a/x.xml"))).not.toThrow()
    })

    test("uri map longest prefix", () => {
        const conv = new EURIConverterImpl()
        conv.getURIMap().set(new URI("file:/a/"), new URI("file:/x/"))
        conv.getURIMap().set(new URI("file:/a/b/"), new URI("file:/y/"))
        expect(conv.normalize(new URI("file:/a/b/m.xml")).toString()).toBe("file:/y/m.xml")
    })

    test("uri map segment boundary", () => {
        const conv = new EURIConverterImpl()
        conv.getURIMap().set(new URI("file:/a"), new URI("file:/x"))
        expect(conv.normalize(new URI("file:/ab/m.xml")).toString()).toBe("file:/ab/m.xml")
    })

    test("resource without uri", () => {
        const r = new EResourceImpl()
        expect(() => r.saveToString()).not.toThrow(TypeError)
    })

    test("resource fragments", () => {
        const r = new EResourceImpl()
        r.setURI(new URI("file:///a.xml"))
        const pk = getEcoreFactory().createEPackage()
        r.eContents().add(pk)
        expect(r.getEObject("?")).toBeFalsy()
        expect(r.getEObject("/abc")).toBeFalsy()
        expect(r.getEObject("/0abc")).toBeFalsy()
    })

    test("proxy cycle", () => {
        const f = getEcoreFactory()
        const rs = new EResourceSetImpl()
        const ra = rs.createResource(new URI("memory:/a"))
        const rb = rs.createResource(new URI("memory:/b"))
        const proxyA = f.createEClass()
        ;(proxyA as any as EObjectInternal).eSetProxyURI(new URI("memory:/a#/"))
        const proxyB = f.createEClass()
        ;(proxyB as any as EObjectInternal).eSetProxyURI(new URI("memory:/b#/"))
        ra.eContents().add(proxyB)
        rb.eContents().add(proxyA)
        let resolved: EObject
        expect(() => (resolved = EcoreUtils.resolveInResourceSet(proxyA, rs))).not.toThrow()
        expect(resolved).toBe(proxyA)
    })

    test("dynamic attribute set to default is not set", () => {
        const { p, c, y1 } = model()
        const o = p.getEFactoryInstance().create(c)
        o.eSet(y1, 0)
        expect(o.eIsSet(y1)).toBe(false)
    })

    test("invalid literal throws", () => {
        const { p, y } = model()
        const f = getEcoreFactory()
        const dt = f.createEDataType()
        dt.setName("T")
        dt.setInstanceTypeName("int")
        p.getEClassifiers().add(dt)
        expect(() => p.getEFactoryInstance().createFromString(dt, "12x")).toThrow()
    })

    test("invalid default literal (enum) gives the data type default", () => {
        const { f, p, c } = model()
        const e = f.createEEnum()
        e.setName("E")
        const l = f.createEEnumLiteral()
        l.setName("a")
        l.setLiteral("a")
        l.setValue(0)
        e.getELiterals().add(l)
        p.getEClassifiers().add(e)
        const a = f.createEAttribute()
        a.setName("ee")
        a.setEType(e)
        a.setDefaultValueLiteral("zz")
        c.getEStructuralFeatures().add(a)
        const o = p.getEFactoryInstance().create(c)
        expect(() => o.eGet(a)).not.toThrow()
    })

    test("renamed classifier", () => {
        const { p, c } = model()
        expect(p.getEClassifier("C")).toBe(c)
        c.setName("D")
        expect(p.getEClassifier("D")).toBe(c)
        expect(p.getEClassifier("C")).toBeFalsy()
    })

    test("EStoreList addAll copies the collection", () => {
        const { p, c, x1 } = model()
        const owner = p.getEFactoryInstance().create(c)
        const many = getEcoreFactory().createEAttribute()
        many.setName("names")
        many.setUpperBound(-1)
        many.setUnique(false)
        many.setEType(getEcorePackage().getEString())
        c.getEStructuralFeatures().add(many)
        let received: any = null
        const store = {
            size: () => 0,
            addAll: (_o: any, _f: any, _i: number, col: any) => {
                received = col
            }
        } as any as EStore
        const l = new EStoreList<string>(owner, many, store)
        const source = new BasicEList<string>(["a", "b"])
        l.addAll(source)
        source.clear()
        expect(received.toArray()).toEqual(["a", "b"])
    })

    test("eDerivedFeatureID keeps the id of a container that is not a super type", () => {
        const { p, c, x, y, y1 } = model()
        const o = p.getEFactoryInstance().create(c) as any
        expect(o.eDerivedFeatureID(y, 0)).toBe(c.getFeatureID(y1))
        const other = getEcoreFactory().createEClass()
        expect(o.eDerivedFeatureID(other, 0)).toBe(0)
        expect(o.eDerivedFeatureID(x, 0)).toBe(0)
    })

    test("fragment id with a query", () => {
        const r = new EResourceImpl()
        r.setURI(new URI("file:///a.xml"))
        const ePackage = getEcoreFactory().createEPackage()
        r.eContents().add(ePackage)
        r.setObjectIDManager(new IncrementalIDManager())
        r.getObjectIDManager().setID(ePackage, 3)
        expect(r.getEObject("3?q?")).toBe(ePackage)
        expect(r.getEObject("3??")).toBe(ePackage)
        expect(r.getEObject("/0")).toBe(ePackage)
    })

    test("invalid int default literal gives the data type default", () => {
        const { f, p, c } = model()
        const dt = f.createEDataType()
        dt.setName("I")
        dt.setInstanceTypeName("int")
        p.getEClassifiers().add(dt)
        const a = f.createEAttribute()
        a.setName("i")
        a.setEType(dt)
        a.setDefaultValueLiteral("1.5")
        c.getEStructuralFeatures().add(a)
        expect(a.getDefaultValue()).toBe(dt.getDefaultValue())
        a.setDefaultValueLiteral("7")
        expect(a.getDefaultValue()).toBe(7)
    })

    test("factory literals", () => {
        const { f, p } = model()
        const create = (typeName: string, literal: string) => {
            const dt = f.createEDataType()
            dt.setName("T" + p.getEClassifiers().size())
            dt.setInstanceTypeName(typeName)
            p.getEClassifiers().add(dt)
            return p.getEFactoryInstance().createFromString(dt, literal)
        }
        for (const t of ["int", "int64", "int32", "int16", "int8", "uint64", "float64", "float32", "bool", "java.util.Date"]) {
            expect(() => create(t, "12x"), t).toThrow(/not a valid literal/)
        }
        expect(create("int", "12")).toBe(12)
        expect(create("int64", "-12")).toBe(-12n)
        expect(() => create("int8", "128")).toThrow()
        expect(() => create("uint64", "-1")).toThrow()
        expect(create("float64", "1.5e3")).toBe(1500)
        expect(create("float64", "-Inf")).toBe(-Infinity)
        expect(create("float64", "NaN")).toBeNaN()
        expect(() => create("float32", "1e39")).toThrow()
        expect(create("bool", "T")).toBe(true)
        expect(create("bool", "0")).toBe(false)
        expect(() => create("bool", "yes")).toThrow()
    })
})
