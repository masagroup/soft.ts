// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { getResourceFactoryRegistry } from "./index";

describe("EResourceFactoryRegistry", () => {
    test("singleton ", () => {
        let r = getResourceFactoryRegistry();
        expect(r).not.toBeNull();
        expect(r.getExtensionToFactoryMap().size).toBe(2);
    });
});
