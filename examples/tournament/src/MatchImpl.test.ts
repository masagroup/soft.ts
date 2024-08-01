// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito"
import * as ecore from "@masagroup/ecore"
import { Group, MatchImpl, MatchKind, Team, TournamentConstants, getTournamentPackage } from "./internal.js"

interface GroupInternal extends Group, ecore.EObjectInternal {}
interface TeamInternal extends Team, ecore.EObjectInternal {}

describe("MatchImpl", () => {
    test("eStaticClass", () => {
        const o = new MatchImpl()
        expect(o.eStaticClass()).toBe(getTournamentPackage().getMatch())
    })

    test("getDate", () => {
        const o = new MatchImpl()
        // get default value
        expect(o.getDate()).toBe(null)
    })

    test("setDate", () => {
        const o = new MatchImpl()
        const value = new Date()

        // add listener
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setDate(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBeNull()
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getGroup", () => {
        const o = new MatchImpl()

        // get default value
        expect(o.getGroup()).toBeNull()

        // initialize object with a mock value
        const mockValue = mock<GroupInternal>()
        const value = instance(mockValue)
        o.setGroup(value)

        // events
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set object resource
        const mockResourceSet = mock<ecore.EResourceSet>()
        const resourceSet = instance(mockResourceSet)
        const mockResource = mock<ecore.EResource>()
        const resource = instance(mockResource)
        o.eSetInternalResource(resource)

        // get non resolved value
        when(mockValue.eIsProxy()).thenReturn(false)
        expect(o.getGroup()).toBe(value)
        verify(mockValue.eIsProxy()).once()

        // get a resolved value
        const mockURI = new ecore.URI("test:///uri")
        const mockResolved = mock<GroupInternal>()
        const resolved = instance(mockResolved)
        when(mockResolved.eProxyURI()).thenReturn(null)
        when(mockResource.eResourceSet()).thenReturn(resourceSet)
        when(mockResourceSet.getEObject(mockURI, true)).thenReturn(resolved)
        when(mockValue.eIsProxy()).thenReturn(true)
        when(mockValue.eProxyURI()).thenReturn(mockURI)
        expect(o.getGroup()).toBe(resolved)
    })

    test("setGroup", () => {
        const o = new MatchImpl()
        const mockValue = mock<GroupInternal>()
        const value = instance(mockValue)

        // add listener
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setGroup(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBeNull()
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getGuestTeam", () => {
        const o = new MatchImpl()

        // get default value
        expect(o.getGuestTeam()).toBeNull()

        // initialize object with a mock value
        const mockValue = mock<TeamInternal>()
        const value = instance(mockValue)
        o.setGuestTeam(value)

        // events
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set object resource
        const mockResourceSet = mock<ecore.EResourceSet>()
        const resourceSet = instance(mockResourceSet)
        const mockResource = mock<ecore.EResource>()
        const resource = instance(mockResource)
        o.eSetInternalResource(resource)

        // get non resolved value
        when(mockValue.eIsProxy()).thenReturn(false)
        expect(o.getGuestTeam()).toBe(value)
        verify(mockValue.eIsProxy()).once()

        // get a resolved value
        const mockURI = new ecore.URI("test:///uri")
        const mockResolved = mock<TeamInternal>()
        const resolved = instance(mockResolved)
        when(mockResolved.eProxyURI()).thenReturn(null)
        when(mockResource.eResourceSet()).thenReturn(resourceSet)
        when(mockResourceSet.getEObject(mockURI, true)).thenReturn(resolved)
        when(mockValue.eIsProxy()).thenReturn(true)
        when(mockValue.eProxyURI()).thenReturn(mockURI)
        expect(o.getGuestTeam()).toBe(resolved)
    })

    test("setGuestTeam", () => {
        const o = new MatchImpl()
        const mockValue = mock<TeamInternal>()
        const value = instance(mockValue)

        // add listener
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setGuestTeam(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBeNull()
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getHomeTeam", () => {
        const o = new MatchImpl()

        // get default value
        expect(o.getHomeTeam()).toBeNull()

        // initialize object with a mock value
        const mockValue = mock<TeamInternal>()
        const value = instance(mockValue)
        o.setHomeTeam(value)

        // events
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set object resource
        const mockResourceSet = mock<ecore.EResourceSet>()
        const resourceSet = instance(mockResourceSet)
        const mockResource = mock<ecore.EResource>()
        const resource = instance(mockResource)
        o.eSetInternalResource(resource)

        // get non resolved value
        when(mockValue.eIsProxy()).thenReturn(false)
        expect(o.getHomeTeam()).toBe(value)
        verify(mockValue.eIsProxy()).once()

        // get a resolved value
        const mockURI = new ecore.URI("test:///uri")
        const mockResolved = mock<TeamInternal>()
        const resolved = instance(mockResolved)
        when(mockResolved.eProxyURI()).thenReturn(null)
        when(mockResource.eResourceSet()).thenReturn(resourceSet)
        when(mockResourceSet.getEObject(mockURI, true)).thenReturn(resolved)
        when(mockValue.eIsProxy()).thenReturn(true)
        when(mockValue.eProxyURI()).thenReturn(mockURI)
        expect(o.getHomeTeam()).toBe(resolved)
    })

    test("setHomeTeam", () => {
        const o = new MatchImpl()
        const mockValue = mock<TeamInternal>()
        const value = instance(mockValue)

        // add listener
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setHomeTeam(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBeNull()
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getKind", () => {
        const o = new MatchImpl()
        // get default value
        expect(o.getKind()).toBe(MatchKind.ROUND_OF32)
    })

    test("setKind", () => {
        const o = new MatchImpl()
        const value = MatchKind.ROUND_OF16

        // add listener
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setKind(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBe(MatchKind.ROUND_OF32)
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getLocation", () => {
        const o = new MatchImpl()
        // get default value
        expect(o.getLocation()).toBe("")
    })

    test("setLocation", () => {
        const o = new MatchImpl()
        const value = "Test String"

        // add listener
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setLocation(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBe("")
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("getResult", () => {
        const o = new MatchImpl()
        // get default value
        expect(o.getResult()).toBe("")
    })

    test("setResult", () => {
        const o = new MatchImpl()
        const value = "Test String"

        // add listener
        const mockAdapter = mock<ecore.EAdapter>()
        const adapter = instance(mockAdapter)
        o.eAdapters().add(adapter)

        // set value
        o.setResult(value)

        // checks
        verify(mockAdapter.notifyChanged(anything())).once()
        const [notification] = capture(mockAdapter.notifyChanged).last()
        expect(notification.getNotifier()).toBe(o)
        expect(notification.getOldValue()).toBe("")
        expect(notification.getNewValue()).toBe(value)
        expect(notification.getPosition()).toBe(-1)
    })

    test("eGetFromID", () => {
        const o = new MatchImpl()
        expect(() => o.eGetFromID(-1, true)).toThrow(Error)
        expect(o.eGetFromID(TournamentConstants.MATCH__DATE, true)).toStrictEqual(o.getDate())
        expect(o.eGetFromID(TournamentConstants.MATCH__GROUP, true)).toStrictEqual(o.getGroup())
        expect(o.eGetFromID(TournamentConstants.MATCH__GUEST_TEAM, true)).toStrictEqual(o.getGuestTeam())
        expect(o.eGetFromID(TournamentConstants.MATCH__HOME_TEAM, true)).toStrictEqual(o.getHomeTeam())
        expect(o.eGetFromID(TournamentConstants.MATCH__KIND, true)).toStrictEqual(o.getKind())
        expect(o.eGetFromID(TournamentConstants.MATCH__LOCATION, true)).toStrictEqual(o.getLocation())
        expect(o.eGetFromID(TournamentConstants.MATCH__RESULT, true)).toStrictEqual(o.getResult())
    })

    test("eSetFromID", () => {
        const o = new MatchImpl()
        expect(() => o.eSetFromID(-1, null)).toThrow(Error)
        {
            const value = new Date()
            o.eSetFromID(TournamentConstants.MATCH__DATE, value)
            expect(o.eGetFromID(TournamentConstants.MATCH__DATE, false)).toBe(value)
        }
        {
            const mockValue = mock<GroupInternal>()
            const value = instance(mockValue)
            o.eSetFromID(TournamentConstants.MATCH__GROUP, value)
            expect(o.eGetFromID(TournamentConstants.MATCH__GROUP, false)).toBe(value)
        }
        {
            const mockValue = mock<TeamInternal>()
            const value = instance(mockValue)
            o.eSetFromID(TournamentConstants.MATCH__GUEST_TEAM, value)
            expect(o.eGetFromID(TournamentConstants.MATCH__GUEST_TEAM, false)).toBe(value)
        }
        {
            const mockValue = mock<TeamInternal>()
            const value = instance(mockValue)
            o.eSetFromID(TournamentConstants.MATCH__HOME_TEAM, value)
            expect(o.eGetFromID(TournamentConstants.MATCH__HOME_TEAM, false)).toBe(value)
        }
        {
            const value = MatchKind.ROUND_OF16
            o.eSetFromID(TournamentConstants.MATCH__KIND, value)
            expect(o.eGetFromID(TournamentConstants.MATCH__KIND, false)).toBe(value)
        }
        {
            const value = "Test String"
            o.eSetFromID(TournamentConstants.MATCH__LOCATION, value)
            expect(o.eGetFromID(TournamentConstants.MATCH__LOCATION, false)).toBe(value)
        }
        {
            const value = "Test String"
            o.eSetFromID(TournamentConstants.MATCH__RESULT, value)
            expect(o.eGetFromID(TournamentConstants.MATCH__RESULT, false)).toBe(value)
        }
    })

    test("eIsSetFromID", () => {
        const o = new MatchImpl()
        expect(() => o.eIsSetFromID(-1)).toThrow(Error)
        expect(o.eIsSetFromID(TournamentConstants.MATCH__DATE)).toBeFalsy()
        expect(o.eIsSetFromID(TournamentConstants.MATCH__GROUP)).toBeFalsy()
        expect(o.eIsSetFromID(TournamentConstants.MATCH__GUEST_TEAM)).toBeFalsy()
        expect(o.eIsSetFromID(TournamentConstants.MATCH__HOME_TEAM)).toBeFalsy()
        expect(o.eIsSetFromID(TournamentConstants.MATCH__KIND)).toBeFalsy()
        expect(o.eIsSetFromID(TournamentConstants.MATCH__LOCATION)).toBeFalsy()
        expect(o.eIsSetFromID(TournamentConstants.MATCH__RESULT)).toBeFalsy()
    })

    test("eUnsetFromID", () => {
        const o = new MatchImpl()
        expect(() => o.eUnsetFromID(-1)).toThrow(Error)
        {
            o.eUnsetFromID(TournamentConstants.MATCH__DATE)
            const v = o.eGetFromID(TournamentConstants.MATCH__DATE, false)
            expect(v).toBeNull()
        }
        {
            o.eUnsetFromID(TournamentConstants.MATCH__GROUP)
            expect(o.eGetFromID(TournamentConstants.MATCH__GROUP, false)).toBeNull()
        }
        {
            o.eUnsetFromID(TournamentConstants.MATCH__GUEST_TEAM)
            expect(o.eGetFromID(TournamentConstants.MATCH__GUEST_TEAM, false)).toBeNull()
        }
        {
            o.eUnsetFromID(TournamentConstants.MATCH__HOME_TEAM)
            expect(o.eGetFromID(TournamentConstants.MATCH__HOME_TEAM, false)).toBeNull()
        }
        {
            o.eUnsetFromID(TournamentConstants.MATCH__KIND)
            const v = o.eGetFromID(TournamentConstants.MATCH__KIND, false)
            expect(v).toBe(MatchKind.ROUND_OF32)
        }
        {
            o.eUnsetFromID(TournamentConstants.MATCH__LOCATION)
            const v = o.eGetFromID(TournamentConstants.MATCH__LOCATION, false)
            expect(v).toBe("")
        }
        {
            o.eUnsetFromID(TournamentConstants.MATCH__RESULT)
            const v = o.eGetFromID(TournamentConstants.MATCH__RESULT, false)
            expect(v).toBe("")
        }
    })
})