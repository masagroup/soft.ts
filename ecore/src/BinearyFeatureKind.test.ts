import { instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind.js"
import { EAttribute, EDataType, EEnum, EReference, EStructuralFeature } from "./internal.js"

describe("BinaryFeatureKind", () => {
    test("unknown", () => {
        const mockFeature = mock<EStructuralFeature>()
        const feature = instance(mockFeature)
        expect(getBinaryCodecFeatureKind(feature)).toBeNull()
    })
    test("reference", () => {
        const mockReference = mock<EReference>()
        const reference = instance(mockReference)
        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(true)
        when(mockReference.isResolveProxies()).thenReturn(true)
        when(mockReference.isMany()).thenReturn(true)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectContainmentListProxy)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(true)
        when(mockReference.isResolveProxies()).thenReturn(true)
        when(mockReference.isMany()).thenReturn(false)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectContainmentProxy)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(true)
        when(mockReference.isResolveProxies()).thenReturn(false)
        when(mockReference.isMany()).thenReturn(true)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectContainmentList)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(true)
        when(mockReference.isResolveProxies()).thenReturn(false)
        when(mockReference.isMany()).thenReturn(false)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectContainment)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(false)
        when(mockReference.isContainer()).thenReturn(true)
        when(mockReference.isResolveProxies()).thenReturn(false)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectContainer)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(false)
        when(mockReference.isContainer()).thenReturn(true)
        when(mockReference.isResolveProxies()).thenReturn(true)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectContainerProxy)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(false)
        when(mockReference.isContainer()).thenReturn(false)
        when(mockReference.isResolveProxies()).thenReturn(true)
        when(mockReference.isMany()).thenReturn(true)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectListProxy)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(false)
        when(mockReference.isContainer()).thenReturn(false)
        when(mockReference.isResolveProxies()).thenReturn(true)
        when(mockReference.isMany()).thenReturn(false)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectProxy)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(false)
        when(mockReference.isContainer()).thenReturn(false)
        when(mockReference.isResolveProxies()).thenReturn(false)
        when(mockReference.isMany()).thenReturn(true)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObjectList)

        when(mockReference.getEReferenceType()).thenReturn(null)
        when(mockReference.isContainment()).thenReturn(false)
        when(mockReference.isContainer()).thenReturn(false)
        when(mockReference.isResolveProxies()).thenReturn(false)
        when(mockReference.isMany()).thenReturn(false)
        expect(getBinaryCodecFeatureKind(reference)).toEqual(BinaryFeatureKind.bfkObject)
    })

    test("attribute", () => {
        const mockAttribute = mock<EAttribute>()
        const attribute = instance(mockAttribute)

        when(mockAttribute.getEAttributeType()).thenReturn(null)
        when(mockAttribute.isMany()).thenReturn(true)
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkDataList)

        const mockEnum = mock<EEnum>()
        const eEnum = instance(mockEnum)
        when(mockAttribute.isMany()).thenReturn(false)
        when(mockAttribute.getEAttributeType()).thenReturn(eEnum)
        when(mockEnum.getELiterals()).thenReturn(null)
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkEnum)

        const mockDataType = mock<EDataType>()
        const dataType = instance(mockDataType)
        when(mockAttribute.isMany()).thenReturn(false)
        when(mockAttribute.getEAttributeType()).thenReturn(dataType)
        when(mockDataType.getInstanceTypeName()).thenReturn("number")
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkNumber)

        when(mockAttribute.isMany()).thenReturn(false)
        when(mockAttribute.getEAttributeType()).thenReturn(dataType)
        when(mockDataType.getInstanceTypeName()).thenReturn("bool")
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkBool)

        when(mockAttribute.isMany()).thenReturn(false)
        when(mockAttribute.getEAttributeType()).thenReturn(dataType)
        when(mockDataType.getInstanceTypeName()).thenReturn("string")
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkString)

        when(mockAttribute.isMany()).thenReturn(false)
        when(mockAttribute.getEAttributeType()).thenReturn(dataType)
        when(mockDataType.getInstanceTypeName()).thenReturn("Uint8Array")
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkByteArray)

        when(mockAttribute.isMany()).thenReturn(false)
        when(mockAttribute.getEAttributeType()).thenReturn(dataType)
        when(mockDataType.getInstanceTypeName()).thenReturn("Date")
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkDate)

        when(mockAttribute.isMany()).thenReturn(false)
        when(mockAttribute.getEAttributeType()).thenReturn(dataType)
        when(mockDataType.getInstanceTypeName()).thenReturn("data")
        expect(getBinaryCodecFeatureKind(attribute)).toEqual(BinaryFeatureKind.bfkData)
    })
})
