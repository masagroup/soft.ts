// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { BasicEList, EList, EObject, EResourceImpl, EResourceSetImpl, getEcoreFactory, getEcorePackage, URI } from "./internal.js"

describe("EResourceImpl id index", () => {
    // lookups follow ids that change, and objects attached or detached after the first lookup
    test("getEObject by id follows the model", () => {
        const factory = getEcoreFactory()
        const ePackage = factory.createEPackage()
        ePackage.setName("ids")
        ePackage.setNsPrefix("ids")
        ePackage.setNsURI("urn:ids")
        const item = factory.createEClass()
        item.setName("Item")
        const id = factory.createEAttribute()
        id.setName("id")
        id.setEType(getEcorePackage().getEString())
        id.setID(true)
        item.getEStructuralFeatures().add(id)
        ePackage.getEClassifiers().add(item)
        const resource = new EResourceImpl()
        const add = (value: string): EObject => {
            const o = ePackage.getEFactoryInstance().create(item)
            o.eSet(id, value)
            resource.eContents().add(o)
            return o
        }
        for (let i = 0; i < 3; i++) add("id" + i)

        const first = resource.eContents().get(0)
        expect(resource.getEObject("id0")).toBe(first)

        first.eSet(id, "renamed")
        expect(resource.getEObject("renamed")).toBe(first)
        expect(resource.getEObject("id0")).toBeNull()

        const added = add("added")
        expect(resource.getEObject("added")).toBe(added)
        resource.eContents().remove(added)
        expect(resource.getEObject("added")).toBeNull()
        expect(resource.getEObject("unknown")).toBeNull()
    })

    // a miss on a tree whose classes declare no id attribute does not rescan it, until an object with
    // an id attribute is attached
    test("getEObject scans a tree without id attribute once", () => {
        const factory = getEcoreFactory()
        const ePackage = factory.createEPackage()
        ePackage.setName("ids")
        ePackage.setNsPrefix("ids")
        ePackage.setNsURI("urn:ids")
        const named = factory.createEClass()
        named.setName("Named")
        const name = factory.createEAttribute()
        name.setName("name")
        name.setEType(getEcorePackage().getEString())
        named.getEStructuralFeatures().add(name)
        const item = factory.createEClass()
        item.setName("Item")
        const id = factory.createEAttribute()
        id.setName("id")
        id.setEType(getEcorePackage().getEString())
        id.setID(true)
        item.getEStructuralFeatures().add(id)
        ePackage.getEClassifiers().add(named)
        ePackage.getEClassifiers().add(item)
        const resource = new EResourceImpl()
        for (let i = 0; i < 3; i++) {
            const o = ePackage.getEFactoryInstance().create(named)
            o.eSet(name, "n" + i)
            resource.eContents().add(o)
        }
        const internals = resource as any

        expect(resource.getEObject("n1")).toBeNull()
        expect(internals._idless).toBeTruthy()
        const scanned = internals._idIndex
        expect(resource.getEObject("n2")).toBeNull()
        expect(internals._idIndex).toBe(scanned)

        const late = ePackage.getEFactoryInstance().create(item)
        late.eSet(id, "late")
        resource.eContents().add(late)
        expect(internals._idless).toBeFalsy()
        expect(resource.getEObject("late")).toBe(late)
        late.eSet(id, "renamed")
        expect(resource.getEObject("renamed")).toBe(late)
    })
})

describe("AbstractEList addUnique", () => {
    // addUnique appends without the duplicate check add makes on a unique list
    test("addUnique", () => {
        const l = new BasicEList<number>([], true)
        l.add(1)
        expect(l.add(1)).toBeFalsy()
        l.addUnique(2)
        expect(l.toArray()).toEqual([1, 2])
    })
})

describe("XMLDecoder long list", () => {
    // a long many-valued feature loads every item, in document order
    test("loads a long list in order", () => {
        const factory = getEcoreFactory()
        const ePackage = factory.createEPackage()
        ePackage.setName("long")
        ePackage.setNsPrefix("long")
        ePackage.setNsURI("urn:long")
        const root = factory.createEClass()
        root.setName("Root")
        const item = factory.createEClass()
        item.setName("Item")
        const name = factory.createEAttribute()
        name.setName("name")
        name.setEType(getEcorePackage().getEString())
        item.getEStructuralFeatures().add(name)
        const items = factory.createEReference()
        items.setName("items")
        items.setEType(item)
        items.setContainment(true)
        items.setUpperBound(-1)
        root.getEStructuralFeatures().add(items)
        ePackage.getEClassifiers().add(root)
        ePackage.getEClassifiers().add(item)

        const n = 2000
        let document = `<?xml version="1.0" encoding="UTF-8"?>\n<long:Root xmlns:long="urn:long">\n`
        for (let i = 0; i < n; i++) document += `  <items name="item${i}"/>\n`
        document += "</long:Root>\n"

        const rs = new EResourceSetImpl()
        rs.getPackageRegistry().registerPackage(ePackage)
        const resource = rs.createResource(new URI("long.xml"))
        resource.loadFromString(document)
        expect(resource.getErrors().isEmpty()).toBeTruthy()
        const list = resource.eContents().get(0).eGet(items) as EList<EObject>
        expect(list.size()).toBe(n)
        expect(list.get(0).eGet(name)).toBe("item0")
        expect(list.get(n - 1).eGet(name)).toBe("item" + (n - 1))
    })

    // a long many-valued data type feature loads every value, in document order
    test("loads a long data type list in order", () => {
        const factory = getEcoreFactory()
        const ePackage = factory.createEPackage()
        ePackage.setName("tags")
        ePackage.setNsPrefix("tags")
        ePackage.setNsURI("urn:tags")
        const root = factory.createEClass()
        root.setName("Root")
        const tags = factory.createEAttribute()
        tags.setName("tags")
        tags.setEType(getEcorePackage().getEString())
        tags.setUpperBound(-1)
        root.getEStructuralFeatures().add(tags)
        ePackage.getEClassifiers().add(root)

        const n = 2000
        let document = `<?xml version="1.0" encoding="UTF-8"?>\n<tags:Root xmlns:tags="urn:tags">\n`
        for (let i = 0; i < n; i++) document += `  <tags>tag${i}</tags>\n`
        document += "</tags:Root>\n"

        const rs = new EResourceSetImpl()
        rs.getPackageRegistry().registerPackage(ePackage)
        const resource = rs.createResource(new URI("tags.xml"))
        resource.loadFromString(document)
        expect(resource.getErrors().isEmpty()).toBeTruthy()
        const list = resource.eContents().get(0).eGet(tags) as EList<string>
        expect(list.size()).toBe(n)
        expect(list.get(0)).toBe("tag0")
        expect(list.get(n - 1)).toBe("tag" + (n - 1))
    })
})
