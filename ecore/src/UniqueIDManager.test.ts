// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock } from "ts-mockito";
import { EObject, UniqueIDManager } from "./internal";

describe('IncrementalIDManager', () => {

    test('register', () => {
        let m = new UniqueIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);
        expect(m.getID(eObject)).toBeUndefined();

        m.register(eObject);
        m.register(eObject);
        let id = m.getID(eObject);
        expect(id).not.toBeUndefined();
        expect(m.getEObject(id)).toBe(eObject);
    });

    test('unregister', () => {
        let m = new UniqueIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);
        m.unRegister(eObject);
        expect(m.getID(eObject)).toBeUndefined();

        m.register(eObject);
        let id = m.getID(eObject);
        expect(id).not.toBeUndefined();
        
        m.unRegister(eObject);
        expect(m.getID(eObject)).toBeUndefined();
        expect(m.getDetachedID(eObject)).toBe(id);

        m.register(eObject);
        expect(m.getID(eObject)).toBe(id);
        expect(m.getDetachedID(eObject)).toBeUndefined();
    });

    test('set', () => {
        let m = new UniqueIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);

        m.setID(eObject,2);
        expect(m.getID(eObject)).toBe("2");

        m.setID(eObject,null);
        expect(m.getID(eObject)).toBeUndefined();

        m.setID(eObject, "2");
        expect(m.getID(eObject)).toBe("2");
    });

    test('clear', () => {
        let m = new UniqueIDManager();
        let mockObject = mock<EObject>();
        let eObject = instance(mockObject);

        m.setID(eObject,2);
        expect(m.getID(eObject)).toBe("2");

        m.clear();
        expect(m.getID(eObject)).toBeUndefined();
    });

    
});
