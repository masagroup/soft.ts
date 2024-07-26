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
import {
    EAttribute,
    EAttributeExt,
    EDataType,
    EStructuralFeature,
    EStructuralFeatureExt,
    isEAttribute
} from "./internal.js"

describe("EAttributeExt", () => {
    test("basicGetEAttributeType", () => {
        const a = new EAttributeExt()
        expect(a.basicGetEAttributeType()).toBeNull()

        const mockDataType = mock<EDataType>()
        const dataType = instance(mockDataType)
        a.setEType(dataType)
        expect(a.basicGetEAttributeType()).toBe(dataType)
    })

    test("isEAttribute", () => {
        const feature = new EStructuralFeatureExt()
        expect(isEAttribute(feature)).toBeFalsy()

        const attribute = new EAttributeExt()
        expect(isEAttribute(attribute)).toBeTruthy()

        const mockFeature = mock<EStructuralFeature>()
        const mockFeatureInstance = instance(mockFeature)
        expect(isEAttribute(mockFeatureInstance)).toBeFalsy()

        const mockAttribute = mock<EAttribute>()
        const mockAttributeInstance = instance(mockAttribute)
        when(mockAttribute.getEAttributeType()).thenReturn(null)
        expect(isEAttribute(mockAttributeInstance)).toBeTruthy()
    })
})
