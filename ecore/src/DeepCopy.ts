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
    isEObject,
} from "./internal";

export class DeepCopy {
    private _objects: Map<EObject, EObject> = new Map();
    private _resolve: boolean = false;
    private _originalReferences: boolean = false;

    constructor(resolve: boolean, originalReferences: boolean) {
        this._resolve = resolve;
        this._originalReferences = originalReferences;
    }

    copy(eObject: EObject): EObject {
        if (eObject) {
            let copyEObject = this.createCopy(eObject);
            if (copyEObject) {
                this._objects.set(eObject, copyEObject);
                let eClass = eObject.eClass();
                for (const eAttribute of eClass.eAttributes) {
                    if (eAttribute.isChangeable && !eAttribute.isDerived) {
                        this.copyAttribute(eAttribute, eObject, copyEObject);
                    }
                }
                for (const eReference of eClass.eReferences) {
                    if (
                        eReference.isChangeable &&
                        !eReference.isDerived &&
                        eReference.isContainment
                    ) {
                        this.copyContainment(eReference, eObject, copyEObject);
                    }
                }

                this.copyProxyURI(eObject, copyEObject);
            }
            return copyEObject;
        }
        return null;
    }

    copyAll(eObjects: EList<EObject>): EList<EObject> {
        let copies: EObject[] = [];
        for (const eObject of eObjects) {
            copies.push(this.copy(eObject));
        }
        return new ImmutableEList<EObject>(copies);
    }

    private createCopy(eObject: EObject): EObject {
        let eClass = eObject.eClass();
        let eFactory = eClass.ePackage.eFactoryInstance;
        return eFactory.create(eClass);
    }

    private copyProxyURI(eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsProxy()) {
            let eObjectInternal = eObject as EObjectInternal;
            let eCopyInternal = copyEObject as EObjectInternal;
            eCopyInternal.eSetProxyURI(eObjectInternal.eProxyURI());
        }
    }

    private copyAttribute(eAttribute: EAttribute, eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsSet(eAttribute)) {
            copyEObject.eSet(eAttribute, eObject.eGet(eAttribute));
        }
    }

    private copyContainment(eReference: EReference, eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsSet(eReference)) {
            let value = eObject.eGetResolve(eReference, this._resolve);
            if (eReference.isMany) {
                let list = value as EList<EObject>;
                copyEObject.eSet(eReference, this.copyAll(list));
            } else {
                let object = value as EObject;
                copyEObject.eSet(eReference, this.copy(object));
            }
        }
    }

    copyReferences() {
        for (let [eObject, copyEObject] of this._objects) {
            for (const eReference of eObject.eClass().eReferences) {
                if (
                    eReference.isChangeable &&
                    !eReference.isDerived &&
                    !eReference.isContainment &&
                    !eReference.isContainer
                ) {
                    this.copyReference(eReference, eObject, copyEObject);
                }
            }
        }
    }

    private copyReference(eReference: EReference, eObject: EObject, copyEObject: EObject) {
        if (eObject.eIsSet(eReference)) {
            let value = eObject.eGetResolve(eReference, this._resolve);
            if (eReference.isMany) {
                let listSource = value as EObjectList<EObject>;
                let listTarget = copyEObject.eGetResolve(eReference, false) as EObjectList<EObject>;
                let source: EList<EObject> = listSource;
                if (!this._resolve) {
                    source = listSource.getUnResolvedList();
                }
                let target = listTarget.getUnResolvedList();
                if (source.isEmpty()) {
                    target.clear();
                } else {
                    let isBidirectional = eReference.eOpposite != null;
                    let index = 0;
                    for (const referencedObject of source) {
                        let copyReferencedEObject = this._objects.get(referencedObject);
                        if (copyReferencedEObject) {
                            if (isBidirectional) {
                                let position = target.indexOf(copyReferencedEObject);
                                if (position == -1) {
                                    target.insert(index, copyReferencedEObject);
                                } else if (index != position) {
                                    target.move(index, copyReferencedEObject);
                                }
                            } else {
                                target.insert(index, copyReferencedEObject);
                            }
                            index++;
                        } else {
                            if (this._originalReferences && !isBidirectional) {
                                target.insert(index, referencedObject);
                                index++;
                            }
                        }
                    }
                }
            } else {
                if (isEObject(value)) {
                    let copyReferencedEObject = this._objects.get(value);
                    if (copyReferencedEObject) {
                        copyEObject.eSet(eReference, copyReferencedEObject);
                    } else {
                        if (this._originalReferences && eReference.eOpposite == null) {
                            copyEObject.eSet(eReference, value);
                        }
                    }
                } else {
                    copyEObject.eSet(eReference, value);
                }
            }
        }
    }
}
