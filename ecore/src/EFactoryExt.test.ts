// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { EFactoryExt, getEcoreFactory } from "./internal.js"

describe("EFactoryExt", () => {
    test("createFromString and convertToString handles boolean, number, Date, Uint8Array", () => {
        const factory = new EFactoryExt()
        const pkg = getEcoreFactory().createEPackage()
        factory.setEPackage(pkg)

        const boolType = getEcoreFactory().createEDataType()
        boolType.setName("EBoolean")
        boolType.setInstanceTypeName("boolean")
        pkg.getEClassifiers().add(boolType)

        expect(factory.createFromString(boolType, "true")).toBe(true)
        expect(factory.createFromString(boolType, "false")).toBe(false)
        expect(factory.createFromString(boolType, "1")).toBe(true)
        expect(factory.convertToString(boolType, true)).toBe("true")
        expect(factory.convertToString(boolType, false)).toBe("false")

        const numType = getEcoreFactory().createEDataType()
        numType.setName("EDouble")
        numType.setInstanceTypeName("double")
        pkg.getEClassifiers().add(numType)

        expect(factory.createFromString(numType, "42.5")).toBe(42.5)
        expect(factory.convertToString(numType, 42.5)).toBe("42.5")

        const dateType = getEcoreFactory().createEDataType()
        dateType.setName("EDate")
        dateType.setInstanceTypeName("Date")
        pkg.getEClassifiers().add(dateType)

        const dateStr = "2026-09-12T00:00:00.000Z"
        const dateVal = factory.createFromString(dateType, dateStr)
        expect(dateVal instanceof Date).toBe(true)
        expect(factory.convertToString(dateType, dateVal)).toBe(dateStr)

        const bytesType = getEcoreFactory().createEDataType()
        bytesType.setName("EByteArray")
        bytesType.setInstanceTypeName("Uint8Array")
        pkg.getEClassifiers().add(bytesType)

        const bytes = factory.createFromString(bytesType, "hello")
        expect(bytes instanceof Uint8Array).toBe(true)
        expect(factory.convertToString(bytesType, bytes)).toBe("hello")
    })
})
