// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EcoreConstants, EEnumExt, EEnumLiteralExt } from "./internal.js"

describe("EEnumLiteralExt", () => {
    test("literal", () => {
        const l = new EEnumLiteralExt()
        l.setName("name")

        // unset : the name
        expect(l.getLiteral()).toBe("name")
        expect(l.eIsSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)).toBe(false)

        // set to "" : stays ""
        l.setLiteral("")
        expect(l.getLiteral()).toBe("")
        expect(l.eIsSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)).toBe(true)
        expect(l.eGetFromID(EcoreConstants.EENUM_LITERAL__LITERAL, false)).toBe("")

        l.setLiteral("literal")
        expect(l.getLiteral()).toBe("literal")
        expect(l.eIsSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)).toBe(true)

        // unset again
        l.eUnsetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)
        expect(l.getLiteral()).toBe("name")
        expect(l.eIsSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)).toBe(false)

        // reflective set
        l.eSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL, "")
        expect(l.getLiteral()).toBe("")
        expect(l.eIsSetFromID(EcoreConstants.EENUM_LITERAL__LITERAL)).toBe(true)

        // the other features
        expect(l.eIsSetFromID(EcoreConstants.EENUM_LITERAL__VALUE)).toBe(false)
        l.setValue(1)
        expect(l.eIsSetFromID(EcoreConstants.EENUM_LITERAL__VALUE)).toBe(true)
    })

    test("getEEnumLiteralByLiteral empty", () => {
        const e = new EEnumExt()
        const empty = new EEnumLiteralExt()
        empty.setName("_")
        empty.setLiteral("")
        const unset = new EEnumLiteralExt()
        unset.setName("Unset")
        e.getELiterals().addAll([empty, unset])

        expect(e.getEEnumLiteralByLiteral("")).toBe(empty)
        expect(e.getEEnumLiteralByLiteral("_")).toBeNull()
        expect(e.getEEnumLiteralByLiteral("Unset")).toBe(unset)
    })
})
