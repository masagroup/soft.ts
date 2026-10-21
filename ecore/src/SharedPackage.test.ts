// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { afterEach, describe, expect, test } from "vitest"
import {
    checkSameImplementation,
    DynamicEObjectImpl,
    EClass,
    EcoreUtils,
    EFactory,
    EFactoryExt,
    EList,
    EObject,
    EObjectFactory,
    EPackage,
    EPackageRegistryImpl,
    EReference,
    EResourceSetImpl,
    getEcoreFactory,
    getEcorePackage,
    getObjectFactory,
    getRegistryFactory,
    setImplementationChecks,
    URI
} from "./internal.js"

// a package shared by two implementations: Container contains many Items, Item references an Item
class Model {
    ePackage: EPackage
    container: EClass
    item: EClass
    items: EReference
    other: EReference
    owner: EReference

    constructor() {
        const f = getEcoreFactory()
        this.ePackage = f.createEPackage()
        this.ePackage.setName("shared")
        this.ePackage.setNsPrefix("shared")
        this.ePackage.setNsURI("urn:shared")
        this.container = f.createEClass()
        this.container.setName("Container")
        this.item = f.createEClass()
        this.item.setName("Item")
        const name = f.createEAttribute()
        name.setName("name")
        name.setEType(getEcorePackage().getEString())
        this.item.getEStructuralFeatures().add(name)
        this.items = f.createEReference()
        this.items.setName("items")
        this.items.setEType(this.item)
        this.items.setContainment(true)
        this.items.setUpperBound(-1)
        this.container.getEStructuralFeatures().add(this.items)
        this.owner = f.createEReference()
        this.owner.setName("owner")
        this.owner.setEType(this.container)
        this.owner.setEOpposite(this.items)
        this.items.setEOpposite(this.owner)
        this.item.getEStructuralFeatures().add(this.owner)
        this.other = f.createEReference()
        this.other.setName("other")
        this.other.setEType(this.item)
        this.item.getEStructuralFeatures().add(this.other)
        this.ePackage.getEClassifiers().add(this.container)
        this.ePackage.getEClassifiers().add(this.item)
    }
}

// one implementation: objects tell which factory built them
class ImplementationFactory extends EFactoryExt {
    constructor(
        ePackage: EPackage,
        readonly name: string
    ) {
        super()
        this.setSharedEPackage(ePackage)
    }

    create(eClass: EClass): EObject {
        if (this.getEPackage() != eClass.getEPackage()) throw new Error("invalid class")
        const o = new ImplementationObject(this)
        o.setEClass(eClass)
        return o
    }
}

class ImplementationObject extends DynamicEObjectImpl implements EObjectFactory {
    constructor(private _factory: EFactory) {
        super()
    }

    eFactory(): EFactory {
        return this._factory
    }
}

