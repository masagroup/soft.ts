// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EAttribute, EList, EObject, EObjectInternal, EReference } from "./internal";

export class DeepEqual {
    private _objects: Map<EObject, EObject> = new Map();

    equals(eObj1: EObject, eObj2: EObject): boolean {
        // If the first object is null, the second object must be null.
        if (eObj1 == null) {
            return eObj2 == null;
        }

        // We know the first object isn't null, so if the second one is, it can't be equal.
        if (eObj2 == null) {
            return false;
        }

        // Both eObject1 and eObject2 are not null.
        // If eObject1 has been compared already...
        let eObj1Mapped = this._objects.get(eObj1);
        if (eObj1Mapped) {
            // Then eObject2 must be that previous match.
            return eObj1Mapped == eObj2;
        }

        // If eObject2 has been compared already...
        let eObj2Mapped = this._objects.get(eObj2);
        if (eObj2Mapped) {
            // Then eObject1 must be that match.
            return eObj2Mapped == eObj1;
        }

        // Neither eObject1 nor eObject2 have been compared yet.

        // If eObject1 and eObject2 are the same instance...
        if (eObj1 == eObj2) {
            // Match them and return true.
            //
            this._objects.set(eObj1, eObj2);
            this._objects.set(eObj2, eObj1);
            return true;
        }

        // If eObject1 is a proxy...
        if (eObj1.eIsProxy()) {
            let eURI1 = (eObj1 as EObjectInternal).eProxyURI();
            let eURI2 = (eObj2 as EObjectInternal).eProxyURI();
            if ((eURI1 == null && eURI2 == null) || (eURI1 && eURI2 && eURI1.toString() == eURI2.toString())) {
                this._objects.set(eObj1, eObj2);
                this._objects.set(eObj2, eObj1);
                return true;
            } else {
                return false;
            }
        } else if (eObj2.eIsProxy()) {
            // If eObject1 isn't a proxy but eObject2 is, they can't be equal.
            return false;
        }

        // If they don't have the same class, they can't be equal.
        let eClass = eObj1.eClass();
        if (eClass != eObj2.eClass()) {
            return false;
        }

        // Assume from now on that they match.
        this._objects.set(eObj1, eObj2);
        this._objects.set(eObj2, eObj1);

        for (const eAttribute of eClass.eAttributes) {
            if (!eAttribute.isDerived && !this.equalsAttribute(eObj1, eObj2, eAttribute)) {
                this._objects.delete(eObj1);
                this._objects.delete(eObj2);
                return false;
            }
        }
        for (const eReference of eClass.eReferences) {
            if (!eReference.isDerived && !this.equalsReference(eObj1, eObj2, eReference)) {
                this._objects.delete(eObj1);
                this._objects.delete(eObj2);
                return false;
            }
        }

        // There's no reason they aren't equal, so they are.
        return true;
    }

    equalsAll(l1: EList<EObject>, l2: EList<EObject>): boolean {
        let size = l1.size();
        if (size != l2.size()) {
            return false;
        }
        for (let i = 0; i < size; i++) {
            let eObj1 = l1.get(i);
            let eObj2 = l2.get(i);
            if (!this.equals(eObj1, eObj2)) {
                return false;
            }
        }
        return true;
    }

    private equalsAttribute(eObj1: EObject, eObj2: EObject, eAttribute: EAttribute): boolean {
        let isSet1 = eObj1.eIsSet(eAttribute);
        let isSet2 = eObj2.eIsSet(eAttribute);
        if (isSet1 && isSet2) {
            let value1 = eObj1.eGet(eAttribute);
            let value2 = eObj2.eGet(eAttribute);
            return value1 == value2;
        }
        return isSet1 == isSet2;
    }

    private equalsReference(eObj1: EObject, eObj2: EObject, eReference: EReference): boolean {
        let isSet1 = eObj1.eIsSet(eReference);
        let isSet2 = eObj2.eIsSet(eReference);
        if (isSet1 && isSet2) {
            let value1 = eObj1.eGet(eReference);
            let value2 = eObj2.eGet(eReference);
            if (eReference.isMany) {
                return this.equalsAll(value1 as EList<EObject>, value2 as EList<EObject>);
            } else {
                return this.equals(value1 as EObject, value2 as EObject);
            }
        }
        return isSet1 == isSet2;
    }
}
