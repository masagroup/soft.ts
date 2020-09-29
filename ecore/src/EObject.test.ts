// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { getEcoreFactory } from "./index";

describe("EObject", () => {
    test("eContents", () => {
        let c = getEcoreFactory().createEClass();
        let a1 = getEcoreFactory().createEAttribute();
        let a2 = getEcoreFactory().createEAttribute();
        let o1 = getEcoreFactory().createEOperation();
        c.eStructuralFeatures.add(a1);
        c.eStructuralFeatures.add(a2);
        c.eOperations.add(o1);
        expect(c.eContents().toArray()).toEqual([a1, a2, o1]);
    });
});
