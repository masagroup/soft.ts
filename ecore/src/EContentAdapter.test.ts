// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { anything, instance, mock, verify, when } from "ts-mockito";
import { EAdapter, EContentAdapter, EList, ENotifier, EObject, ImmutableEList } from "./internal";

describe("EContentAdapter", () => {
    test("convert", () => {
        let o: EObject = null;
        let n: ENotifier = o as ENotifier;
        let o2: EObject = n as EObject;
        expect(o2).toBeNull();
    });

    test("setTarget", () => {
        let adapter = new EContentAdapter();
        let children: EObject[] = [];
        let nb = Math.floor(Math.random() * 10) + 1;
        for (let index = 0; index < nb; index++) {
            let mockObject = mock<EObject>();
            let mockAdapters = mock<EList<EAdapter>>();
            let object = instance(mockObject);
            let adapters = instance(mockAdapters);

            when(mockObject.eAdapters).thenReturn(adapters);
            when(mockAdapters.contains(adapter)).thenReturn(false);
            when(mockAdapters.add(adapter)).thenReturn(true);
            when(mockAdapters.remove(adapter)).thenReturn(true);
            children.push(object);
        }
        let mockChildren = new ImmutableEList<EObject>(children);
        let mockObject = mock<EObject>();
        when(mockObject.eContents()).thenReturn(mockChildren);

        let object = instance(mockObject);

        adapter.target = object;

        adapter.target = null;
    });
});
