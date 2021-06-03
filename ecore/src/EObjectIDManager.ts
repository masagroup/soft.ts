// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EObject } from "./internal";

export interface EObjectIDManager {
    clear(): void;

    register(object: EObject): void;
    unRegister(object: EObject): void;

    setID(object: EObject, newID: any): void;

    getID(object: EObject): any;
    getEObject(id: any): EObject;

    getDetachedID(object: EObject): any;
}
