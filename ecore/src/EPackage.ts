// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClassifier, EFactory, EList, ENamedElement } from "./internal";

export interface EPackage extends ENamedElement {
    // Attributes
    nsURI: string;
    nsPrefix: string;

    // References
    eFactoryInstance: EFactory;
    readonly eClassifiers: EList<EClassifier>;
    readonly eSubPackages: EList<EPackage>;
    readonly eSuperPackage: EPackage;

    // Operations
    getEClassifier(name: string): EClassifier;
}