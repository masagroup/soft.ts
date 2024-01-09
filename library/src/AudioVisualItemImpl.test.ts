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
import * as ecore from "@masagroup/ecore";
import {
    AudioVisualItemImpl,
    CirculatingItem,
    LibraryConstants,
    getLibraryPackage,
} from "./internal";

describe("AudioVisualItemImpl", () => {
    test("eStaticClass", () => {
        let o = new AudioVisualItemImpl();
        expect(o.eStaticClass()).toBe(getLibraryPackage().getAudioVisualItem());
    });

    test("getDamaged", () => {
        let o = new AudioVisualItemImpl();
        // get default value
        expect(o.isDamaged).toBe(false);
    });

    test("setDamaged", () => {
        let o = new AudioVisualItemImpl();
        let value = true;

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // set value
        o.isDamaged = value;

        // checks
        verify(mockAdapter.notifyChanged(anything())).once();
        const [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.oldValue).toBe(false);
        expect(notification.newValue).toBe(value);
        expect(notification.position).toBe(-1);
    });

    test("getMinutesLength", () => {
        let o = new AudioVisualItemImpl();
        // get default value
        expect(o.minutesLength).toBe(0);
    });

    test("setMinutesLength", () => {
        let o = new AudioVisualItemImpl();
        let value = 45;

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // set value
        o.minutesLength = value;

        // checks
        verify(mockAdapter.notifyChanged(anything())).once();
        const [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.oldValue).toBe(0);
        expect(notification.newValue).toBe(value);
        expect(notification.position).toBe(-1);
    });

    test("getTitle", () => {
        let o = new AudioVisualItemImpl();
        // get default value
        expect(o.title).toBe("");
    });

    test("setTitle", () => {
        let o = new AudioVisualItemImpl();
        let value = "Test String";

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // set value
        o.title = value;

        // checks
        verify(mockAdapter.notifyChanged(anything())).once();
        const [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.oldValue).toBe("");
        expect(notification.newValue).toBe(value);
        expect(notification.position).toBe(-1);
    });

    test("eGetFromID", () => {
        let o = new AudioVisualItemImpl();
        expect(() => o.eGetFromID(-1, true)).toThrow(Error);
        expect(o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__DAMAGED, true)).toStrictEqual(
            o.isDamaged
        );
        expect(
            o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__MINUTES_LENGTH, true)
        ).toStrictEqual(o.minutesLength);
        expect(o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__TITLE, true)).toStrictEqual(
            o.title
        );
    });

    test("eSetFromID", () => {
        let o = new AudioVisualItemImpl();
        expect(() => o.eSetFromID(-1, null)).toThrow(Error);
        {
            let value = true;
            o.eSetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__DAMAGED, value);
            expect(o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__DAMAGED, false)).toBe(value);
        }
        {
            let value = 45;
            o.eSetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__MINUTES_LENGTH, value);
            expect(o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__MINUTES_LENGTH, false)).toBe(
                value
            );
        }
        {
            let value = "Test String";
            o.eSetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__TITLE, value);
            expect(o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__TITLE, false)).toBe(value);
        }
    });

    test("eIsSetFromID", () => {
        let o = new AudioVisualItemImpl();
        expect(() => o.eIsSetFromID(-1)).toThrow(Error);
        expect(o.eIsSetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__DAMAGED)).toBeFalsy();
        expect(o.eIsSetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__MINUTES_LENGTH)).toBeFalsy();
        expect(o.eIsSetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__TITLE)).toBeFalsy();
    });

    test("eUnsetFromID", () => {
        let o = new AudioVisualItemImpl();
        expect(() => o.eUnsetFromID(-1)).toThrow(Error);
        {
            o.eUnsetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__DAMAGED);
            let v = o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__DAMAGED, false);
            expect(v).toBe(false);
        }
        {
            o.eUnsetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__MINUTES_LENGTH);
            let v = o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__MINUTES_LENGTH, false);
            expect(v).toBe(0);
        }
        {
            o.eUnsetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__TITLE);
            let v = o.eGetFromID(LibraryConstants.AUDIO_VISUAL_ITEM__TITLE, false);
            expect(v).toBe("");
        }
    });
});
