// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClass, ETypedElement } from "./internal"

export interface EStructuralFeature extends ETypedElement {
    // Attributes
    isChangeable: boolean
    isVolatile: boolean
    isTransient: boolean
    defaultValueLiteral: string
    defaultValue: any
    isUnsettable: boolean
    isDerived: boolean
    featureID: number

    // References
    readonly eContainingClass: EClass

    // Operations
    getContainerClass(): any
}
