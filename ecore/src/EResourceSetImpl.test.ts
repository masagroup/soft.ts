// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { EResourceSetImpl } from "./EResourceSetImpl";

test("constructor", (t) => {
    let rs = new EResourceSetImpl();
    t.true( rs.getURIResourceMap() == null );
});
