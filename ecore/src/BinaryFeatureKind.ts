import { isEAttribute } from "./EAttributeExt";
import { isEDataType } from "./EDataTypeExt";
import { isEEnum } from "./EEnumExt";
import { EStructuralFeature, isEReference } from "./internal";


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
	bfkFloat64,
	bfkFloat32,
	bfkInt,
	bfkInt64,
	bfkInt32,
	bfkInt16,
	bfkByte,
	bfkBool,
	bfkString,
	bfkByteArray,
	bfkData,
	bfkDataList,
	bfkEnum,
	bfkDate,
}

export function getBinaryCodecFeatureKind(eFeature : EStructuralFeature) : BinaryFeatureKind {
    if (isEReference(eFeature) ) {
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
			let eDataType = eFeature.eAttributeType;
            if (isEEnum(eDataType))
                return BinaryFeatureKind.bfkEnum;
			
			switch (eDataType.instanceTypeName) {
			case "float64":
				return BinaryFeatureKind.bfkFloat64
			case "float32":
				return BinaryFeatureKind.bfkFloat32
			case "int":
				return BinaryFeatureKind.bfkInt
			case "int64":
				return BinaryFeatureKind.bfkInt64
			case "int32":
				return BinaryFeatureKind.bfkInt32
			case "int16":
				return BinaryFeatureKind.bfkInt16
			case "byte":
				return BinaryFeatureKind.bfkByte
			case "bool":
				return BinaryFeatureKind.bfkBool
			case "string":
				return BinaryFeatureKind.bfkString
			case "[]byte":
				return BinaryFeatureKind.bfkByteArray
			case "*time.Time":
				return BinaryFeatureKind.bfkDate
			}
			return BinaryFeatureKind.bfkData
		}
	}
	return -1
}

