// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock } from "ts-mockito";
import { EDataType } from "./EDataType";
import { EAttributeExt, EClassifier } from "./internal";

describe('EAttributeExt', () => {
    test('basicGetEAttributeType', () => {
        let a = new EAttributeExt()
        expect(a.basicGetEAttributeType()).toBeNull();

        let mockDataType = mock<EDataType>();
        let dataType = instance(mockDataType);
        a.eType = dataType;
        expect(a.basicGetEAttributeType()).toBe(dataType);
    });
});