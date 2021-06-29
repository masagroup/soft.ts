// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock } from "ts-mockito";
import { EObject, IncrementalIDManager } from "./internal";

describe("IncrementalIDManager", () => {
    test("register", () => {
        let m = new IncrementalIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);
        expect(m.getID(eObject)).toBeUndefined();

        m.register(eObject);
        m.register(eObject);
        expect(m.getID(eObject)).toBe(0);
        expect(m.getEObject("0")).toBe(eObject);
        expect(m.getEObject(0)).toBe(eObject);

        let mockObject2 = mock<EObject>();
        let eObject2 = instance(mockObject2);
        m.register(eObject2);
        expect(m.getID(eObject2)).toBe(1);
    });

    test("unregister", () => {
        let m = new IncrementalIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);
        m.register(eObject);
        expect(m.getID(eObject)).not.toBeUndefined();

        m.unRegister(eObject);
        expect(m.getID(eObject)).toBeUndefined();
        expect(m.getDetachedID(eObject)).toBe(0);

        m.unRegister(eObject);
        expect(m.getID(eObject)).toBeUndefined();

        m.register(eObject);
        expect(m.getID(eObject)).toBe(0);
        expect(m.getDetachedID(eObject)).toBeUndefined();
    });

    test("set", () => {
        let m = new IncrementalIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);

        m.setID(eObject, 2);
        expect(m.getID(eObject)).toBe(2);

        m.setID(eObject, null);
        expect(m.getID(eObject)).toBeUndefined();

        m.setID(eObject, "2");
        expect(m.getID(eObject)).toBe(2);
    });

    test("clear", () => {
        let m = new IncrementalIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);

        m.setID(eObject, 2);
        expect(m.getID(eObject)).toBe(2);

        m.clear();
        expect(m.getID(eObject)).toBeUndefined();
    });
});
