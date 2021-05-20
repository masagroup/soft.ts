// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EcoreFactoryImpl, EDataType } from "./internal";

export class EcoreFactoryExt extends EcoreFactoryImpl {
    private static _instanceExt: EcoreFactoryExt = null;

    public static getInstance(): EcoreFactoryExt {
        if (!this._instanceExt) {
            this._instanceExt = new EcoreFactoryExt();
        }
        return this._instanceExt;
    }

    protected constructor() {
        super();
    }

    createEDateFromString(eDataType: EDataType, literalValue: string): any {
        return new Date(literalValue);
    }

    convertEDateToString(eDataType: EDataType, instanceValue: any): string {
        return (instanceValue as Date).toISOString();
    }
}
