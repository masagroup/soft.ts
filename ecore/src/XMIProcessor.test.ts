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
import { EResourceSet, XMIProcessor } from "./internal.js"

describe("XMIProcessor", () => {
    test("constructor.no.resourceset", () => {
        const xmlProcessor = new XMIProcessor()
        expect(xmlProcessor).not.toBeNull()
        expect(xmlProcessor.getResourceSet()).not.toBeNull()
    })

    test("constructor.resourceset", () => {
        const mockEResourceSet = mock<EResourceSet>()
        const eResourceSet = instance(mockEResourceSet)
        when(mockEResourceSet.getResources()).thenReturn(null)
        const xmlProcessor = new XMIProcessor(eResourceSet)
        expect(xmlProcessor).not.toBeNull()
        expect(xmlProcessor.getResourceSet()).toBe(eResourceSet)
    })
})
