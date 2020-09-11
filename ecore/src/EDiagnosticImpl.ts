// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EDiagnostic } from "./EDiagnostic";

export class EDiagnosticImpl implements EDiagnostic {
    private _message: string;
    private _location: string;
    private _line: number;
    private _column: number;

    constructor(message: string, location: string, line: number, column: number) {}

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
