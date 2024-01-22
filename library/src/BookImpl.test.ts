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
    BookCategory,
    BookImpl,
    BookIndex,
    CirculatingItem,
    LibraryConstants,
    Writer,
    getLibraryPackage,
} from "./internal";

interface BookIndexInternal extends BookIndex, ecore.EObjectInternal {}
interface WriterInternal extends Writer, ecore.EObjectInternal {}

describe("BookImpl", () => {
    test("eStaticClass", () => {
        let o = new BookImpl();
        expect(o.eStaticClass()).toBe(getLibraryPackage().getBook());
    });

    test("getAuthor", () => {
        let o = new BookImpl();

        // get default value
        expect(o.author).toBeNull();

        // initialize object with a mock value
        let mockValue = mock<WriterInternal>();
        let value = instance(mockValue);
        o.author = value;

        // events
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // set object resource
        let mockResourceSet = mock<ecore.EResourceSet>();
        let resourceSet = instance(mockResourceSet);
        let mockResource = mock<ecore.EResource>();
        let resource = instance(mockResource);
        o.eSetInternalResource(resource);

        // get non resolved value
        when(mockValue.eIsProxy()).thenReturn(false);
        expect(o.author).toBe(value);
        verify(mockValue.eIsProxy()).once();

        // get a resolved value
        let mockURI = new URI("test:///file.t");
        let mockResolved = mock<WriterInternal>();
        let resolved = instance(mockResolved);
        when(mockResolved.eProxyURI()).thenReturn(null);
        when(mockResource.eResourceSet()).thenReturn(resourceSet);
        when(mockResourceSet.getEObject(mockURI, true)).thenReturn(resolved);
        when(mockValue.eIsProxy()).thenReturn(true);
        when(mockValue.eProxyURI()).thenReturn(mockURI);
        expect(o.author).toBe(resolved);
    });

    test("setAuthor", () => {
        let o = new BookImpl();

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // first value
        let mockValue = mock<WriterInternal>();
        let value = instance(mockValue);
        when(mockValue.eInverseAdd(o, LibraryConstants.WRITER__BOOKS, null)).thenReturn(null);
        o.author = value;
        verify(mockAdapter.notifyChanged(anything())).once();
        let [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.oldValue).toBeNull();
        expect(notification.newValue).toBe(value);

        // set with other value
        let mockOther = mock<WriterInternal>();
        let other = instance(mockOther);
        reset(mockAdapter);
        reset(mockValue);
        when(mockValue.eInverseRemove(o, LibraryConstants.WRITER__BOOKS, null)).thenReturn(null);
        when(mockOther.eInverseAdd(o, LibraryConstants.WRITER__BOOKS, null)).thenReturn(null);
        o.author = other;
        verify(mockAdapter.notifyChanged(anything())).once();
        [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.oldValue).toBe(value);
        expect(notification.newValue).toBe(other);
        expect(notification.position).toBe(-1);
    });

    test("basicSetAuthor", () => {
        let o = new BookImpl();
        let mockValue = mock<WriterInternal>();
        let value = instance(mockValue);

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // notification chain
        let mockNotifications = mock<ecore.ENotificationChain>();
        let notifications = instance(mockNotifications);

        // set value
        when(mockNotifications.add(anything())).thenReturn(true);
        o.basicSetAuthor(value, notifications);

        // checks
        verify(mockNotifications.add(anything())).once();
        const [notification] = capture(mockNotifications.add).last();
        expect(notification.notifier).toBe(o);
        expect(notification.eventType).toBe(ecore.EventType.SET);
        expect(notification.featureID).toBe(LibraryConstants.BOOK__AUTHOR);
        expect(notification.oldValue).toBeNull();
        expect(notification.newValue).toBe(value);
        expect(notification.position).toBe(-1);
    });

    test("getCategory", () => {
        let o = new BookImpl();
        // get default value
        expect(o.category).toBe(BookCategory.MYSTERY);
    });

    test("setCategory", () => {
        let o = new BookImpl();
        let value = BookCategory.SCIENCEFICTION;

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // set value
        o.category = value;

        // checks
        verify(mockAdapter.notifyChanged(anything())).once();
        const [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.oldValue).toBe(BookCategory.MYSTERY);
        expect(notification.newValue).toBe(value);
        expect(notification.position).toBe(-1);
    });

    test("unsetCategory", () => {
        let o = new BookImpl();

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // unset
        o.unSetCategory();

        // checks
        verify(mockAdapter.notifyChanged(anything())).once();
        const [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.eventType).toBe(ecore.EventType.UNSET);
        expect(notification.featureID).toBe(LibraryConstants.BOOK__CATEGORY);
        expect(o.category).toBe(BookCategory.MYSTERY);
    });

    test("getIndexes", () => {
        let o = new BookImpl();
        expect(o.indexes).not.toBeNull();
    });

    test("getPages", () => {
        let o = new BookImpl();
        // get default value
        expect(o.pages).toBe(100);
    });

    test("setPages", () => {
        let o = new BookImpl();
        let value = 45;

        // add listener
        let mockAdapter = mock<ecore.EAdapter>();
        let adapter = instance(mockAdapter);
        o.eAdapters.add(adapter);

        // set value
        o.pages = value;

        // checks
        verify(mockAdapter.notifyChanged(anything())).once();
        const [notification] = capture(mockAdapter.notifyChanged).last();
        expect(notification.notifier).toBe(o);
        expect(notification.oldValue).toBe(100);
        expect(notification.newValue).toBe(value);
        expect(notification.position).toBe(-1);
    });

    test("getTableOfContents", () => {
        let o = new BookImpl();
        expect(o.tableOfContents).not.toBeNull();
    });

    test("getTitle", () => {
        let o = new BookImpl();
        // get default value
        expect(o.title).toBe("");
    });

    test("setTitle", () => {
        let o = new BookImpl();
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
        let o = new BookImpl();
        expect(() => o.eGetFromID(-1, true)).toThrow(Error);
        expect(o.eGetFromID(LibraryConstants.BOOK__AUTHOR, true)).toStrictEqual(o.author);
        expect(o.eGetFromID(LibraryConstants.BOOK__CATEGORY, true)).toStrictEqual(o.category);
        expect(o.eGetFromID(LibraryConstants.BOOK__INDEXES, true)).toStrictEqual(o.indexes);
        expect(o.eGetFromID(LibraryConstants.BOOK__PAGES, true)).toStrictEqual(o.pages);
        expect(o.eGetFromID(LibraryConstants.BOOK__TABLE_OF_CONTENTS, true)).toStrictEqual(
            o.tableOfContents
        );
        expect(o.eGetFromID(LibraryConstants.BOOK__TITLE, true)).toStrictEqual(o.title);
    });

    test("eSetFromID", () => {
        let o = new BookImpl();
        expect(() => o.eSetFromID(-1, null)).toThrow(Error);
        {
            let mockValue = mock<WriterInternal>();
            let value = instance(mockValue);
            when(mockValue.eInverseAdd(o, LibraryConstants.WRITER__BOOKS, null)).thenReturn(null);
            o.eSetFromID(LibraryConstants.BOOK__AUTHOR, value);
            expect(o.eGetFromID(LibraryConstants.BOOK__AUTHOR, false)).toBe(value);
            verify(mockValue.eInverseAdd(o, LibraryConstants.WRITER__BOOKS, null)).once();
        }
        {
            let value = BookCategory.SCIENCEFICTION;
            o.eSetFromID(LibraryConstants.BOOK__CATEGORY, value);
            expect(o.eGetFromID(LibraryConstants.BOOK__CATEGORY, false)).toBe(value);
        }
        {
            let mockMap = mock<ecore.EMap<string, number>>();
            let map = instance(mockMap);
            let mockIterator = mock<Iterator<ecore.EMapEntry<string, number>>>();
            let iterator = instance(mockIterator);
            let mockEntry = mock<ecore.EMapEntry<string, number>>();
            let entry = instance(mockEntry);
            let key = "Test String";
            let value = 45;
            when(mockMap[Symbol.iterator]()).thenReturn(iterator);
            when(mockIterator.next())
                .thenReturn({ value: entry, done: false })
                .thenReturn({ value: undefined, done: true });
            when(mockEntry.key).thenReturn(key);
            when(mockEntry.value).thenReturn(value);
            o.eSetFromID(LibraryConstants.BOOK__INDEXES, map);
            expect(o.indexes.toMap()).toEqual(new Map<string, number>([[key, value]]));
        }
        {
            let value = 45;
            o.eSetFromID(LibraryConstants.BOOK__PAGES, value);
            expect(o.eGetFromID(LibraryConstants.BOOK__PAGES, false)).toBe(value);
        }
        {
            let l = new ecore.ImmutableEList<string>();
            o.eSetFromID(LibraryConstants.BOOK__TABLE_OF_CONTENTS, l);
            expect(o.tableOfContents.isEmpty()).toBeTruthy();
        }

        {
            let value = "Test String";
            o.eSetFromID(LibraryConstants.BOOK__TITLE, value);
            expect(o.eGetFromID(LibraryConstants.BOOK__TITLE, false)).toBe(value);
        }
    });

    test("eIsSetFromID", () => {
        let o = new BookImpl();
        expect(() => o.eIsSetFromID(-1)).toThrow(Error);
        expect(o.eIsSetFromID(LibraryConstants.BOOK__AUTHOR)).toBeFalsy();
        expect(o.eIsSetFromID(LibraryConstants.BOOK__CATEGORY)).toBeFalsy();
        expect(o.eIsSetFromID(LibraryConstants.BOOK__INDEXES)).toBeFalsy();
        expect(o.eIsSetFromID(LibraryConstants.BOOK__PAGES)).toBeFalsy();
        expect(o.eIsSetFromID(LibraryConstants.BOOK__TABLE_OF_CONTENTS)).toBeFalsy();
        expect(o.eIsSetFromID(LibraryConstants.BOOK__TITLE)).toBeFalsy();
    });

    test("eUnsetFromID", () => {
        let o = new BookImpl();
        expect(() => o.eUnsetFromID(-1)).toThrow(Error);
        {
            o.eUnsetFromID(LibraryConstants.BOOK__AUTHOR);
            expect(o.eGetFromID(LibraryConstants.BOOK__AUTHOR, false)).toBeNull();
        }
        {
            o.eUnsetFromID(LibraryConstants.BOOK__CATEGORY);
            let v = o.eGetFromID(LibraryConstants.BOOK__CATEGORY, false);
            expect(v).toBe(BookCategory.MYSTERY);
        }
        {
            o.eUnsetFromID(LibraryConstants.BOOK__INDEXES);
            let v = o.eGetFromID(LibraryConstants.BOOK__INDEXES, false);
            expect(v).not.toBeNull();
            let l = v as ecore.EList<BookIndex>;
            expect(l.isEmpty()).toBeTruthy();
        }
        {
            o.eUnsetFromID(LibraryConstants.BOOK__PAGES);
            let v = o.eGetFromID(LibraryConstants.BOOK__PAGES, false);
            expect(v).toBe(100);
        }
        {
            o.eUnsetFromID(LibraryConstants.BOOK__TABLE_OF_CONTENTS);
            let v = o.eGetFromID(LibraryConstants.BOOK__TABLE_OF_CONTENTS, false);
            expect(v).not.toBeNull();
            let l = v as ecore.EList<string>;
            expect(l.isEmpty()).toBeTruthy();
        }
        {
            o.eUnsetFromID(LibraryConstants.BOOK__TITLE);
            let v = o.eGetFromID(LibraryConstants.BOOK__TITLE, false);
            expect(v).toBe("");
        }
    });

    test("eBasicInverseAdd", () => {
        let o = new BookImpl();
        {
            let mockObject = mock<ecore.EObject>();
            let object = instance(mockObject);
            let mockNotifications = mock<ecore.ENotificationChain>();
            let notifications = instance(mockNotifications);
            expect(o.eBasicInverseAdd(object, -1, notifications)).toBe(notifications);
        }
        {
            let mockValue = mock<WriterInternal>();
            let value = instance(mockValue);
            when(mockValue.eIsProxy()).thenReturn(false);
            o.eBasicInverseAdd(value, LibraryConstants.BOOK__AUTHOR, null);
            expect(o.author).toBe(value);

            reset(mockValue);
            let mockOther = mock<WriterInternal>();
            let other = instance(mockOther);
            when(mockOther.eIsProxy()).thenReturn(false);
            when(mockValue.eInverseRemove(o, LibraryConstants.WRITER__BOOKS, null)).thenReturn(
                null
            );
            o.eBasicInverseAdd(other, LibraryConstants.BOOK__AUTHOR, null);
            expect(o.author).toBe(other);
        }
    });

    test("eBasicInverseRemove", () => {
        let o = new BookImpl();
        {
            let mockObject = mock<ecore.EObject>();
            let object = instance(mockObject);
            let mockNotifications = mock<ecore.ENotificationChain>();
            let notifications = instance(mockNotifications);
            expect(o.eBasicInverseRemove(object, -1, notifications)).toBe(notifications);
        }
        {
            let mockValue = mock<WriterInternal>();
            let value = instance(mockValue);
            o.eBasicInverseRemove(value, LibraryConstants.BOOK__AUTHOR, null);
        }
    });
});
