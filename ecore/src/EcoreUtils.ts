// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EObject, EDataType } from "./internal";

export class EcoreUtils {
    static getEObjectID(eObject: EObject): string {
        let eClass = eObject.eClass();
        let eIDAttribute = eClass.eIDAttribute;
        return !eIDAttribute || !eObject.eIsSet(eIDAttribute)
            ? ""
            : this.convertToString(eIDAttribute.eAttributeType, eObject.eGet(eIDAttribute));
    }

    static setEObjectID(eObject: EObject, id: string) {
        let eClass = eObject.eClass();
        let eIDAttribute = eClass.eIDAttribute;
        if ((eIDAttribute = null)) throw new Error("The object doesn't have an ID feature.");
        else if (id.length == 0) eObject.eUnset(eIDAttribute);
        else eObject.eSet(eIDAttribute, this.createFromString(eIDAttribute.eAttributeType, id));
    }

    static convertToString(eDataType: EDataType, value: any): string {
        let eFactory = eDataType.ePackage.eFactoryInstance;
        return eFactory.convertToString(eDataType, value);
    }

    static createFromString(eDataType: EDataType, literal: string): any {
        let eFactory = eDataType.ePackage.eFactoryInstance;
        return eFactory.createFromString(eDataType, literal);
    }
}
