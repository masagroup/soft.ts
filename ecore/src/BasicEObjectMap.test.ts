// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, when } from "ts-mockito"
import { BasicEObjectMap, EClass, EFactory, EMapEntry, EObject, EPackage } from "./internal.js"

interface EObjectEMapEntry<K, V> extends EObject, EMapEntry<K, V> {}

describe("BasicEObjectMap", () => {
    test("constructor", () => {
        let mockClass = mock<EClass>()
        let cls = instance(mockClass)
        expect(new BasicEObjectMap<number, string>(cls))
    })

    test("newEntry", () => {
        let mockClass = mock<EClass>()
        let cls = instance(mockClass)
        let mockPackage = mock<EPackage>()
        let p = instance(mockPackage)
        let mockFactory = mock<EFactory>()
        let factory = instance(mockFactory)
        let mockEntry = mock<EObjectEMapEntry<number, string>>()
        let entry = instance(mockEntry)
        when(mockClass.ePackage).thenReturn(p)
        when(mockPackage.eFactoryInstance).thenReturn(factory)
        when(mockFactory.create(cls)).thenReturn(entry)
        let map = new BasicEObjectMap<number, string>(cls)
        map.put(2, "2")
        expect(map.getValue(2)).toBe("2")
    })
})
