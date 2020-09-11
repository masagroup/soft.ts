// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

export interface EDiagnostic {
    readonly message : string;
    readonly location : string;
    readonly line : number;
    readonly column : number;
}