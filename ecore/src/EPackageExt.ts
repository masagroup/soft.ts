// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractEAdapter,
    EAdapter,
    EAttribute,
    EClass,
    EClassifier,
    EcoreConstants,
    EDataType,
    EDataTypeInternal,
    EEnum,
    EFactoryExt,
    ENotification,
    EOperation,
    EPackage,
    EPackageImpl,
    EReference,
    EResource,
    EResourceImpl,
    EStructuralFeature,
    EventType,
    getEcoreFactory,
    URI,
} from "./internal";

export function isEPackage(o: any): o is EPackage {
    return o == undefined ? undefined : "nsURI" in o;
}

class EPackageExtAdapter extends AbstractEAdapter {
    constructor(private _pack: EPackageExt) {
        super();
    }

    notifyChanged(notification: ENotification): void {
        if (
            notification.eventType != EventType.REMOVING_ADAPTER &&
            notification.featureID == EcoreConstants.EPACKAGE__ECLASSIFIERS
        ) {
            this._pack._nameToClassifier = null;
        }
    }
}

export class EPackageExt extends EPackageImpl {
    _nameToClassifier: Map<string, EClassifier> = null;
    _adapter: EAdapter = null;

    constructor() {
        super();
        this.eFactoryInstance = new EFactoryExt();
        this._adapter = new EPackageExtAdapter(this);
        this.eAdapters.add(this._adapter);
    }

    getEClassifier(name: string): EClassifier {
        if (!this._nameToClassifier) {
            this._nameToClassifier = new Map<string, EClassifier>();
            for (const classifier of this.eClassifiers) {
                this._nameToClassifier.set(classifier.name, classifier);
            }
        }
        return this._nameToClassifier.get(name);
    }

    protected createResource(): EResource {
        let resource = this.eResource();
        if (!resource) {
            let uri = new URI(this.nsURI);
            resource = new EResourceImpl();
            resource.eURI = uri;
            resource.eContents().add(this);
        }
        return resource;
    }

    protected initEClass(
        eClass: EClass,
        name: string,
        instanceTypeName: string,
        isAbstract: boolean,
        isInterface: boolean,
    ) {
        eClass.name = name;
        eClass.isAbstract = isAbstract;
        eClass.isInterface = isInterface;
        eClass.instanceTypeName = instanceTypeName;
    }

    protected initEStructuralFeature(
        aFeature: EStructuralFeature,
        aClassifier: EClassifier,
        name: string,
        defaultValue: string,
        lowerBound: number,
        upperBound: number,
        isTransient: boolean,
        isVolatile: boolean,
        isChangeable: boolean,
        isUnSettable: boolean,
        isUnique: boolean,
        isDerived: boolean,
        isOrdered: boolean,
    ) {
        aFeature.name = name;
        aFeature.eType = aClassifier;
        aFeature.defaultValueLiteral = defaultValue;
        aFeature.lowerBound = lowerBound;
        aFeature.upperBound = upperBound;
        aFeature.isTransient = isTransient;
        aFeature.isVolatile = isVolatile;
        aFeature.isChangeable = isChangeable;
        aFeature.isUnsettable = isUnSettable;
        aFeature.isUnique = isUnique;
        aFeature.isDerived = isDerived;
        aFeature.isOrdered = isOrdered;
    }

    protected initEAttribute(
        aAttribute: EAttribute,
        aType: EClassifier,
        name: string,
        defaultValue: string,
        lowerBound: number,
        upperBound: number,
        isTransient: boolean,
        isVolatile: boolean,
        isChangeable: boolean,
        isUnSettable: boolean,
        isUnique: boolean,
        isDerived: boolean,
        isOrdered: boolean,
        isID: boolean,
    ) {
        this.initEStructuralFeature(
            aAttribute,
            aType,
            name,
            defaultValue,
            lowerBound,
            upperBound,
            isTransient,
            isVolatile,
            isChangeable,
            isUnSettable,
            isUnique,
            isDerived,
            isOrdered,
        );
        aAttribute.isID = isID;
    }

    protected initEReference(
        aReference: EReference,
        aType: EClassifier,
        aOtherEnd: EReference,
        name: string,
        defaultValue: string,
        lowerBound: number,
        upperBound: number,
        isTransient: boolean,
        isVolatile: boolean,
        isChangeable: boolean,
        isContainment: boolean,
        isResolveProxies: boolean,
        isUnSettable: boolean,
        isUnique: boolean,
        isDerived: boolean,
        isOrdered: boolean,
    ) {
        this.initEStructuralFeature(
            aReference,
            aType,
            name,
            defaultValue,
            lowerBound,
            upperBound,
            isTransient,
            isVolatile,
            isChangeable,
            isUnSettable,
            isUnique,
            isDerived,
            isOrdered,
        );
        aReference.isContainment = isContainment;
        aReference.isResolveProxies = isResolveProxies;
        aReference.eOpposite = aOtherEnd;
    }

    protected initEOperation(
        aOperation: EOperation,
        aType: EClassifier,
        name: string,
        lowerBound: number,
        upperBound: number,
        isUnique: boolean,
        isOrdered: boolean,
    ) {
        aOperation.name = name;
        aOperation.eType = aType;
        aOperation.lowerBound = lowerBound;
        aOperation.upperBound = upperBound;
        aOperation.isUnique = isUnique;
        aOperation.isOrdered = isOrdered;
    }

    protected addEParameter(
        aOperation: EOperation,
        aType: EClassifier,
        name: string,
        lowerBound: number,
        upperBound: number,
        isUnique: boolean,
        isOrdered: boolean,
    ) {
        let parameter = getEcoreFactory().createEParameterFromContainer(aOperation);
        parameter.name = name;
        parameter.eType = aType;
        parameter.lowerBound = lowerBound;
        parameter.upperBound = upperBound;
        parameter.isUnique = isUnique;
        parameter.isOrdered = isOrdered;
    }

    protected initEClassifier(aClassifier: EClassifier, name: string, instanceTypeName: string) {
        aClassifier.name = name;
        aClassifier.instanceTypeName = instanceTypeName;
    }

    protected initEDataType(
        aDataType: EDataType,
        name: string,
        instanceTypeName: string,
        defaultValue: string,
        isSerializable: boolean,
    ) {
        this.initEClassifier(aDataType, name, instanceTypeName);
        aDataType.isSerializable = isSerializable;
        if (defaultValue.length > 0) {
            let aDataTypeInternal = aDataType as EDataTypeInternal;
            aDataTypeInternal.defaultValue = this.eFactoryInstance.createFromString(aDataType, defaultValue);
        }
    }

    protected initEEnum(aEnum: EEnum, name: string, instanceTypeName: string) {
        this.initEClassifier(aEnum, name, instanceTypeName);
    }

    protected addEEnumLiteral(aEnum: EEnum, name: string, literal: string, value: number) {
        let enumLiteral = getEcoreFactory().createEEnumLiteralFromContainer(aEnum);
        enumLiteral.name = name;
        enumLiteral.literal = literal;
        enumLiteral.value = value;
    }
}
