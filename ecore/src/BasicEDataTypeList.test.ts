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
import { BasicEDataTypeList, EClass, EObjectInternal, EStructuralFeature } from "./internal.js"

describe("BasicEDataTypeList", () => {
    test("constructor", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)

        const mockFeature = mock<EStructuralFeature>()
        const feature = instance(mockFeature)

        const mockClass = mock<EClass>()
        const cls = instance(mockClass)

        const l = new BasicEDataTypeList<number>(owner, 1)
        expect(l.getNotifier()).toBe(owner)
        expect(l.getFeatureID()).toBe(1)

        when(mockOwner.eClass()).thenReturn(cls)
        when(mockClass.getEStructuralFeature(1)).thenReturn(feature)
        expect(l.getFeature()).toBe(feature)
    })
})
