// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, verify, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { EResourceImpl, EResourceInternal, EResourceSetImpl, URI } from "./internal.js"

describe("EResourceSetImpl", () => {
    test("constructor", () => {
        const rs = new EResourceSetImpl()
        expect(rs.getURIResourceMap()).toBeNull()
    })

    test("resourcesWithMock", () => {
        const rs = new EResourceSetImpl()
        const mockEResource = mock<EResourceInternal>()
        const eResource = instance(mockEResource)
        when(mockEResource.basicSetResourceSet(rs, null)).thenReturn(null)
        expect(rs.getResources().add(eResource)).toBeTruthy()
    })

    test("resourcesNoMock", () => {
        const rs = new EResourceSetImpl()
        const r = new EResourceImpl()

        rs.getResources().add(r)
        expect(r.eResourceSet()).toBe(rs)
    })

    test("getResource", () => {})

    test("getRegisteredResource", () => {
        const uriResource = new URI("test://file.t")
        const rs = new EResourceSetImpl()

        // register resource
        const mockEResource = mock<EResourceInternal>()
        const eResource = instance(mockEResource)
        when(mockEResource.basicSetResourceSet(rs, null)).thenReturn(null)
        rs.getResources().add(eResource)

        // get registered resource - no loading
        when(mockEResource.getURI()).thenReturn(uriResource)
        expect(rs.getResource(uriResource, false)).toBe(eResource)

        // get registered resource - loading
        when(mockEResource.isLoaded()).thenReturn(false)
        expect(rs.getResource(uriResource, true)).toBe(eResource)
        verify(mockEResource.loadSync()).once()
    })

    test("getEObject", () => {})
})
