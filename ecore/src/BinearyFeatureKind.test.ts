import { instance, mock, verify, when } from "ts-mockito";
import { EAttribute, EDataType, EEnum, EReference, EStructuralFeature } from "./internal";
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind";

describe("BinaryFeatureKind", () => {
    test("unknown", () => {
        let mockFeature = mock<EStructuralFeature>();
        let feature = instance(mockFeature);
        expect(getBinaryCodecFeatureKind(feature)).toBeNull();
    });
    test("reference", () => {
        let mockReference = mock<EReference>();
        let reference = instance(mockReference);
        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(true);
        when(mockReference.isResolveProxies).thenReturn(true);
        when(mockReference.isMany).thenReturn(true);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(
            BinaryFeatureKind.bfkObjectContainmentListProxy,
        );

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(true);
        when(mockReference.isResolveProxies).thenReturn(true);
        when(mockReference.isMany).thenReturn(false);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(
            BinaryFeatureKind.bfkObjectContainmentProxy,
        );

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(true);
        when(mockReference.isResolveProxies).thenReturn(false);
        when(mockReference.isMany).thenReturn(true);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(
            BinaryFeatureKind.bfkObjectContainmentList,
        );

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(true);
        when(mockReference.isResolveProxies).thenReturn(false);
        when(mockReference.isMany).thenReturn(false);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(
            BinaryFeatureKind.bfkObjectContainment,
        );

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(false);
        when(mockReference.isContainer).thenReturn(true);
        when(mockReference.isResolveProxies).thenReturn(false);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectContainer);

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(false);
        when(mockReference.isContainer).thenReturn(true);
        when(mockReference.isResolveProxies).thenReturn(true);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(
            BinaryFeatureKind.bfkObjectContainerProxy,
        );

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(false);
        when(mockReference.isContainer).thenReturn(false);
        when(mockReference.isResolveProxies).thenReturn(true);
        when(mockReference.isMany).thenReturn(true);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectListProxy);

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(false);
        when(mockReference.isContainer).thenReturn(false);
        when(mockReference.isResolveProxies).thenReturn(true);
        when(mockReference.isMany).thenReturn(false);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectProxy);

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(false);
        when(mockReference.isContainer).thenReturn(false);
        when(mockReference.isResolveProxies).thenReturn(false);
        when(mockReference.isMany).thenReturn(true);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectList);

        when(mockReference.eReferenceType).thenReturn(null);
        when(mockReference.isContainment).thenReturn(false);
        when(mockReference.isContainer).thenReturn(false);
        when(mockReference.isResolveProxies).thenReturn(false);
        when(mockReference.isMany).thenReturn(false);
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObject);
    });

    test("attribute", () => {
        let mockAttribute = mock<EAttribute>();
        let attribute = instance(mockAttribute);

        when(mockAttribute.eAttributeType).thenReturn(null);
        when(mockAttribute.isMany).thenReturn(true);
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkDataList);

        let mockEnum = mock<EEnum>();
        let eEnum = instance(mockEnum);
        when(mockAttribute.isMany).thenReturn(false);
        when(mockAttribute.eAttributeType).thenReturn(eEnum);
        when(mockEnum.eLiterals).thenReturn(null);
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkEnum);

        let mockDataType = mock<EDataType>();
        let dataType = instance(mockDataType);
        when(mockAttribute.isMany).thenReturn(false);
        when(mockAttribute.eAttributeType).thenReturn(dataType);
        when(mockDataType.instanceTypeName).thenReturn("number");
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkNumber);

        when(mockAttribute.isMany).thenReturn(false);
        when(mockAttribute.eAttributeType).thenReturn(dataType);
        when(mockDataType.instanceTypeName).thenReturn("bool");
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkBool);

        when(mockAttribute.isMany).thenReturn(false);
        when(mockAttribute.eAttributeType).thenReturn(dataType);
        when(mockDataType.instanceTypeName).thenReturn("string");
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkString);

        when(mockAttribute.isMany).thenReturn(false);
        when(mockAttribute.eAttributeType).thenReturn(dataType);
        when(mockDataType.instanceTypeName).thenReturn("Uint8Array");
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkByteArray);

        when(mockAttribute.isMany).thenReturn(false);
        when(mockAttribute.eAttributeType).thenReturn(dataType);
        when(mockDataType.instanceTypeName).thenReturn("Date");
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkDate);

        when(mockAttribute.isMany).thenReturn(false);
        when(mockAttribute.eAttributeType).thenReturn(dataType);
        when(mockDataType.instanceTypeName).thenReturn("data");
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkData);
    });
});
