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
import { EcoreConstants, EcoreFactoryExt, EDataType } from "./internal.js"

describe("EcoreFactoryExt", () => {
    test("convertDate", () => {
        const mockEDataType = mock<EDataType>()
        const eDataType = instance(mockEDataType)
        when(mockEDataType.getClassifierID()).thenReturn(EcoreConstants.EDATE)

        {
            const date = EcoreFactoryExt.getInstance().createFromString(eDataType, "2020-05-12T17:33:10.770Z")
            const expected = new Date(Date.UTC(2020, 4, 12, 17, 33, 10, 770))
            expect(date).toEqual(expected)
        }
        {
            const date = EcoreFactoryExt.getInstance().createFromString(eDataType, "2007-06-02T10:26:13.000Z")
            const expected = new Date(Date.UTC(2007, 5, 2, 10, 26, 13))
            expect(date).toEqual(expected)
        }
        {
            const date = new Date(Date.UTC(2020, 4, 12, 17, 33, 10, 770))
            const dateStr = EcoreFactoryExt.getInstance().convertToString(eDataType, date)
            expect(dateStr).toBe("2020-05-12T17:33:10.770Z")
        }
    })
})
