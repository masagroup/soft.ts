// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClass, EObject, DynamicEObjectImpl, EFactoryImpl } from "./internal";

export class EFactoryExt extends EFactoryImpl {
    constructor() {
        super();
    }

    create(eClass: EClass): EObject {
        if (this.ePackage != eClass.ePackage || eClass.isAbstract)
            throw new Error("The class '" + eClass.name + "' is not a valid classifier");
        let eObject = new DynamicEObjectImpl();
        eObject.setEClass(eClass);
        return eObject;
    }
}
