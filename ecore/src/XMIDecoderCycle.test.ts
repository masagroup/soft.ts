// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EClass, EDiagnostic, EPackage, EResource, EResourceSetImpl, URI } from "./internal.js"

// cyclePackage is a package of the classes A, B and C, with the super types given by class
function cyclePackage(superTypes: Record<string, string>): string {
    let s = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" name="cycle" nsURI="http://example.com/cycle" nsPrefix="cycle">
`
    for (const name of ["A", "B", "C"]) {
        s += `  <eClassifiers xsi:type="ecore:EClass" name="${name}"`
        const supers = superTypes[name]
        if (supers) {
            s += ` eSuperTypes="${supers}"`
        }
        s += `>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="${name.toLowerCase()}">
      <eType xsi:type="ecore:EDataType" href="http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    </eStructuralFeatures>
  </eClassifiers>
`
    }
    return s + "</ecore:EPackage>\n"
}

function load(document: string): EResource {
    const eResource = new EResourceSetImpl().createResource(new URI("file:///cycle.ecore"))
    eResource.loadFromString(document)
    return eResource
}

function errors(eResource: EResource): string[] {
    return eResource
        .getErrors()
        .toArray()
        .map((d: EDiagnostic) => d.message)
}

describe("XMIDecoder super types cycle", () => {
    // a package whose super types close a cycle loads with an error, without recursing without end
    test.each([
        ["self", { A: "#//A" }],
        ["two classes", { A: "#//B", B: "#//A" }],
        ["forward and back", { B: "#//C", C: "#//B" }],
        ["three classes", { A: "#//B", B: "#//C", C: "#//A" }],
        ["above a cycle", { A: "#//B", B: "#//A", C: "#//A" }]
    ])("%s", (_, superTypes: Record<string, string>) => {
        const messages = errors(load(cyclePackage(superTypes)))
        expect(messages.length, messages.join("\n")).toBe(1)
        expect(messages[0]).toContain("cycle of super types")
    })

    // a hierarchy without cycle, diamond included, loads without error
    test("diamond", () => {
        const eResource = load(cyclePackage({ B: "#//A", C: "#//A #//B" }))
        expect(errors(eResource)).toEqual([])
        const c = (eResource.eContents().get(0) as EPackage).getEClassifier("C") as EClass
        expect(c.getEAllAttributes().size()).toBe(3)
    })
})
