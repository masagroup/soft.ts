// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EcoreUtils, EObjectInternal, EResourceSetImpl, getEcoreFactory, getEcorePackage, URI } from "./internal.js"

describe("BasicEObject", () => {
    // eAnnotations is a containment inherited from EModelElement :
    // eContents of an EClass must contain its annotations
    test("eContentsInherited", () => {
        const eFactory = getEcoreFactory()
        const eClass = eFactory.createEClass()
        const eAnnotation = eFactory.createEAnnotation()
        eClass.getEAnnotations().add(eAnnotation)
        expect(eClass.eContents().toArray()).toEqual([eAnnotation])

        const ePackage = eFactory.createEPackage()
        ePackage.getEClassifiers().add(eClass)
        const visited = [...ePackage.eAllContents()]
        expect(visited).toEqual([ePackage.getEFactoryInstance(), eClass, eAnnotation])
    })

    // eType is a cross reference inherited from ETypedElement :
    // eCrossReferences of an EReference must contain it so that resolveAll resolves it
    test("eCrossReferencesInherited", () => {
        const eFactory = getEcoreFactory()
        const eResourceSet = new EResourceSetImpl()

        // the referenced class in its own resource
        const eTargetPackage = eFactory.createEPackage()
        eTargetPackage.setName("target")
        eTargetPackage.setNsURI("http://target")
        const eTargetClass = eFactory.createEClass()
        eTargetClass.setName("Target")
        eTargetPackage.getEClassifiers().add(eTargetClass)
        const eTargetResource = eResourceSet.createResource(new URI("memory://target.ecore"))
        eTargetResource.eContents().add(eTargetPackage)

        // the referencing class with a proxy as eType in another resource
        const ePackage = eFactory.createEPackage()
        ePackage.setName("source")
        ePackage.setNsURI("http://source")
        const eClass = eFactory.createEClass()
        eClass.setName("Source")
        ePackage.getEClassifiers().add(eClass)
        const eReference = eFactory.createEReference()
        eReference.setName("target")
        const eProxy = eFactory.createEClass()
        const eProxyInternal = eProxy as unknown as EObjectInternal
        eProxyInternal.eSetProxyURI(new URI("memory://target.ecore#//Target"))
        eReference.setEType(eProxy)
        eClass.getEStructuralFeatures().add(eReference)
        const eResource = eResourceSet.createResource(new URI("memory://source.ecore"))
        eResource.eContents().add(ePackage)

        // the proxy is not resolved until the cross references are visited
        const eTypeFeature = getEcorePackage().getETypedElement_EType()
        expect(eReference.eGetResolve(eTypeFeature, false)).toBe(eProxy)

        EcoreUtils.resolveAll(ePackage)
        expect(eReference.eGetResolve(eTypeFeature, false)).toBe(eTargetClass)
        expect(eReference.eCrossReferences().contains(eTargetClass)).toBeTruthy()
    })
})
