// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
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
