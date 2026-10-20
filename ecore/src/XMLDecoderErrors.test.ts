// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EList, EObject, EResourceSetImpl, getEcoreFactory, getEcorePackage, UNBOUNDED_MULTIPLICITY, URI } from "./internal.js"

describe("XMLDecoder errors", () => {
    // an unknown element, nested content included, must not cost the known siblings after it
    test("unknown element keeps later siblings", () => {
        const factory = getEcoreFactory()
        const ePackage = factory.createEPackage()
        ePackage.setName("lenient")
        ePackage.setNsPrefix("lenient")
        ePackage.setNsURI("urn:lenient")
        const rootClass = factory.createEClass()
        rootClass.setName("Root")
        const itemClass = factory.createEClass()
        itemClass.setName("Item")
        const name = factory.createEAttribute()
        name.setName("name")
        name.setEType(getEcorePackage().getEString())
        itemClass.getEStructuralFeatures().add(name)
        const items = factory.createEReference()
        items.setName("items")
        items.setEType(itemClass)
        items.setContainment(true)
        items.setUpperBound(UNBOUNDED_MULTIPLICITY)
        rootClass.getEStructuralFeatures().add(items)
        ePackage.getEClassifiers().add(rootClass)
        ePackage.getEClassifiers().add(itemClass)

        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        const eResource = eResourceSet.createResource(new URI("lenient.xml"))
        eResource.loadFromString(`<?xml version="1.0" encoding="UTF-8"?>
<lenient:Root xmlns:lenient="urn:lenient">
  <items name="first"/>
  <unknown><nested><deeper/></nested></unknown>
  <items name="second"/>
</lenient:Root>`)

        expect(eResource.eContents().size()).toBe(1)
        const root = eResource.eContents().get(0)
        const list = root.eGet(items) as EList<EObject>
        expect(list.size()).toBe(2)
        expect(list.get(1).eGet(name)).toBe("second")
        expect(eResource.getErrors().isEmpty()).toBeFalsy()
    })

    // a data type contained by no package is reported as a load error instead of crashing the decode
    test("data type with no package is reported", () => {
        const factory = getEcoreFactory()

        // deliberately never added to the package's classifiers
        const detached = factory.createEDataType()
        detached.setName("Detached")
        detached.setInstanceTypeName("string")

        const single = factory.createEAttribute()
        single.setName("value")
        single.setEType(detached)

        const many = factory.createEAttribute()
        many.setName("values")
        many.setEType(detached)
        many.setUpperBound(UNBOUNDED_MULTIPLICITY)

        const eClass = factory.createEClass()
        eClass.setName("Root")
        eClass.getEStructuralFeatures().add(single)
        eClass.getEStructuralFeatures().add(many)

        const ePackage = factory.createEPackage()
        ePackage.setName("detachedtype")
        ePackage.setNsPrefix("d")
        ePackage.setNsURI("http://masa/test/detachedtype")
        ePackage.getEClassifiers().add(eClass)

        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        const eResource = eResourceSet.createResource(new URI("detachedtype.xml"))
        expect(() =>
            eResource.loadFromString(`<?xml version="1.0" encoding="UTF-8"?>
<d:Root xmlns:d="http://masa/test/detachedtype" value="7" values="1 2 3"/>`)
        ).not.toThrow()

        const errors = eResource.getErrors()
        expect(errors.isEmpty()).toBeFalsy()
        const reported = errors
            .toArray()
            .map((d) => d.message)
            .join("\n")
        expect(reported).toContain("Detached")
        expect(reported).toContain("value")
    })
})
