// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************
import { AbstractNotifier } from "./AbstractNotifier";
import { EAdapter } from "./EAdapter";
import { ENotification } from "./ENotification";


test('constructor', () => {
    var n = new AbstractNotifier();
    expect(n.eDeliver).toBeTruthy();
    expect(n.eAdapters.isEmpty()).toBeTruthy();
});

test('target', () => {
    // const mockAdapter: EAdapter = createMock<EAdapter>();
    // var n = new AbstractNotifier();
    // n.eAdapters.add(mockAdapter);
    // expect(mockAdapter.target).toBe(n);
    // n.eAdapters.remove(mockAdapter);
    // expect(mockAdapter.target).toBeNull()
});

test('eNotify', () => {
    // const mockAdapter: EAdapter = createMock<EAdapter>();
    // const mockNotifyChanged: jest.Mock = On(mockAdapter).get(method('notifyChanged'));
    // const mockNotification : ENotification = createMock<ENotification>();
    // var n = new AbstractNotifier();
    // n.eAdapters.add(mockAdapter);
    // n.eNotify(mockNotification);
    // expect(mockNotifyChanged).toHaveBeenCalledWith(mockNotification);
});