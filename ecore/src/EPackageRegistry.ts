// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EPackage } from "./EPackage";
import { EFactory } from "./EFactory";

export interface EPackageRegistry {
    registerPackage(pack: EPackage): void;
    unregisterPackage(pack: EPackage): void;

    getPackage(nsURI: string): EPackage;
    getFactory(nsURI: string): EFactory;
}
