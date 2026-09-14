// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EAttribute, EList, EObject, EObjectInternal, EReference, EStructuralFeature, isEAttribute, isEReference } from "./internal.js"

export class DeepEqual {
    private _objects: Map<EObject, EObject> = new Map()

    equals(eObj1: EObject, eObj2: EObject): boolean {
        // If the first object is null, the second object must be null.
        if (eObj1 == null) {
            return eObj2 == null
        }

        // We know the first object isn't null, so if the second one is, it can't be equal.
        if (eObj2 == null) {
            return false
        }

        // Both eObject1 and eObject2 are not null.
        // If eObject1 has been compared already...
        const eObj1Mapped = this._objects.get(eObj1)
        if (eObj1Mapped) {
            // Then eObject2 must be that previous match.
            return eObj1Mapped == eObj2
        }

        // If eObject2 has been compared already...
        const eObj2Mapped = this._objects.get(eObj2)
        if (eObj2Mapped) {
            // Then eObject1 must be that match.
            return eObj2Mapped == eObj1
        }

        // Neither eObject1 nor eObject2 have been compared yet.

        // If eObject1 and eObject2 are the same instance...
        if (eObj1 == eObj2) {
            // Match them and return true.
            //
            this._objects.set(eObj1, eObj2)
            this._objects.set(eObj2, eObj1)
            return true
        }

        // If eObject1 is a proxy...
        if (eObj1.eIsProxy()) {
            const eURI1 = (eObj1 as EObjectInternal).eProxyURI()
            const eURI2 = (eObj2 as EObjectInternal).eProxyURI()
            if ((eURI1 == null && eURI2 == null) || (eURI1 && eURI2 && eURI1.toString() == eURI2.toString())) {
                this._objects.set(eObj1, eObj2)
                this._objects.set(eObj2, eObj1)
                return true
            } else {
                return false
            }
        } else if (eObj2.eIsProxy()) {
            // If eObject1 isn't a proxy but eObject2 is, they can't be equal.
            return false
        }

        // If they don't have the same class, they can't be equal.
        const eClass = eObj1.eClass()
        if (eClass != eObj2.eClass()) {
            return false
        }

        // Assume from now on that they match.
        this._objects.set(eObj1, eObj2)
        this._objects.set(eObj2, eObj1)

        for (const eFeature of eClass.getEAllStructuralFeatures()) {
            if (isEReference(eFeature) && (eFeature as EReference).isContainer()) {
                continue
            }
            if (!eFeature.isDerived() && !this.equalsFeature(eObj1, eObj2, eFeature)) {
                this._objects.delete(eObj1)
                this._objects.delete(eObj2)
                return false
            }
        }

        // There's no reason they aren't equal, so they are.
        return true
    }

    equalsAll(l1: EList<EObject>, l2: EList<EObject>): boolean {
        const size = l1.size()
        if (size != l2.size()) {
            return false
        }
        for (let i = 0; i < size; i++) {
            const eObj1 = l1.get(i)
            const eObj2 = l2.get(i)
            if (!this.equals(eObj1, eObj2)) {
                return false
            }
        }
        return true
    }

    private equalsPrimitive(p1: any, p2: any): boolean {
        if (p1 === p2) {
            return true
        }
        if (p1 == null || p2 == null) {
            return p1 === p2
        }
        if (p1 instanceof Date && p2 instanceof Date) {
            return p1.getTime() === p2.getTime()
        }
        if (ArrayBuffer.isView(p1) && ArrayBuffer.isView(p2)) {
            const u1 = new Uint8Array(p1.buffer, p1.byteOffset, p1.byteLength)
            const u2 = new Uint8Array(p2.buffer, p2.byteOffset, p2.byteLength)
            if (u1.length !== u2.length) return false
            for (let i = 0; i < u1.length; i++) {
                if (u1[i] !== u2[i]) return false
            }
            return true
        }
        return false
    }

    private equalsPrimitiveList(l1: EList<any>, l2: EList<any>): boolean {
        const size = l1.size()
        if (size != l2.size()) {
            return false
        }
        for (let i = 0; i < size; i++) {
            if (!this.equalsPrimitive(l1.get(i), l2.get(i))) {
                return false
            }
        }
        return true
    }

    private equalsFeature(eObj1: EObject, eObj2: EObject, eFeature: EStructuralFeature): boolean {
        const isSet1 = eObj1.eIsSet(eFeature)
        const isSet2 = eObj2.eIsSet(eFeature)
        if (isSet1 && isSet2) {
            if (isEAttribute(eFeature)) {
                return this.equalsAttribute(eObj1, eObj2, eFeature)
            } else if (isEReference(eFeature)) {
                return this.equalsReference(eObj1, eObj2, eFeature)
            }
        }
        return isSet1 == isSet2
    }

    private equalsAttribute(eObj1: EObject, eObj2: EObject, eAttribute: EAttribute): boolean {
        const value1 = eObj1.eGet(eAttribute)
        const value2 = eObj2.eGet(eAttribute)
        if (value1 == null) {
            return value2 == null
        }
        if (value2 == null) {
            return false
        }
        if (eAttribute.isMany()) {
            const l1 = value1 as EList<any>
            const l2 = value2 as EList<any>
            return this.equalsPrimitiveList(l1, l2)
        } else {
            return this.equalsPrimitive(value1, value2)
        }
    }

    private equalsReference(eObj1: EObject, eObj2: EObject, eReference: EReference): boolean {
        const value1 = eObj1.eGet(eReference)
        const value2 = eObj2.eGet(eReference)
        if (value1 == null) {
            return value2 == null
        }
        if (value2 == null) {
            return false
        }
        if (eReference.isMany()) {
            return this.equalsAll(value1 as EList<EObject>, value2 as EList<EObject>)
        } else {
            return this.equals(value1 as EObject, value2 as EObject)
        }
    }
}
