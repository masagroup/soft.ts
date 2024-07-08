// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as ecore from "@masagroup/ecore"
import { Library } from "./internal.js"

export interface DocumentRoot extends ecore.EObject {
    // References
    readonly xMLNSPrefixMap: ecore.EMap<string, string>
    readonly xSISchemaLocation: ecore.EMap<string, string>
    library: Library
}
