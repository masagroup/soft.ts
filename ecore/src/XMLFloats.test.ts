// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import {
    EAttribute,
    EClass,
    EDataType,
    EList,
    EObject,
    EPackage,
    EResource,
    EResourceSetImpl,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY,
    URI
} from "./internal.js"

// a dynamic model with single and many float attributes
class FloatModel {
    ePackage: EPackage
    sample: EClass
    d1: EAttribute
    d2: EAttribute
    d3: EAttribute
    f1: EAttribute
    finite: EAttribute
    label: EAttribute
    ds: EAttribute

    constructor() {
        const factory = getEcoreFactory()
        const ecorePackage = getEcorePackage()
        this.ePackage = factory.createEPackage()
        this.ePackage.setName("floats")
        this.ePackage.setNsPrefix("floats")
        this.ePackage.setNsURI("http://floats")
        this.sample = factory.createEClass()
        this.sample.setName("Sample")
        this.ePackage.getEClassifiers().add(this.sample)
        const newAttribute = (name: string, eType: EDataType): EAttribute => {
            const eAttribute = factory.createEAttribute()
            eAttribute.setName(name)
            eAttribute.setEType(eType)
            this.sample.getEStructuralFeatures().add(eAttribute)
            return eAttribute
        }
        this.d1 = newAttribute("d1", ecorePackage.getEDouble())
        this.d2 = newAttribute("d2", ecorePackage.getEDouble())
        this.d3 = newAttribute("d3", ecorePackage.getEDouble())
        this.f1 = newAttribute("f1", ecorePackage.getEFloat())
        this.finite = newAttribute("finite", ecorePackage.getEDouble())
        this.label = newAttribute("label", ecorePackage.getEString())
        this.ds = newAttribute("ds", ecorePackage.getEDouble())
        this.ds.setUpperBound(UNBOUNDED_MULTIPLICITY)
    }

    newResource(): EResource {
        const eResourceSet = new EResourceSetImpl()
        eResourceSet.getPackageRegistry().registerPackage(this.ePackage)
        return eResourceSet.createResource(new URI("floats.xml"))
    }

    load(document: string): EObject {
        const eResource = this.newResource()
        eResource.loadFromString(document)
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(eResource.eContents().size()).toBe(1)
        return eResource.eContents().get(0)
    }
}

describe("XML floats", () => {
    // the infinite and NaN numbers, single or many, double or float, are written in the XSD
    // lexical space (INF, -INF, NaN) and read back
    test("special floats are written in the XSD lexical space", () => {
        const m = new FloatModel()
        const sample = m.ePackage.getEFactoryInstance().create(m.sample)
        sample.eSet(m.d1, Infinity)
        sample.eSet(m.d2, -Infinity)
        sample.eSet(m.d3, NaN)
        sample.eSet(m.f1, Infinity)
        sample.eSet(m.finite, 1.5)
        sample.eSet(m.label, "Infinity")
        const ds = sample.eGet(m.ds) as EList<number>
        for (const value of [Infinity, -Infinity, NaN, 0, 2.5]) ds.add(value)
        const eResource = m.newResource()
        eResource.eContents().add(sample)

        const document = eResource.saveToString()
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(document).toContain(`d1="INF"`)
        expect(document).toContain(`d2="-INF"`)
        expect(document).toContain(`d3="NaN"`)
        expect(document).toContain(`f1="INF"`)
        expect(document).toContain(`finite="1.5"`)
        expect(document).toContain(`label="Infinity"`)
        expect(document).toContain("<ds>INF</ds>")
        expect(document).toContain("<ds>-INF</ds>")
        expect(document).toContain("<ds>NaN</ds>")
        expect(document).toContain("<ds>0</ds>")
        expect(document).toContain("<ds>2.5</ds>")

        const decoded = m.load(document)
        expect(decoded.eGet(m.d1)).toBe(Infinity)
        expect(decoded.eGet(m.d2)).toBe(-Infinity)
        expect(decoded.eGet(m.d3)).toBeNaN()
        expect(decoded.eGet(m.f1)).toBe(Infinity)
        expect(decoded.eGet(m.finite)).toBe(1.5)
        expect(decoded.eGet(m.label)).toBe("Infinity")
        expect((decoded.eGet(m.ds) as EList<number>).toArray()).toEqual([Infinity, -Infinity, NaN, 0, 2.5])
    })

    // documents written with the Go (+Inf, -Inf) or JavaScript (Infinity) forms are still read
    test("Go and JavaScript special floats are read", () => {
        const m = new FloatModel()
        const decoded = m.load(`<?xml version="1.0" encoding="UTF-8"?>
<floats:Sample xmlns:floats="http://floats" d1="+Inf" d2="-Inf" d3="NaN" f1="-Infinity" finite="Infinity"/>`)
        expect(decoded.eGet(m.d1)).toBe(Infinity)
        expect(decoded.eGet(m.d2)).toBe(-Infinity)
        expect(decoded.eGet(m.d3)).toBeNaN()
        expect(decoded.eGet(m.f1)).toBe(-Infinity)
        expect(decoded.eGet(m.finite)).toBe(Infinity)
    })
})