describe("shared package", () => {
    afterEach(() => setImplementationChecks(false))

    test("registry factories", () => {
        const m = new Model()
        const a = new ImplementationFactory(m.ePackage, "a")
        const b = new ImplementationFactory(m.ePackage, "b")
        const parent = new EPackageRegistryImpl()
        const registry = new EPackageRegistryImpl(parent)

        // the factory instance of the package by default
        registry.registerPackage(m.ePackage)
        expect(registry.getFactory("urn:shared")).toBe(m.ePackage.getEFactoryInstance())

        // a registered factory comes first
        registry.registerFactory(a)
        expect(registry.getFactory("urn:shared")).toBe(a)

        // unregistering the package keeps the factory
        registry.unregisterPackage(m.ePackage)
        expect(registry.getPackage("urn:shared")).toBeNull()
        expect(registry.getFactory("urn:shared")).toBe(a)

        // a factory registered in the delegate is found
        registry.unregisterFactory(a)
        expect(registry.getFactory("urn:shared")).toBeNull()
        parent.putFactory("urn:shared", b)
        expect(registry.getFactory("urn:shared")).toBe(b)
        parent.removeFactory("urn:shared")
        expect(registry.getFactory("urn:shared")).toBeNull()

        // a factory without package can not be registered by its package
        expect(() => registry.registerFactory(new EFactoryExt())).toThrow("the factory has no package")

        // the global registry is untouched
        expect(getRegistryFactory(null, m.ePackage)).toBe(m.ePackage.getEFactoryInstance())
        expect(getRegistryFactory(registry, m.ePackage)).toBe(m.ePackage.getEFactoryInstance())
    })

    test("setSharedEPackage", () => {
        const m = new Model()
        const instance = m.ePackage.getEFactoryInstance()
        const a = new ImplementationFactory(m.ePackage, "a")
        expect(a.getEPackage()).toBe(m.ePackage)
        // the package keeps its factory instance
        expect(m.ePackage.getEFactoryInstance()).toBe(instance)
        expect(instance.getEPackage()).toBe(m.ePackage)

        const o = a.create(m.item)
        expect(o.eClass()).toBe(m.item)
        expect(getObjectFactory(o)).toBe(a)
        // an object that does not tell: the factory instance of its package
        expect(getObjectFactory(instance.create(m.item))).toBe(instance)
    })

    test("copy keeps the implementation", () => {
        const m = new Model()
        const a = new ImplementationFactory(m.ePackage, "a")
        const container = a.create(m.container)
        const item = a.create(m.item)
        ;(container.eGet(m.items) as EList<EObject>).add(item)
        const copy = EcoreUtils.copy(container)
        expect(getObjectFactory(copy)).toBe(a)
        expect(getObjectFactory((copy.eGet(m.items) as EList<EObject>).get(0))).toBe(a)
    })

    test.each(["xml", "bin"])("%s round trip uses the factory of the registry", (ext) => {
        const m = new Model()
        const a = new ImplementationFactory(m.ePackage, "a")
        const b = new ImplementationFactory(m.ePackage, "b")
        const newResourceSet = (f: EFactory) => {
            const rs = new EResourceSetImpl()
            rs.getPackageRegistry().registerPackage(m.ePackage)
            rs.getPackageRegistry().registerFactory(f)
            return rs
        }

        const source = newResourceSet(a).createResource(new URI("source." + ext))
        const container = a.create(m.container)
        const items = container.eGet(m.items) as EList<EObject>
        items.add(a.create(m.item))
        items.add(a.create(m.item))
        items.get(0).eSet(m.other, items.get(1))
        source.eContents().add(container)
        const target = newResourceSet(b).createResource(new URI("target." + ext))
        if (ext == "xml") {
            target.loadFromString(source.saveToString())
        } else {
            target.loadFromBuffer(source.saveToBuffer())
        }
        expect(target.getErrors().isEmpty()).toBeTruthy()

        const loaded = target.eContents().get(0)
        expect(loaded.eClass()).toBe(m.container)
        expect(getObjectFactory(loaded)).toBe(b)
        const loadedItems = loaded.eGet(m.items) as EList<EObject>
        expect(loadedItems.size()).toBe(2)
        expect(getObjectFactory(loadedItems.get(0))).toBe(b)
        expect(loadedItems.get(0).eGet(m.other)).toBe(loadedItems.get(1))
    })

    test("mixing implementations", () => {
        const m = new Model()
        const a = new ImplementationFactory(m.ePackage, "a")
        const b = new ImplementationFactory(m.ePackage, "b")

        // off by default
        const container = a.create(m.container)
        ;(container.eGet(m.items) as EList<EObject>).add(b.create(m.item))
        checkSameImplementation(a.create(m.item), b.create(m.item))

        setImplementationChecks(true)
        // containment list
        expect(() => (container.eGet(m.items) as EList<EObject>).add(b.create(m.item))).toThrow(
            "cannot mix implementations of the package 'urn:shared'"
        )
        // container
        expect(() => b.create(m.item).eSet(m.owner, a.create(m.container))).toThrow("cannot mix implementations")
        // single reference
        expect(() => a.create(m.item).eSet(m.other, b.create(m.item))).toThrow("cannot mix implementations")
        // resource roots
        const resource = new EResourceSetImpl().createResource(new URI("mixed.xml"))
        resource.eContents().add(a.create(m.container))
        expect(() => resource.eContents().add(b.create(m.container))).toThrow("cannot mix implementations")
        // same implementation, or objects that do not tell
        ;(container.eGet(m.items) as EList<EObject>).add(a.create(m.item))
        a.create(m.item).eSet(m.other, m.ePackage.getEFactoryInstance().create(m.item))
        resource.eContents().add(a.create(m.container))
    })
})
