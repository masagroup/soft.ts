// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************
import { createMock } from "ts-auto-mock";
import { On, method } from "ts-auto-mock/extension";
import { AbstractNotifier } from "./AbstractNotifier";
import { EAdapter } from "./EAdapter";


test('constructor', () => {
    var n = new AbstractNotifier();
    expect(n.eDeliver).toBeTruthy();
    expect(n.eAdapters.isEmpty()).toBeTruthy();
});

test('target', () => {
    const mockAdapter: EAdapter = createMock<EAdapter>();
    var n = new AbstractNotifier();
    n.eAdapters.add(mockAdapter);
    expect(mockAdapter.target).toBe(n);
    n.eAdapters.remove(mockAdapter);
    expect(mockAdapter.target).toBeNull()
})
