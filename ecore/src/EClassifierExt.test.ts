// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClassifierExt, EPackageExt } from "./internal";

describe("EClassifierExt", () => {
    test("classifierID", () => {
        let c = new EClassifierExt();
        expect(c.classifierID).toEqual(-1);

        let p = new EPackageExt();
        p.eClassifiers.add(c);
        expect(c.classifierID).toEqual(0);
    });
});
