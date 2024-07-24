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
    URI
} from "./internal.js"

export function isEPackage(o: any): o is EPackage {
    return o == undefined ? undefined : "nsURI" in o
}

class EPackageExtAdapter extends AbstractEAdapter {
    constructor(private _pack: EPackageExt) {
        super()
    }

    notifyChanged(notification: ENotification): void {
        if (
            notification.getEventType() != EventType.REMOVING_ADAPTER &&
            notification.getFeatureID() == EcoreConstants.EPACKAGE__ECLASSIFIERS
        ) {
            this._pack._nameToClassifier = null
        }
    }
}

export class EPackageExt extends EPackageImpl {
    _nameToClassifier: Map<string, EClassifier> = null
    _adapter: EAdapter = null

    constructor() {
        super()
        this.setEFactoryInstance(new EFactoryExt())
        this._adapter = new EPackageExtAdapter(this)
        this.eAdapters().add(this._adapter)
    }

    getEClassifier(name: string): EClassifier {
        if (!this._nameToClassifier) {
            this._nameToClassifier = new Map<string, EClassifier>()
            for (const classifier of this.getEClassifiers()) {
                this._nameToClassifier.set(classifier.getName(), classifier)
            }
        }
        return this._nameToClassifier.get(name)
    }

    protected createResource(): EResource {
        let resource = this.eResource()
        if (!resource) {
            let uri = new URI(this.getNsURI())
            resource = new EResourceImpl()
            resource.eURI = uri
            resource.eContents().add(this)
        }
        return resource
    }

    protected initEClass(
        eClass: EClass,
        name: string,
        instanceTypeName: string,
        isAbstract: boolean,
        isInterface: boolean
    ) {
        eClass.setName(name)
        eClass.setAbstract(isAbstract)
        eClass.setInterface(isInterface)
        eClass.setInstanceTypeName(instanceTypeName)
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
        isOrdered: boolean
    ) {
        aFeature.setName(name)
        aFeature.setEType(aClassifier)
        aFeature.setDefaultValueLiteral(defaultValue)
        aFeature.setLowerBound(lowerBound)
        aFeature.setUpperBound(upperBound)
        aFeature.setTransient(isTransient)
        aFeature.setVolatile(isVolatile)
        aFeature.setChangeable(isChangeable)
        aFeature.setUnsettable(isUnSettable)
        aFeature.setUnique(isUnique)
        aFeature.setDerived(isDerived)
        aFeature.setOrdered(isOrdered)
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
        isID: boolean
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
            isOrdered
        )
        aAttribute.setID(isID)
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
        isOrdered: boolean
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
            isOrdered
        )
        aReference.setContainment(isContainment)
        aReference.setResolveProxies(isResolveProxies)
        aReference.setEOpposite(aOtherEnd)
    }

    protected initEOperation(
        aOperation: EOperation,
        aType: EClassifier,
        name: string,
        lowerBound: number,
        upperBound: number,
        isUnique: boolean,
        isOrdered: boolean
    ) {
        aOperation.setName(name)
        aOperation.setEType(aType)
        aOperation.setLowerBound(lowerBound)
        aOperation.setUpperBound(upperBound)
        aOperation.setUnique(isUnique)
        aOperation.setOrdered(isOrdered)
    }

    protected addEParameter(
        aOperation: EOperation,
        aType: EClassifier,
        name: string,
        lowerBound: number,
        upperBound: number,
        isUnique: boolean,
        isOrdered: boolean
    ) {
        let parameter = getEcoreFactory().createEParameterFromContainer(aOperation)
        parameter.setName(name)
        parameter.setEType(aType)
        parameter.setLowerBound(lowerBound)
        parameter.setUpperBound(upperBound)
        parameter.setUnique(isUnique)
        parameter.setOrdered(isOrdered)
    }

    protected initEClassifier(aClassifier: EClassifier, name: string, instanceTypeName: string) {
        aClassifier.setName(name)
        aClassifier.setInstanceTypeName(instanceTypeName)
    }

    protected initEDataType(
        aDataType: EDataType,
        name: string,
        instanceTypeName: string,
        defaultValue: string,
        isSerializable: boolean
    ) {
        this.initEClassifier(aDataType, name, instanceTypeName)
        aDataType.setSerializable(isSerializable)
        if (defaultValue.length > 0) {
            let aDataTypeInternal = aDataType as EDataTypeInternal
            aDataTypeInternal.setDefaultValue(this._eFactoryInstance.createFromString(aDataType, defaultValue))
        }
    }

    protected initEEnum(aEnum: EEnum, name: string, instanceTypeName: string) {
        this.initEClassifier(aEnum, name, instanceTypeName)
    }

    protected addEEnumLiteral(aEnum: EEnum, name: string, literal: string, value: number) {
        let enumLiteral = getEcoreFactory().createEEnumLiteralFromContainer(aEnum)
        enumLiteral.setName(name)
        enumLiteral.setLiteral(literal)
        enumLiteral.setValue(value)
    }
}
