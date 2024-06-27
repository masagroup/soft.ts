// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, verify, when } from "ts-mockito"
import { BasicEObjectList, EClass, EObject, EObjectInternal, EObjectList, EStructuralFeature } from "./internal"

describe("BasicEObjectList", () => {
    test("constructor", () => {
        {
            let l = new BasicEObjectList(null, 1, 2, false, false, false, false, false)
            expect(l.notifier).toBe(null)
            expect(l.featureID).toBe(1)
            expect(l.feature).toBe(null)
        }
        {
            // mocks
            const mockOwner = mock<EObjectInternal>()
            const owner = instance(mockOwner)

            const mockFeature = mock<EStructuralFeature>()
            const feature = instance(mockFeature)

            const mockClass = mock<EClass>()
            const cls = instance(mockClass)

            let l = new BasicEObjectList(owner, 1, 2, false, false, false, false, false)
            expect(l.notifier).toBe(owner)
            expect(l.featureID).toBe(1)

            when(mockOwner.eClass()).thenReturn(cls)
            when(mockClass.getEStructuralFeature(1)).thenReturn(feature)
            expect(l.feature).toBe(feature)
        }
    })

    test("inverseNoOpposite", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)

        const mockObject = mock<EObjectInternal>()
        const object = instance(mockObject)

        let l = new BasicEObjectList(owner, 1, -1, false, true, false, false, false)

        when(mockOwner.eDeliver).thenReturn(false)
        when(mockOwner.eInverseAdd(owner, -2, null)).thenReturn(null)
        expect(l.add(object)).toBeTruthy()

        when(mockOwner.eInverseRemove(owner, -2, null)).thenReturn(null)
        expect(l.remove(object)).toBeTruthy()
    })

    test("inverseOpposite", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)

        const mockObject = mock<EObjectInternal>()
        const object = instance(mockObject)

        let l = new BasicEObjectList(owner, 1, 2, false, true, true, false, false)

        when(mockOwner.eDeliver).thenReturn(false)
        when(mockOwner.eInverseAdd(owner, 2, null)).thenReturn(null)
        expect(l.add(object)).toBeTruthy()

        when(mockOwner.eInverseRemove(owner, 2, null)).thenReturn(null)
        expect(l.remove(object)).toBeTruthy()
    })

    test("contains", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)
        when(mockOwner.eDeliver).thenReturn(false)

        {
            let l = new BasicEObjectList(owner, 1, 2, false, true, true, false, false)
            const mockObject = mock<EObjectInternal>()
            const object = instance(mockObject)
            l.add(object)
            expect(l.contains(object)).toBeTruthy()
            expect(l.contains(object)).toBeTruthy()
        }
        {
            let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false)
            const mockObject = mock<EObjectInternal>()
            const object = instance(mockObject)
            l.add(object)
            expect(l.contains(object)).toBeTruthy()

            const mockResolved = mock<EObjectInternal>()
            const resolved = instance(mockResolved)
            when(mockOwner.eResolveProxy(object)).thenReturn(resolved)
            when(mockObject.eIsProxy()).thenReturn(true)
            expect(l.contains(resolved)).toBeTruthy()

            verify(mockOwner.eResolveProxy(object)).once()
            verify(mockObject.eIsProxy()).once()
        }
    })

    test("get", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)
        when(mockOwner.eDeliver).thenReturn(false)

        // no proxy
        {
            let l = new BasicEObjectList(owner, 1, 2, false, false, false, false, false)
            const mockObject = mock<EObjectInternal>()
            const object = instance(mockObject)
            l.add(object)
            expect(l.get(0)).toBe(object)
        }
        // with proxy
        {
            let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false)
            const mockObject = mock<EObjectInternal>()
            const object = instance(mockObject)
            l.add(object)

            const mockResolved = mock<EObjectInternal>()
            const resolved = instance(mockResolved)
            when(mockOwner.eResolveProxy(object)).thenReturn(resolved)
            when(mockObject.eIsProxy()).thenReturn(true)
            expect(l.get(0)).toBe(resolved)

            verify(mockOwner.eResolveProxy(object)).once()
            verify(mockObject.eIsProxy()).once()
        }
        // with proxy and containment
        {
            let l = new BasicEObjectList(owner, 1, 2, true, false, false, true, false)
            const mockObject = mock<EObjectInternal>()
            const object = instance(mockObject)
            l.add(object)

            const mockResolved = mock<EObjectInternal>()
            const resolved = instance(mockResolved)
            when(mockOwner.eResolveProxy(object)).thenReturn(resolved)
            when(mockObject.eIsProxy()).thenReturn(true)
            expect(l.get(0)).toBe(resolved)

            verify(mockOwner.eResolveProxy(object)).once()
            verify(mockObject.eIsProxy()).once()
        }
    })

    test("unresolved", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)
        when(mockOwner.eDeliver).thenReturn(false)

        // no proxy
        {
            let l = new BasicEObjectList(owner, 1, 2, false, false, false, false, false)
            expect(l.getUnResolvedList()).toBe(l)
        }
        // with proxy
        {
            let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false)
            let u = l.getUnResolvedList()
            expect(u).not.toBe(l)
            let e = <EObjectList<EObject>>u
            expect(e).not.toBeNull()
        }
    })

    test("unresolvedGet", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)
        when(mockOwner.eDeliver).thenReturn(false)

        let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false)
        let u = l.getUnResolvedList()
        const mockObject = mock<EObjectInternal>()
        const object = instance(mockObject)
        u.add(object)

        // check that in unresolved it is the same
        expect(u.get(0)).toBe(object)

        // check that in original list , there is a resolution
        const mockResolved = mock<EObjectInternal>()
        const resolved = instance(mockResolved)
        when(mockOwner.eResolveProxy(object)).thenReturn(resolved)
        when(mockObject.eIsProxy()).thenReturn(true)
        expect(l.get(0)).toBe(resolved)

        // check that now it is the resolved one in the unresolved list
        expect(u.get(0)).toBe(resolved)

        verify(mockOwner.eResolveProxy(object)).once()
        verify(mockObject.eIsProxy()).once()
    })

    test("unresolvedContains", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)
        when(mockOwner.eDeliver).thenReturn(false)

        let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false)
        let u = l.getUnResolvedList()
        const mockObject = mock<EObjectInternal>()
        const object = instance(mockObject)
        u.add(object)

        expect(u.contains(object)).toBeTruthy()

        // check that in original list there is a resolution
        const mockResolved = mock<EObjectInternal>()
        const resolved = instance(mockResolved)
        when(mockOwner.eResolveProxy(object)).thenReturn(resolved)
        when(mockObject.eIsProxy()).thenReturn(true)
        expect(u.contains(resolved)).toBeFalsy()
        expect(l.contains(resolved)).toBeTruthy()
        expect(u.contains(resolved)).toBeTruthy()

        verify(mockOwner.eResolveProxy(object)).once()
        verify(mockObject.eIsProxy()).once()
    })

    test("unresolvedSet", () => {
        // mocks
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)
        when(mockOwner.eDeliver).thenReturn(false)

        // add an object to unresolved
        let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false)
        let u = l.getUnResolvedList()
        const mockObject = mock<EObjectInternal>()
        const object = instance(mockObject)
        u.add(object)

        // set first index as another object & check that it has been replaced
        const mockObject1 = mock<EObjectInternal>()
        const object1 = instance(mockObject1)
        u.set(0, object1)
        expect(u.get(0)).toBe(object1)

        // check that invalid range is supported
        expect(() => u.set(1, object)).toThrow(RangeError)
    })

    test("toJSON", () => {
        const mockOwner = mock<EObjectInternal>()
        const owner = instance(mockOwner)
        when(mockOwner.eDeliver).thenReturn(false)
        let l = new BasicEObjectList(owner, 1, 2, false, false, false, true, false)
        expect(l.toJSON()).toEqual({
            _featureID: 1,
            _inverseFeatureID: 2,
            _containment: false,
            _inverse: false,
            _opposite: false,
            _proxies: true,
            _unset: false
        })
    })
})
