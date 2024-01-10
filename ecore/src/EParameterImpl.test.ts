// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito";
import {
    EAdapter,
    EList,
    ENotificationChain,
    ENotifyingList,
    EObject,
    EObjectInternal,
    EOperation,
    EParameterImpl,
    EResource,
    EResourceSet,
    ETypedElement,
    EcoreConstants,
    getEcorePackage,
    isEObjectList,
} from "./internal";

interface EOperationInternal extends EOperation, EObjectInternal {}

describe("EParameterImpl", () => {
    test("eStaticClass", () => {
        let o = new EParameterImpl();
        expect(o.eStaticClass()).toBe(getEcorePackage().getEParameter());
    });

    test("getEOperation", () => {
        // default
        let o = new EParameterImpl();
        expect(o.eOperation).toBeNull();

        // set a mock container
        let mockContainer = mock<EObject>();
        let container = instance(mockContainer);
        o.eSetInternalContainer(container, EcoreConstants.EPARAMETER__EOPERATION);

        // no proxy
        when(mockContainer.eIsProxy()).thenReturn(false);
        expect(o.eOperation).toBe(container);
        verify(mockContainer.eIsProxy()).once();
    });

    test("eGetFromID", () => {
        let o = new EParameterImpl();
        expect(() => o.eGetFromID(-1, true)).toThrow(Error);
        expect(o.eGetFromID(EcoreConstants.EPARAMETER__EOPERATION, true)).toStrictEqual(o.eOperation);
    });

    test("eIsSetFromID", () => {
        let o = new EParameterImpl();
        expect(() => o.eIsSetFromID(-1)).toThrow(Error);
        expect(o.eIsSetFromID(EcoreConstants.EPARAMETER__EOPERATION)).toBeFalsy();
    });

    test("eBasicInverseAdd", () => {
        let o = new EParameterImpl();
        {
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockNotifications = mock<ENotificationChain>();
            let notifications = instance(mockNotifications);
            expect(o.eBasicInverseAdd(object, -1, notifications)).toBe(notifications);
        }
        {
            let mockValue = mock<EOperationInternal>();
            let value = instance(mockValue);
            when(mockValue.eResource()).thenReturn(null);
            when(mockValue.eIsProxy()).thenReturn(false);
            o.eBasicInverseAdd(value, EcoreConstants.EPARAMETER__EOPERATION, null);
            expect(o.eOperation).toBe(value);

            reset(mockValue);
            let mockOther = mock<EOperationInternal>();
            let other = instance(mockOther);
            when(mockOther.eResource()).thenReturn(null);
            when(mockOther.eIsProxy()).thenReturn(false);
            when(mockValue.eResource()).thenReturn(null);
            when(mockValue.eInverseRemove(o, EcoreConstants.EOPERATION__EPARAMETERS, null)).thenReturn(null);
            o.eBasicInverseAdd(other, EcoreConstants.EPARAMETER__EOPERATION, null);
            expect(o.eOperation).toBe(other);
        }
    });

    test("eBasicInverseRemove", () => {
        let o = new EParameterImpl();
        {
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockNotifications = mock<ENotificationChain>();
            let notifications = instance(mockNotifications);
            expect(o.eBasicInverseRemove(object, -1, notifications)).toBe(notifications);
        }
        {
            let mockValue = mock<EOperationInternal>();
            let value = instance(mockValue);
            o.eBasicInverseRemove(value, EcoreConstants.EPARAMETER__EOPERATION, null);
        }
    });
});
