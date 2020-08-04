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
import { EClassExt } from "./EClassExt";


test("instance", (t) => {
    let eClass = new EClassExt();
    eClass.name = "eClass";
    t.is(eClass.name,"eClass",);
});