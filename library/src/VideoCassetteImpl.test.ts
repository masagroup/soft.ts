// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as deepEqual from "deep-equal";
import { anything, capture, instance, mock, reset, verify, when } from "ts-mockito";
import * as ecore from "@masagroup/ecore";
import {
    AudioVisualItem,
    LibraryConstants,
    Person,
    VideoCassetteImpl,
    getLibraryPackage,
} from "./internal";

interface PersonInternal extends Person, ecore.EObjectInternal {}

describe("VideoCassetteImpl", () => {
    test("eStaticClass", () => {
        let o = new VideoCassetteImpl();
        expect(o.eStaticClass()).toBe(getLibraryPackage().getVideoCassette());
    });

    test("getCast", () => {
        let o = new VideoCassetteImpl();
        expect(o.cast).not.toBeNull();
    });

    test("eGetFromID", () => {
        let o = new VideoCassetteImpl();
        expect(() => o.eGetFromID(-1, true)).toThrow(Error);
        expect(o.eGetFromID(LibraryConstants.VIDEO_CASSETTE__CAST, true)).toStrictEqual(o.cast);
        expect(
            deepEqual(
                o.eGetFromID(LibraryConstants.VIDEO_CASSETTE__CAST, false),
                (o.cast as ecore.EObjectList<Person>).getUnResolvedList()
            )
        ).toBeTruthy();
    });

    test("eSetFromID", () => {
        let o = new VideoCassetteImpl();
        expect(() => o.eSetFromID(-1, null)).toThrow(Error);
        {
            // list with a value
            let mockValue = mock<PersonInternal>();
            let value = instance(mockValue);
            let l = new ecore.ImmutableEList<Person>([value]);
            when(mockValue.eIsProxy()).thenReturn(false);

            // set list with new contents
            o.eSetFromID(LibraryConstants.VIDEO_CASSETTE__CAST, l);
            // checks
            expect(o.cast.size()).toBe(1);
            expect(o.cast.get(0)).toBe(value);
        }
    });

    test("eIsSetFromID", () => {
        let o = new VideoCassetteImpl();
        expect(() => o.eIsSetFromID(-1)).toThrow(Error);
        expect(o.eIsSetFromID(LibraryConstants.VIDEO_CASSETTE__CAST)).toBeFalsy();
    });

    test("eUnsetFromID", () => {
        let o = new VideoCassetteImpl();
        expect(() => o.eUnsetFromID(-1)).toThrow(Error);
        {
            o.eUnsetFromID(LibraryConstants.VIDEO_CASSETTE__CAST);
            let v = o.eGetFromID(LibraryConstants.VIDEO_CASSETTE__CAST, false);
            expect(v).not.toBeNull();
            let l = v as ecore.EList<Person>;
            expect(l.isEmpty()).toBeTruthy();
        }
    });
});
