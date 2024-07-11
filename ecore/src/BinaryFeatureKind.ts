import { EStructuralFeature, isEReference, isEEnum, isEAttribute, isEDataType } from "./internal.js"

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
        if (eFeature.isContainment) {
            if (eFeature.isResolveProxies) {
                if (eFeature.isMany) {
                    return BinaryFeatureKind.bfkObjectContainmentListProxy
                } else {
                    return BinaryFeatureKind.bfkObjectContainmentProxy
                }
            } else {
                if (eFeature.isMany) {
                    return BinaryFeatureKind.bfkObjectContainmentList
                } else {
                    return BinaryFeatureKind.bfkObjectContainment
                }
            }
        } else if (eFeature.isContainer) {
            if (eFeature.isResolveProxies) {
                return BinaryFeatureKind.bfkObjectContainerProxy
            } else {
                return BinaryFeatureKind.bfkObjectContainer
            }
        } else if (eFeature.isResolveProxies) {
            if (eFeature.isMany) {
                return BinaryFeatureKind.bfkObjectListProxy
            } else {
                return BinaryFeatureKind.bfkObjectProxy
            }
        } else {
            if (eFeature.isMany) {
                return BinaryFeatureKind.bfkObjectList
            } else {
                return BinaryFeatureKind.bfkObject
            }
        }
    } else if (isEAttribute(eFeature)) {
        if (eFeature.isMany) {
            return BinaryFeatureKind.bfkDataList
        } else {
            let eDataType = eFeature.eAttributeType
            if (isEEnum(eDataType)) return BinaryFeatureKind.bfkEnum

            switch (eDataType.instanceTypeName) {
                case "number":
                case "java.lang.Double":
                case "java.lang.Float":
                case "java.lang.Integer":
                case "java.lang.Long":
                case "java.lang.Short":
                case "java.math.BigInteger":
                case "double":
                case "float":
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
                case "java.util.ByteArray":
                    return BinaryFeatureKind.bfkByteArray
                case "Date":
                case "java.util.Date":
                    return BinaryFeatureKind.bfkDate
            }
            return BinaryFeatureKind.bfkData
        }
    }
    return null
}
