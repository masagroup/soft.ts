// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { instance, mock, when } from "ts-mockito";
import { EcoreConstants, EcoreFactoryExt, EDataType } from "./internal";

describe("EcoreFactoryExt", () => {
    test("convertDate", () => {
        let mockEDataType = mock<EDataType>();
        let eDataType = instance(mockEDataType);
        when(mockEDataType.classifierID).thenReturn(EcoreConstants.EDATE);

        {
            let date = EcoreFactoryExt.getInstance().createFromString(
                eDataType,
                "2020-05-12T17:33:10.770Z"
            );
            let expected = new Date(Date.UTC(2020, 4, 12, 17, 33, 10, 770));
            expect(date).toEqual(expected);
        }
        {
            let date = EcoreFactoryExt.getInstance().createFromString(
                eDataType,
                "2007-06-02T10:26:13.000Z"
            );
            let expected = new Date(Date.UTC(2007, 5, 2, 10, 26, 13));
            expect(date).toEqual(expected);
        }
        {
            let date = new Date(Date.UTC(2020, 4, 12, 17, 33, 10, 770));
            let dateStr = EcoreFactoryExt.getInstance().convertToString(eDataType, date);
            expect(dateStr).toBe("2020-05-12T17:33:10.770Z");
        }
    });
});
