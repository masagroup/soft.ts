// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EDiagnostic } from "./internal";

export class EDiagnosticImpl implements EDiagnostic {
    private _message: string;
    private _location: string;
    private _line: number;
    private _column: number;

    constructor(message: string, location: string, line: number, column: number) {
        this._message = message;
        this._location = location;
        this._line = line;
        this._column = column;
    }

    get message(): string {
        return this._message;
    }

    get location(): string {
        return this._location;
    }

    get line(): number {
        return this._line;
    }

    get column(): number {
        return this._column;
    }
}
