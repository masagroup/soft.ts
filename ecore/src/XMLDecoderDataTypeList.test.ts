// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EAttribute, EList, EPackage, EResourceSetImpl, getEcoreFactory, getEcorePackage, UNBOUNDED_MULTIPLICITY, URI } from "./internal.js"

function newTagListModel(): { ePackage: EPackage; tags: EAttribute; counts: EAttribute } {
    const f = getEcoreFactory()
    const ePackage = f.createEPackage()
    ePackage.setName("tags")
    ePackage.setNsPrefix("tags")
    ePackage.setNsURI("urn:tags")
    const root = f.createEClass()
    root.setName("Root")
    const tags = f.createEAttribute()
    tags.setName("tags")
    tags.setEType(getEcorePackage().getEString())
    tags.setUpperBound(UNBOUNDED_MULTIPLICITY)
    root.getEStructuralFeatures().add(tags)
    const counts = f.createEAttribute()
    counts.setName("counts")
    counts.setEType(getEcorePackage().getEInt())
    counts.setUpperBound(UNBOUNDED_MULTIPLICITY)
    root.getEStructuralFeatures().add(counts)
    ePackage.getEClassifiers().add(root)
    return { ePackage, tags, counts }
}

describe("XMLDecoder data type list", () => {
    // a list written as one XML attribute is split on white space, as EMF reads it, instead of
    // being dropped
    test("a list written as one attribute is split on white space", () => {
        const { ePackage, tags, counts } = newTagListModel()
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        const eResource = eResourceSet.createResource(new URI("tags.xml"))
        eResource.loadFromString(
            '<?xml version="1.0" encoding="UTF-8"?>\n<tags:Root xmlns:tags="urn:tags" tags=" alpha  beta\tgamma " counts="1 2 3"/>'
        )
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        const root = eResource.eContents().get(0)
        expect((root.eGet(tags) as EList<string>).toArray()).toEqual(["alpha", "beta", "gamma"])
        expect((root.eGet(counts) as EList<number>).toArray()).toEqual([1, 2, 3])
    })
})
