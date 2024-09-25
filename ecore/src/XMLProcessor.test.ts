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
import { EPackage, EResourceSet, XMLProcessor } from "./internal.js"

describe("XMLProcessor", () => {
    test("constructor.packages", () => {
        const mockPackage = mock<EPackage>()
        const ePackage = instance(mockPackage)
        const xmlProcessor = new XMLProcessor([ePackage])
        expect(xmlProcessor).not.toBeNull()
    })

    test("constructor.resourceset", () => {
        const mockEResourceSet = mock<EResourceSet>()
        const eResourceSet = instance(mockEResourceSet)
        when(mockEResourceSet.createResource(null)).thenReturn(null)
        const xmlProcessor = new XMLProcessor(eResourceSet)
        expect(xmlProcessor).not.toBeNull()
        expect(xmlProcessor.getResourceSet()).toBe(eResourceSet)
    })
})
