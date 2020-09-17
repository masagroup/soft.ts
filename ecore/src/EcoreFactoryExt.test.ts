// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************
import test from "ava";
import { mock, instance, when } from "ts-mockito";
import { EDataType } from "./EDataType";
import { EcoreConstants } from "./EcoreConstants";
import { EcoreFactoryExt } from "./EcoreFactoryExt";

test("convertDate", (t) => {
    let mockEDataType = mock<EDataType>();
    let eDataType = instance(mockEDataType);
    when(mockEDataType.classifierID).thenReturn(EcoreConstants.EDATE);

    {
        let date = EcoreFactoryExt.getInstance().createFromString(
            eDataType,
            "2020-05-12T17:33:10.770Z"
        );
        let expected = new Date(Date.UTC(2020, 4, 12, 17, 33, 10, 770));
        t.deepEqual(date, expected);
    }
    {
        let date = EcoreFactoryExt.getInstance().createFromString(
            eDataType,
            "2007-06-02T10:26:13.000Z"
        );
        let expected = new Date(Date.UTC(2007, 5, 2, 10, 26, 13));
        t.deepEqual(date, expected);
    }
    {
        let date = new Date(Date.UTC(2020, 4, 12, 17, 33, 10, 770));
        let dateStr = EcoreFactoryExt.getInstance().convertToString(eDataType, date);
        t.is(dateStr, "2020-05-12T17:33:10.770Z");
    }
});
