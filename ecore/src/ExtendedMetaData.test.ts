import { instance, mock, verify, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import {
    EAnnotation,
    EClass,
    EClassifier,
    EMap,
    ENamedElement,
    EPackage,
    EReference,
    EStructuralFeature,
    ExtendedMetaData,
    ImmutableEList
} from "./internal.js"

const annotationURI = "http:///org/eclipse/emf/ecore/util/ExtendedMetaData"

describe("ExtendedMetaData", () => {
    describe("getName", () => {
        test("no annotations ", () => {
            const emd = new ExtendedMetaData()
            const mockElement = mock<ENamedElement>()
            const element = instance(mockElement)
            when(mockElement.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockElement.getName()).thenReturn("no annotations")
            expect(emd.getName(element)).toBe("no annotations")
            expect(emd.getName(element)).toBe("no annotations")
            verify(mockElement.getEAnnotation(annotationURI)).once()
            verify(mockElement.getName()).once()
        })

        test("with annotations", () => {
            const emd = new ExtendedMetaData()
            const mockFeature = mock<EStructuralFeature>()
            const feature = instance(mockFeature)
            const mockAnnotation = mock<EAnnotation>()
            const annotation = instance(mockAnnotation)
            const mockDetails = mock<EMap<string, string>>()
            const details = instance(mockDetails)
            when(mockFeature.getFeatureID()).thenReturn(-1)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.getDetails()).thenReturn(details)
            when(mockDetails.getValue("name")).thenReturn("with annotations")
            expect(emd.getName(feature)).toBe("with annotations")
            expect(emd.getName(feature)).toBe("with annotations")
            verify(mockFeature.getEAnnotation(annotationURI)).once()
            verify(mockAnnotation.getDetails()).once()
            verify(mockDetails.getValue("name")).once()
        })
    })

    test("getType", () => {
        const emd = new ExtendedMetaData()
        const mockPackage = mock<EPackage>()
        const ePackage = instance(mockPackage)
        const mockClassifier1 = mock<EClassifier>()
        const classifier1 = instance(mockClassifier1)
        const mockClassifier2 = mock<EClassifier>()
        const classifier2 = instance(mockClassifier2)
        const mockAnnotation = mock<EAnnotation>()
        const annotation = instance(mockAnnotation)
        const mockDetails = mock<EMap<string, string>>()
        const details = instance(mockDetails)

        when(mockPackage.getEClassifiers()).thenReturn(new ImmutableEList<EClassifier>([classifier1, classifier2]))
        when(mockClassifier1.getEAnnotation(annotationURI)).thenReturn(null)
        when(mockClassifier1.getName()).thenReturn("classifier1")
        when(mockClassifier2.getEAnnotation(annotationURI)).thenReturn(annotation)
        when(mockAnnotation.getDetails()).thenReturn(details)
        when(mockDetails.getValue("name")).thenReturn("classifier2")

        expect(emd.getType(ePackage, "classifier1")).toBe(classifier1)
        expect(emd.getType(ePackage, "classifier2")).toBe(classifier2)
    })

    describe("getNamespace", () => {
        test("empty", () => {
            const emd = new ExtendedMetaData()
            const mockFeature = mock<EStructuralFeature>()
            const feature = instance(mockFeature)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(null)
            expect(emd.getNamespace(feature)).toBe("")
            expect(emd.getNamespace(feature)).toBe("")
        })
        test("details", () => {
            const emd = new ExtendedMetaData()
            const mockFeature = mock<EStructuralFeature>()
            const feature = instance(mockFeature)
            const mockAnnotation = mock<EAnnotation>()
            const annotation = instance(mockAnnotation)
            const mockDetails = mock<EMap<string, string>>()
            const details = instance(mockDetails)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.getDetails()).thenReturn(details)
            when(mockDetails.getValue("namespace")).thenReturn("namespace")
            expect(emd.getNamespace(feature)).toBe("namespace")
            expect(emd.getNamespace(feature)).toBe("namespace")
        })
        test("package", () => {
            const emd = new ExtendedMetaData()
            const mockFeature = mock<EStructuralFeature>()
            const feature = instance(mockFeature)
            const mockAnnotation = mock<EAnnotation>()
            const annotation = instance(mockAnnotation)
            const mockDetails = mock<EMap<string, string>>()
            const details = instance(mockDetails)
            const mockPackage = mock<EPackage>()
            const ePackage = instance(mockPackage)
            const mockClass = mock<EClass>()
            const eClass = instance(mockClass)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.getDetails()).thenReturn(details)
            when(mockDetails.getValue("namespace")).thenReturn("##targetNamespace")
            when(mockFeature.getEContainingClass()).thenReturn(eClass)
            when(mockClass.getEPackage()).thenReturn(ePackage)
            when(mockPackage.getNsURI()).thenReturn("uri")
            expect(emd.getNamespace(feature)).toBe("uri")
            expect(emd.getNamespace(feature)).toBe("uri")
        })
    })

    describe("getDocumentRoot", () => {
        test("no annotations", () => {
            const emd = new ExtendedMetaData()
            const mockClass1 = mock<EClass>()
            const eClass1 = instance(mockClass1)
            const mockClass2 = mock<EClass>()
            const eClass2 = instance(mockClass2)
            const mockPackage = mock<EPackage>()
            const ePackage = instance(mockPackage)
            when(mockPackage.getEClassifiers()).thenReturn(new ImmutableEList<EClassifier>([eClass1, eClass2]))
            when(mockClass1.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockClass1.getName()).thenReturn("classifier1")
            when(mockClass2.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockClass2.getName()).thenReturn("classifier2")
            expect(emd.getDocumentRoot(ePackage)).toBeNull()
        })
        test("with annotations but no name", () => {
            const emd = new ExtendedMetaData()
            const mockClass1 = mock<EClass>()
            const eClass1 = instance(mockClass1)
            const mockClass2 = mock<EClass>()
            const eClass2 = instance(mockClass2)
            const mockPackage = mock<EPackage>()
            const ePackage = instance(mockPackage)
            const mockAnnotation = mock<EAnnotation>()
            const annotation = instance(mockAnnotation)
            const mockDetails = mock<EMap<string, string>>()
            const details = instance(mockDetails)
            when(mockPackage.getEClassifiers()).thenReturn(new ImmutableEList<EClassifier>([eClass1, eClass2]))
            when(mockClass1.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.getDetails()).thenReturn(details)
            when(mockDetails.getValue("name")).thenReturn(undefined)
            expect(emd.getDocumentRoot(ePackage)).toBeNull()
        })
        test("with annotations and name", () => {
            const emd = new ExtendedMetaData()
            const mockClass1 = mock<EClass>()
            const eClass1 = instance(mockClass1)
            const mockClass2 = mock<EClass>()
            const eClass2 = instance(mockClass2)
            const mockPackage = mock<EPackage>()
            const ePackage = instance(mockPackage)
            const mockAnnotation = mock<EAnnotation>()
            const annotation = instance(mockAnnotation)
            const mockDetails = mock<EMap<string, string>>()
            const details = instance(mockDetails)
            when(mockPackage.getEClassifiers()).thenReturn(new ImmutableEList<EClassifier>([eClass1, eClass2]))
            when(mockClass1.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockClass1.getName()).thenReturn("classifier1")
            when(mockClass2.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.getDetails()).thenReturn(details)
            when(mockDetails.getValue("name")).thenReturn("")
            expect(emd.getDocumentRoot(ePackage)).toBe(eClass2)
        })
    })

    describe("getXMLNSPrefixMapFeature", () => {
        test("no prefix", () => {
            const emd = new ExtendedMetaData()
            const mockClass = mock<EClass>()
            const eClass = instance(mockClass)
            const mockReference = mock<EReference>()
            const eReference = instance(mockReference)
            when(mockClass.getEAllReferences()).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.getName()).thenReturn("reference")
            expect(emd.getXMLNSPrefixMapFeature(eClass)).toBeNull()
        })

        test("prefix", () => {
            const emd = new ExtendedMetaData()
            const mockClass = mock<EClass>()
            const eClass = instance(mockClass)
            const mockReference = mock<EReference>()
            const eReference = instance(mockReference)
            when(mockClass.getEAllReferences()).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.getName()).thenReturn("xmlns:prefix")
            expect(emd.getXMLNSPrefixMapFeature(eClass)).toBe(eReference)
        })
    })

    describe("getXSISchemaLocationMapFeature", () => {
        test("no schema", () => {
            const emd = new ExtendedMetaData()
            const mockClass = mock<EClass>()
            const eClass = instance(mockClass)
            const mockReference = mock<EReference>()
            const eReference = instance(mockReference)
            when(mockClass.getEAllReferences()).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.getName()).thenReturn("reference")
            expect(emd.getXSISchemaLocationMapFeature(eClass)).toBeNull()
        })

        test("schema", () => {
            const emd = new ExtendedMetaData()
            const mockClass = mock<EClass>()
            const eClass = instance(mockClass)
            const mockReference = mock<EReference>()
            const eReference = instance(mockReference)
            when(mockClass.getEAllReferences()).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.getName()).thenReturn("xsi:schemaLocation")
            expect(emd.getXSISchemaLocationMapFeature(eClass)).toBe(eReference)
        })
    })
})
