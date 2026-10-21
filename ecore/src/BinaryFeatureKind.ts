// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EDataType, EStructuralFeature, getEcorePackage, isEAttribute, isEEnum, isEReference } from "./internal.js"

// getInstanceTypeName returns the type of the values of eDataType as go sees it: the instance type of
// its GenGo annotation first, as the go binary codec does, so that both write the same kinds
function getInstanceTypeName(eDataType: EDataType): string {
    const eAnnotation = eDataType.getEAnnotation("http://net.masagroup/soft/2019/GenGo")
    const name = eAnnotation?.getDetails().getValue("instanceTypeName")
    return name ? name : eDataType.getInstanceTypeName()
}

export enum BinaryFeatureKind {
    bfkObjectContainer,
    bfkObjectContainerProxy,
    bfkObject,
    bfkObjectProxy,
    bfkObjectList,
    bfkObjectListProxy,
    bfkObjectContainment,
    bfkObjectContainmentProxy,
    bfkObjectContainmentList,
    bfkObjectContainmentListProxy,
    bfkNumber,
    bfkFloat32,
    bfkByte,
    bfkBool,
    bfkString,
    bfkByteArray,
    bfkData,
    bfkDataList,
    bfkEnum,
    bfkDate
}

export function getBinaryCodecFeatureKind(eFeature: EStructuralFeature): BinaryFeatureKind {
    if (isEReference(eFeature)) {
        if (eFeature.isContainment()) {
            if (eFeature.isResolveProxies()) {
                if (eFeature.isMany()) {
                    return BinaryFeatureKind.bfkObjectContainmentListProxy
                } else {
                    return BinaryFeatureKind.bfkObjectContainmentProxy
                }
            } else {
                if (eFeature.isMany()) {
                    return BinaryFeatureKind.bfkObjectContainmentList
                } else {
                    return BinaryFeatureKind.bfkObjectContainment
                }
            }
        } else if (eFeature.isContainer()) {
            if (eFeature.isResolveProxies()) {
                return BinaryFeatureKind.bfkObjectContainerProxy
            } else {
                return BinaryFeatureKind.bfkObjectContainer
            }
        } else if (eFeature.isResolveProxies()) {
            if (eFeature.isMany()) {
                return BinaryFeatureKind.bfkObjectListProxy
            } else {
                return BinaryFeatureKind.bfkObjectProxy
            }
        } else {
            if (eFeature.isMany()) {
                return BinaryFeatureKind.bfkObjectList
            } else {
                return BinaryFeatureKind.bfkObject
            }
        }
    } else if (isEAttribute(eFeature)) {
        if (eFeature.isMany()) {
            return BinaryFeatureKind.bfkDataList
        } else {
            const eDataType = eFeature.getEAttributeType()
            if (isEEnum(eDataType)) return BinaryFeatureKind.bfkEnum

            // ecore float types are "number" in typescript but float32 in go
            const ecorePackage = getEcorePackage()
            if (eDataType === ecorePackage.getEFloat() || eDataType === ecorePackage.getEFloatObject()) {
                return BinaryFeatureKind.bfkFloat32
            }

            switch (getInstanceTypeName(eDataType)) {
                case "float":
                case "float32":
                case "java.lang.Float":
                    return BinaryFeatureKind.bfkFloat32
                case "byte":
                    return BinaryFeatureKind.bfkByte
                case "number":
                case "java.lang.Double":
                case "java.lang.Integer":
                case "java.lang.Long":
                case "java.lang.Short":
                case "java.math.BigInteger":
                case "double":
                case "float64":
                case "int":
                case "int64":
                case "int32":
                case "int16":
                case "short":
                case "long":
                    return BinaryFeatureKind.bfkNumber
                case "bool":
                case "boolean":
                case "java.lang.Boolean":
                    return BinaryFeatureKind.bfkBool
                case "string":
                case "java.lang.String":
                    return BinaryFeatureKind.bfkString
                case "Uint8Array":
                case "[]byte":
                case "java.util.ByteArray":
                    return BinaryFeatureKind.bfkByteArray
                case "Date":
                case "*time/time.Time":
                case "java.util.Date":
                    return BinaryFeatureKind.bfkDate
            }
            return BinaryFeatureKind.bfkData
        }
    }
    return null
}
