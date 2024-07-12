// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock } from "ts-mockito"
import { EPackage, EResourceSet, XMIProcessor } from "./internal.js"

describe("XMIProcessor", () => {
    test("constructor.no.resourceset", () => {
        let xmlProcessor = new XMIProcessor()
        expect(xmlProcessor).not.toBeNull()
        expect(xmlProcessor.getResourceSet()).not.toBeNull()
    })

    test("constructor.resourceset", () => {
        let mockPackage = mock<EPackage>()
        let mockEResourceSet = mock<EResourceSet>()
        let eResourceSet = instance(mockEResourceSet)
        let xmlProcessor = new XMIProcessor(eResourceSet)
        expect(xmlProcessor).not.toBeNull()
        expect(xmlProcessor.getResourceSet()).toBe(eResourceSet)
    })
})
