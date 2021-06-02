// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EClass,
    EClassifier,
    ENamedElement,
    EPackage,
    EReference,
    EStructuralFeature,
    isEStructuralFeature,
} from "./internal";

const annotationURI = "http:///org/eclipse/emf/ecore/util/ExtendedMetaData";

export class ExtendedMetaData {
    private _metaData: Map<any, any> = new Map<any, any>();

    private getENamedElementExtendedMetaData(
        eElement: ENamedElement
    ): ENamedElementExtendedMetaData {
        let result = this._metaData.get(eElement);
        if (!result) {
            if (isEStructuralFeature(eElement)) {
                result = new EStructuralFeatureExtentedMetaDataImpl(this, eElement);
            } else {
                result = new ENamedElementExtendedMetaDataImpl(this, eElement);
            }
            this._metaData.set(eElement, result);
        }
        return result;
    }

    private getEStructuralFeatureExtentedMetaData(
        eFeature: EStructuralFeature
    ): EStructuralFeatureExtentedMetaData {
        let result = this._metaData.get(eFeature);
        if (!result) {
            result = new EStructuralFeatureExtentedMetaDataImpl(this, eFeature);
            this._metaData.set(eFeature, result);
        }
        return result;
    }

    private getEPackageExtentedMetaData(ePackage: EPackage): EPackageExtentedMetaData {
        let result = this._metaData.get(ePackage);
        if (!result) {
            result = new EPackageExtentedMetaDataImpl(this, ePackage);
            this._metaData.set(ePackage, result);
        }
        return result;
    }

    getType(ePackage: EPackage, name: string): EClassifier {
        return this.getEPackageExtentedMetaData(ePackage).getType(name);
    }

    getName(eElement: ENamedElement): string {
        return this.getENamedElementExtendedMetaData(eElement).getName();
    }

    getNamespace(eFeature: EStructuralFeature): string {
        return this.getEStructuralFeatureExtentedMetaData(eFeature).getNamespace();
    }

    getDocumentRoot(ePackage: EPackage): EClass {
        let eClassifier = this.getType(ePackage, "");
        if (eClassifier) {
            return eClassifier as EClass;
        }
        return null;
    }

    getXMLNSPrefixMapFeature(eClass: EClass): EReference {
        for (const eReference of eClass.eAllReferences) {
            if (this.getName(eReference) == "xmlns:prefix") {
                return eReference;
            }
        }
        return null;
    }

    getXSISchemaLocationMapFeature(eClass: EClass): EReference {
        for (const eReference of eClass.eAllReferences) {
            if (this.getName(eReference) == "xsi:schemaLocation") {
                return eReference;
            }
        }
        return null;
    }

    basicGetName(eElement: ENamedElement): string {
        let annotation = eElement.getEAnnotation(annotationURI);
        if (annotation) {
            let name = annotation.details.getValue("name");
            if (name !== undefined) {
                return name;
            }
        }
        return eElement.name;
    }

    basicGetNamespace(eFeature: EStructuralFeature): string {
        let annotation = eFeature.getEAnnotation(annotationURI);
        if (annotation) {
            let namespace = annotation.details.getValue("namespace");
            if (namespace !== undefined) {
                if (namespace === "##targetNamespace") {
                    let nsURI = eFeature.eContainingClass?.ePackage?.nsURI;
                    if (nsURI !== undefined) {
                        return nsURI;
                    }
                } else {
                    return namespace;
                }
            }
        }
        return "";
    }
}

interface ENamedElementExtendedMetaData {
    getName(): string;
}

class ENamedElementExtendedMetaDataImpl implements ENamedElementExtendedMetaData {
    protected _emd: ExtendedMetaData;
    protected _eElement: ENamedElement;
    protected _name: string;

    constructor(emd: ExtendedMetaData, eElement: ENamedElement) {
        this._emd = emd;
        this._eElement = eElement;
    }

    getName(): string {
        if (!this._name) {
            this._name = this._emd.basicGetName(this._eElement);
        }
        return this._name;
    }
}

interface EPackageExtentedMetaData {
    getType(name: string): EClassifier;
}

class EPackageExtentedMetaDataImpl implements EPackageExtentedMetaData {
    protected _emd: ExtendedMetaData;
    protected _ePackage: EPackage;
    protected _nameToClassifierMap: Map<string, EClassifier>;

    constructor(emd: ExtendedMetaData, ePackage: EPackage) {
        this._emd = emd;
        this._ePackage = ePackage;
    }

    getType(name: string): EClassifier {
        let eResult = this._nameToClassifierMap?.get(name);
        if (!eResult) {
            let eClassifiers = this._ePackage.eClassifiers;
            if (
                !this._nameToClassifierMap ||
                this._nameToClassifierMap.size != eClassifiers.size()
            ) {
                this._nameToClassifierMap = new Map<string, EClassifier>();
                for (const eClassifier of eClassifiers) {
                    let eClassifierName = this._emd.getName(eClassifier);
                    this._nameToClassifierMap.set(eClassifierName, eClassifier);
                    if (eClassifierName == name) {
                        eResult = eClassifier;
                        break;
                    }
                }
            }
        }
        return eResult;
    }
}

interface EStructuralFeatureExtentedMetaData extends ENamedElementExtendedMetaData {
    getNamespace(): string;
}

class EStructuralFeatureExtentedMetaDataImpl extends ENamedElementExtendedMetaDataImpl {
    private _namespace: string;

    constructor(emd: ExtendedMetaData, eStructuralFeature: EStructuralFeature) {
        super(emd, eStructuralFeature);
    }

    getNamespace(): string {
        if (!this._namespace) {
            this._namespace = this._emd.basicGetNamespace(this._eElement as EStructuralFeature);
        }
        return this._namespace;
    }
}
