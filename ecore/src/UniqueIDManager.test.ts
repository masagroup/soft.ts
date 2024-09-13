// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import id128 from "id128"
import { instance, mock } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { EObject, IncrementalIDManager, ULIDManager, UUIDManager } from "./internal.js"

describe("IDManager", () => {
    describe("IncrementalIDManager", () => {
        test("invalid", () => {
            const m = new IncrementalIDManager()
            expect(m.getEObject("invalid")).toBeUndefined()
        })

        test("register", () => {
            const m = new IncrementalIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            m.register(eObject)
            const id = m.getID(eObject)
            expect(id).not.toBeUndefined()
            expect(m.getEObject(id)).toBe(eObject)
        })

        test("unregister", () => {
            const m = new IncrementalIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            const id = m.getID(eObject)
            expect(id).not.toBeUndefined()

            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()
            expect(m.getDetachedID(eObject)).toBe(id)

            m.register(eObject)
            expect(m.getID(eObject)).toBe(id)
            expect(m.getDetachedID(eObject)).toBeUndefined()
        })

        test("setID-undefined", () => {
            const m = new IncrementalIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)

            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)

            m.setID(eObject, null)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)
        })

        test("setID-number", () => {
            const m = new IncrementalIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)
            expect(m.getEObject(2)).toBe(eObject)
        })

        test("setID-string", () => {
            const m = new IncrementalIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            m.setID(eObject, "2")
            expect(m.getID(eObject)).toBe(2)
            expect(m.getEObject(2)).toBe(eObject)
        })

        test("clear", () => {
            const m = new IncrementalIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)

            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)

            m.clear()
            expect(m.getID(eObject)).toBeUndefined()
        })

        test("detached", () => {
            const m = new IncrementalIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            m.register(eObject)
            const id = m.getID(eObject)
            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()
            expect(m.getDetachedID(eObject)).toBe(id)
        })
    })

    describe("UUIDManager", () => {
        test("undefined", () => {
            const m = new UUIDManager()
            expect(m.getEObject(undefined)).toBeUndefined()
        })

        test("null", () => {
            const m = new UUIDManager()
            expect(m.getEObject(null)).toBeUndefined()
        })

        test("invalid", () => {
            const m = new UUIDManager()
            try {
                m.getEObject("invalid")
            } catch (err) {
                expect(err instanceof id128.Exception.InvalidEncoding).toBeTruthy()
            }
        })

        test("register", () => {
            const m = new UUIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            m.register(eObject)
            const id = m.getID(eObject)
            expect(id).not.toBeUndefined()
            expect(m.getEObject(id)).toBe(eObject)
        })

        test("unregister", () => {
            const m = new UUIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            const id = m.getID(eObject)
            expect(id).not.toBeUndefined()

            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()
            expect(m.getDetachedID(eObject)).toBe(id)

            m.register(eObject)
            expect(m.getID(eObject)).toBe(id)
            expect(m.getDetachedID(eObject)).toBeUndefined()
        })

        test("setID-undefined", () => {
            const m = new UUIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            const uuid = id128.Uuid4.fromCanonical("d96dc8e1-a25c-4431-b58e-c39df80c64da")
            m.setID(eObject, uuid)
            expect(m.getID(eObject)).toBe(uuid)

            m.setID(eObject, null)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, uuid)
            expect(m.getID(eObject)).toBe(uuid)
        })

        test("setID-invalid", () => {
            const m = new UUIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBeUndefined()
        })

        test("clear", () => {
            const m = new UUIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            const uuid = id128.Uuid4.fromCanonical("d96dc8e1-a25c-4431-b58e-c39df80c64da")

            m.setID(eObject, uuid)
            expect(m.getID(eObject)).toBe(uuid)

            m.clear()
            expect(m.getID(eObject)).toBeUndefined()
        })
    })

    describe("ULIDManager", () => {
        test("invalid", () => {
            const m = new UUIDManager()
            try {
                m.getEObject("invalid")
            } catch (err) {
                expect(err instanceof id128.Exception.InvalidEncoding).toBeTruthy()
            }
        })

        test("register", () => {
            const m = new ULIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            m.register(eObject)
            const id = m.getID(eObject)
            expect(id).not.toBeUndefined()
            expect(m.getEObject(id)).toBe(eObject)
        })

        test("setID-undefined", () => {
            const m = new ULIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            const ulid = id128.Ulid.fromCanonical("01HNBCDR3FC57NH9V4VNQ3VPYD")
            m.setID(eObject, ulid)
            expect(m.getID(eObject)).toBe(ulid)

            m.setID(eObject, null)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, ulid)
            expect(m.getID(eObject)).toBe(ulid)
        })

        test("setID-invalid", () => {
            const m = new ULIDManager()
            const mockObject = mock<EObject>()
            const eObject = instance(mockObject)
            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBeUndefined()
        })
    })
})
