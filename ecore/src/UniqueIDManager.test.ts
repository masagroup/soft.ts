// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock } from "ts-mockito"
import { EObject, IncrementalIDManager, ULIDManager, UUIDManager } from "./internal"
import { Uuid4 } from "id128";

describe("IDManager", () => {
    describe('UUIDmap', () => {
        test('should ', () => {
            let id1 = Uuid4.fromCanonical("b4c6c281-69b6-48e6-9847-850e52cafe2e")
            let id2 = Uuid4.fromCanonical("b4c6c281-69b6-48e6-9847-850e52cafe2e")
            expect(id1).toStrictEqual(id2)

            let m  = new Map<Uuid4, string>()
            m.set(id1,"toto")

            expect(m.get(id2)).toBe("toto")
        });

    });


    describe("IncrementalIDManager", () => {
        test("getEObject-invalid", () => {
            let m = new IncrementalIDManager()
            expect(m.getEObject("invalid")).toBeUndefined()
        })

        test("register", () => {
            let m = new IncrementalIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            m.register(eObject)
            let id = m.getID(eObject)
            expect(id).not.toBeUndefined()
            expect(m.getEObject(id)).toBe(eObject)
        })

        test("unregister", () => {
            let m = new IncrementalIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            let id = m.getID(eObject)
            expect(id).not.toBeUndefined()

            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()
            expect(m.getDetachedID(eObject)).toBe(id)

            m.register(eObject)
            expect(m.getID(eObject)).toBe(id)
            expect(m.getDetachedID(eObject)).toBeUndefined()
        })

        test("setID-undefined", () => {
            let m = new IncrementalIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)

            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)

            m.setID(eObject, null)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)
        })

        test("setID-number", () => {
            let m = new IncrementalIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)
            expect(m.getEObject(2)).toBe(eObject)
        })

        test("setID-string", () => {
            let m = new IncrementalIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            m.setID(eObject, "2")
            expect(m.getID(eObject)).toBe(2)
            expect(m.getEObject(2)).toBe(eObject)
        })

        test("clear", () => {
            let m = new IncrementalIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)

            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBe(2)

            m.clear()
            expect(m.getID(eObject)).toBeUndefined()
        })
    })

    describe("UUIDManager", () => {
        test("getEObject-invalid", () => {
            let m = new UUIDManager()
            expect(m.getEObject("invalid")).toBeUndefined()
        })

        test("register", () => {
            let m = new UUIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            m.register(eObject)
            let id = m.getID(eObject)
            expect(id).not.toBeUndefined()
            expect(m.getEObject(id)).toBe(eObject)
        })

        test("unregister", () => {
            let m = new UUIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            let id = m.getID(eObject)
            expect(id).not.toBeUndefined()

            m.unRegister(eObject)
            expect(m.getID(eObject)).toBeUndefined()
            expect(m.getDetachedID(eObject)).toBe(id)

            m.register(eObject)
            expect(m.getID(eObject)).toBe(id)
            expect(m.getDetachedID(eObject)).toBeUndefined()
        })

        test("setID-undefined", () => {
            let m = new UUIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            let uuid = "d96dc8e1-a25c-4431-b58e-c39df80c64da"
            m.setID(eObject, uuid)
            expect(m.getID(eObject)).toBe(uuid)

            m.setID(eObject, null)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, uuid)
            expect(m.getID(eObject)).toBe(uuid)
        })

        test("setID-invalid", () => {
            let m = new UUIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, "invalid")
            expect(m.getID(eObject)).toBeUndefined()
        })

        test("clear", () => {
            let m = new UUIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            let uuid = "d96dc8e1-a25c-4431-b58e-c39df80c64da"

            m.setID(eObject, uuid)
            expect(m.getID(eObject)).toBe(uuid)

            m.clear()
            expect(m.getID(eObject)).toBeUndefined()
        })
    })

    describe("ULIDManager", () => {
        test("getEObject-invalid", () => {
            let m = new ULIDManager()
            expect(m.getEObject("invalid")).toBeUndefined()
        })

        test("register", () => {
            let m = new ULIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            expect(m.getID(eObject)).toBeUndefined()

            m.register(eObject)
            m.register(eObject)
            let id = m.getID(eObject)
            expect(id).not.toBeUndefined()
            expect(m.getEObject(id)).toBe(eObject)
        })

        test("setID-undefined", () => {
            let m = new ULIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            let ulid = "01HNBCDR3FC57NH9V4VNQ3VPYD"
            m.setID(eObject, ulid)
            expect(m.getID(eObject)).toBe(ulid)

            m.setID(eObject, null)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, ulid)
            expect(m.getID(eObject)).toBe(ulid)
        })

        test("setID-invalid", () => {
            let m = new ULIDManager()
            let mockObject = mock<EObject>()
            let eObject = instance(mockObject)
            m.setID(eObject, 2)
            expect(m.getID(eObject)).toBeUndefined()

            m.setID(eObject, "invalid")
            expect(m.getID(eObject)).toBeUndefined()
        })
    })
})
