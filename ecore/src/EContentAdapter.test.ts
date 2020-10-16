// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifier, EObject } from "./internal";

describe("EContentAdapter", () => {

    test("convert" , () => {
        let o : EObject = null;
        let n : ENotifier = o as ENotifier;
        let o2 : EObject = n as EObject;
        expect(o2).toBeNull();
    });


})