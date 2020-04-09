// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { mock, verify, instance } from "ts-mockito";
import { AbstractNotifier } from "./AbstractNotifier";
import { EAdapter } from "./EAdapter";
import { ENotification } from "./ENotification";

test("constructor", (t) => {
    let n = new AbstractNotifier();
    t.true(n.eDeliver);
    t.true(n.eAdapters.isEmpty());
});

test("target", (t) => {
    // mocks
    const mockAdapter = mock<EAdapter>();
    const adapter = instance(mockAdapter);

    let n = new AbstractNotifier();
    n.eAdapters.add(adapter);
    t.is(adapter.target, n);
    n.eAdapters.remove(adapter);
    t.is(adapter.target, null);
});

test("eNotify", (t) => {
    // mocks
    const mockAdapter = mock<EAdapter>();
    const mockNotification = mock<ENotification>();
    const adapter = instance(mockAdapter);
    const notification = instance(mockNotification);

    // call
    let n = new AbstractNotifier();
    n.eAdapters.add(adapter);
    n.eNotify(notification);

    // checks
    t.notThrows(() => verify(mockAdapter.notifyChanged(notification)).called());
});
