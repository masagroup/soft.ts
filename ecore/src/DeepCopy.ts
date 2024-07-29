// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EAttribute,
    EList,
    EObject,
    EObjectInternal,
    EObjectList,
    EReference,
    ImmutableEList,
    isEObject
} from "./internal.js"

export class DeepCopy {
    private _objects: Map<EObject, EObject> = new Map()
    private _resolve: boolean = false
    private _originalReferences: boolean = false

    constructor(resolve: boolean, originalReferences: boolean) {
        this._resolve = resolve
        this._originalReferences = originalReferences
    }

    copy(eObject: EObject): EObject {
        if (eObject) {
            const copyEObject = this.createCopy(eObject)
            if (copyEObject) {
                this._objects.set(eObject, copyEObject)
                const eClass = eObject.eClass()
                for (const eAttribute of eClass.getEAttributes()) {
                    if (eAttribute.isChangeable() && !eAttribute.isDerived()) {
                        this.copyAttribute(eAttribute, eObject, copyEObject)
                    }
                }
                for (const eReference of eClass.getEReferences()) {
                    if (eReference.isChangeable() && !eReference.isDerived() && eReference.isContainment()) {
                        this.copyContainment(eReference, eObject, copyEObject)
                    }
                }

                this.copyProxyURI(eObject, copyEObject)
            }
            return copyEObject
        }
        return null
    }

    copyAll(eObjects: EList<EObject>): EList<EObject> {
        const copies: EObject[] = []
        for (const eObject of eObjects) {
            copies.push(this.copy(eObject))
        }
        return new ImmutableEList<EObject>(copies)
    }

    private createCopy(eObject: EObject): EObject {
        const eClass = eObject.eClass()
        const eFactory = eClass.getEPackage().getEFactoryInstance()
        return eFactory.create(eClass)
    }

    private copyProxyURI(eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsProxy()) {
            const eObjectInternal = eObject as EObjectInternal
            const eCopyInternal = copyEObject as EObjectInternal
            eCopyInternal.eSetProxyURI(eObjectInternal.eProxyURI())
        }
    }

    private copyAttribute(eAttribute: EAttribute, eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsSet(eAttribute)) {
            copyEObject.eSet(eAttribute, eObject.eGet(eAttribute))
        }
    }

    private copyContainment(eReference: EReference, eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsSet(eReference)) {
            const value = eObject.eGetResolve(eReference, this._resolve)
            if (eReference.isMany()) {
                const list = value as EList<EObject>
                copyEObject.eSet(eReference, this.copyAll(list))
            } else {
                const object = value as EObject
                copyEObject.eSet(eReference, this.copy(object))
            }
        }
    }

    copyReferences() {
        for (const [eObject, copyEObject] of this._objects) {
            for (const eReference of eObject.eClass().getEReferences()) {
                if (
                    eReference.isChangeable() &&
                    !eReference.isDerived() &&
                    !eReference.isContainment() &&
                    !eReference.isContainer()
                ) {
                    this.copyReference(eReference, eObject, copyEObject)
                }
            }
        }
    }

    private copyReference(eReference: EReference, eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsSet(eReference)) {
            const value = eObject.eGetResolve(eReference, this._resolve)
            if (eReference.isMany()) {
                const listSource = value as EObjectList<EObject>
                const listTarget = copyEObject.eGetResolve(eReference, false) as EObjectList<EObject>
                let source: EList<EObject> = listSource
                if (!this._resolve) {
                    source = listSource.getUnResolvedList()
                }
                const target = listTarget.getUnResolvedList()
                if (source.isEmpty()) {
                    target.clear()
                } else {
                    const isBidirectional = eReference.getEOpposite() != null
                    let index = 0
                    for (const referencedObject of source) {
                        const copyReferencedEObject = this._objects.get(referencedObject)
                        if (copyReferencedEObject) {
                            if (isBidirectional) {
                                const position = target.indexOf(copyReferencedEObject)
                                if (position == -1) {
                                    target.insert(index, copyReferencedEObject)
                                } else if (index != position) {
                                    target.move(index, copyReferencedEObject)
                                }
                            } else {
                                target.insert(index, copyReferencedEObject)
                            }
                            index++
                        } else {
                            if (this._originalReferences && !isBidirectional) {
                                target.insert(index, referencedObject)
                                index++
                            }
                        }
                    }
                }
            } else {
                if (isEObject(value)) {
                    const copyReferencedEObject = this._objects.get(value)
                    if (copyReferencedEObject) {
                        copyEObject.eSet(eReference, copyReferencedEObject)
                    } else {
                        if (this._originalReferences && eReference.getEOpposite() == null) {
                            copyEObject.eSet(eReference, value)
                        }
                    }
                } else {
                    copyEObject.eSet(eReference, value)
                }
            }
        }
    }
}
