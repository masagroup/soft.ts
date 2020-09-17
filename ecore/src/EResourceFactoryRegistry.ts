// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EResourceFactory } from "./EResourceFactory";

export interface EResourceFactoryRegistry {
    getFactory(uri: URL): EResourceFactory;
    getProtocolToFactoryMap(): Map<string, EResourceFactory>;
    getExtensionToFactoryMap(): Map<string, EResourceFactory>;
}

export function getResourceFactoryRegistry(): EResourceFactoryRegistry {
    return require("./EResourceFactoryRegistryImpl").EResourceFactoryRegistryImpl.getInstance();
}
