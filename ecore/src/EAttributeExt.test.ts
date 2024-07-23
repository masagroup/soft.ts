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
import { EAttribute, EAttributeExt, EDataType, EStructuralFeature, EStructuralFeatureExt, isEAttribute } from "./internal.js"

describe("EAttributeExt", () => {
    test("basicGetEAttributeType", () => {
        let a = new EAttributeExt()
        expect(a.basicGetEAttributeType()).toBeNull()

        let mockDataType = mock<EDataType>()
        let dataType = instance(mockDataType)
        a.setEType(dataType)
        expect(a.basicGetEAttributeType()).toBe(dataType)
    })

    test("isEAttribute", () => {
        let feature = new EStructuralFeatureExt()
        expect(isEAttribute(feature)).toBeFalsy()

        let attribute = new EAttributeExt()
        expect(isEAttribute(attribute)).toBeTruthy()

        let mockFeature = mock<EStructuralFeature>()
        let mockFeatureInstance = instance(mockFeature)
        expect(isEAttribute(mockFeatureInstance)).toBeFalsy()

        let mockAttribute = mock<EAttribute>()
        let mockAttributeInstance = instance(mockAttribute)
        when(mockAttribute.getEAttributeType()).thenReturn(null)
        expect(isEAttribute(mockAttributeInstance)).toBeTruthy()
    })
})
