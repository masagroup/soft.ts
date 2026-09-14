// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { BasicEObjectMap, EClass, EFactory, EMapEntry, EObject, EPackage, getEcoreFactory } from "./internal.js"

interface EObjectEMapEntry<K, V> extends EObject, EMapEntry<K, V> {}

describe("BasicEObjectMap", () => {
    test("constructor", () => {
        const mockClass = mock<EClass>()
        const cls = instance(mockClass)
        expect(new BasicEObjectMap<number, string>(cls))
    })

    test("newEntry", () => {
        const mockClass = mock<EClass>()
        const cls = instance(mockClass)
        const mockPackage = mock<EPackage>()
        const p = instance(mockPackage)
        const mockFactory = mock<EFactory>()
        const factory = instance(mockFactory)
        const mockEntry = mock<EObjectEMapEntry<number, string>>()
        const entry = instance(mockEntry)
        when(mockClass.getEPackage()).thenReturn(p)
        when(mockPackage.getEFactoryInstance()).thenReturn(factory)
        when(mockFactory.create(cls)).thenReturn(entry)
        const map = new BasicEObjectMap<number, string>(cls)
        map.put(2, "2")
        expect(map.getValue(2)).toBe("2")
    })

    test("containment and ownership", () => {
        const factory = getEcoreFactory()
        const annotation = factory.createEAnnotation()
        annotation.setSource("testSource")

        const details = annotation.getDetails()
        details.put("key1", "val1")

        expect(details.size()).toBe(1)
        expect(details.getValue("key1")).toBe("val1")

        const entry = details.get(0)
        expect(entry.eContainer()).toBe(annotation)
        expect(annotation.eContents().contains(entry)).toBe(true)

        details.put("key1", "valUpdated")
        expect(details.size()).toBe(1)
        expect(details.getValue("key1")).toBe("valUpdated")
    })
})
