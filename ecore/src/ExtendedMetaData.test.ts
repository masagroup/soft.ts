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
            let emd = new ExtendedMetaData()
            let mockElement = mock<ENamedElement>()
            let element = instance(mockElement)
            when(mockElement.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockElement.name).thenReturn("no annotations")
            expect(emd.getName(element)).toBe("no annotations")
            expect(emd.getName(element)).toBe("no annotations")
            verify(mockElement.getEAnnotation(annotationURI)).once()
            verify(mockElement.name).once()
        })

        test("with annotations", () => {
            let emd = new ExtendedMetaData()
            let mockFeature = mock<EStructuralFeature>()
            let feature = instance(mockFeature)
            let mockAnnotation = mock<EAnnotation>()
            let annotation = instance(mockAnnotation)
            let mockDetails = mock<EMap<string, string>>()
            let details = instance(mockDetails)
            when(mockFeature.featureID).thenReturn(-1)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.details).thenReturn(details)
            when(mockDetails.getValue("name")).thenReturn("with annotations")
            expect(emd.getName(feature)).toBe("with annotations")
            expect(emd.getName(feature)).toBe("with annotations")
            verify(mockFeature.getEAnnotation(annotationURI)).once()
            verify(mockAnnotation.details).once()
            verify(mockDetails.getValue("name")).once()
        })
    })

    test("getType", () => {
        let emd = new ExtendedMetaData()
        let mockPackage = mock<EPackage>()
        let ePackage = instance(mockPackage)
        let mockClassifier1 = mock<EClassifier>()
        let classifier1 = instance(mockClassifier1)
        let mockClassifier2 = mock<EClassifier>()
        let classifier2 = instance(mockClassifier2)
        let mockAnnotation = mock<EAnnotation>()
        let annotation = instance(mockAnnotation)
        let mockDetails = mock<EMap<string, string>>()
        let details = instance(mockDetails)

        when(mockPackage.eClassifiers).thenReturn(new ImmutableEList<EClassifier>([classifier1, classifier2]))
        when(mockClassifier1.getEAnnotation(annotationURI)).thenReturn(null)
        when(mockClassifier1.name).thenReturn("classifier1")
        when(mockClassifier2.getEAnnotation(annotationURI)).thenReturn(annotation)
        when(mockAnnotation.details).thenReturn(details)
        when(mockDetails.getValue("name")).thenReturn("classifier2")

        expect(emd.getType(ePackage, "classifier1")).toBe(classifier1)
        expect(emd.getType(ePackage, "classifier2")).toBe(classifier2)
    })

    describe("getNamespace", () => {
        test("empty", () => {
            let emd = new ExtendedMetaData()
            let mockFeature = mock<EStructuralFeature>()
            let feature = instance(mockFeature)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(null)
            expect(emd.getNamespace(feature)).toBe("")
            expect(emd.getNamespace(feature)).toBe("")
        })
        test("details", () => {
            let emd = new ExtendedMetaData()
            let mockFeature = mock<EStructuralFeature>()
            let feature = instance(mockFeature)
            let mockAnnotation = mock<EAnnotation>()
            let annotation = instance(mockAnnotation)
            let mockDetails = mock<EMap<string, string>>()
            let details = instance(mockDetails)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.details).thenReturn(details)
            when(mockDetails.getValue("namespace")).thenReturn("namespace")
            expect(emd.getNamespace(feature)).toBe("namespace")
            expect(emd.getNamespace(feature)).toBe("namespace")
        })
        test("package", () => {
            let emd = new ExtendedMetaData()
            let mockFeature = mock<EStructuralFeature>()
            let feature = instance(mockFeature)
            let mockAnnotation = mock<EAnnotation>()
            let annotation = instance(mockAnnotation)
            let mockDetails = mock<EMap<string, string>>()
            let details = instance(mockDetails)
            let mockPackage = mock<EPackage>()
            let ePackage = instance(mockPackage)
            let mockClass = mock<EClass>()
            let eClass = instance(mockClass)
            when(mockFeature.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.details).thenReturn(details)
            when(mockDetails.getValue("namespace")).thenReturn("##targetNamespace")
            when(mockFeature.eContainingClass).thenReturn(eClass)
            when(mockClass.ePackage).thenReturn(ePackage)
            when(mockPackage.nsURI).thenReturn("uri")
            expect(emd.getNamespace(feature)).toBe("uri")
            expect(emd.getNamespace(feature)).toBe("uri")
        })
    })

    describe("getDocumentRoot", () => {
        test("no annotations", () => {
            let emd = new ExtendedMetaData()
            let mockClass1 = mock<EClass>()
            let eClass1 = instance(mockClass1)
            let mockClass2 = mock<EClass>()
            let eClass2 = instance(mockClass2)
            let mockPackage = mock<EPackage>()
            let ePackage = instance(mockPackage)
            when(mockPackage.eClassifiers).thenReturn(new ImmutableEList<EClassifier>([eClass1, eClass2]))
            when(mockClass1.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockClass1.name).thenReturn("classifier1")
            when(mockClass2.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockClass2.name).thenReturn("classifier2")
            expect(emd.getDocumentRoot(ePackage)).toBeNull()
        })
        test("with annotations but no name", () => {
            let emd = new ExtendedMetaData()
            let mockClass1 = mock<EClass>()
            let eClass1 = instance(mockClass1)
            let mockClass2 = mock<EClass>()
            let eClass2 = instance(mockClass2)
            let mockPackage = mock<EPackage>()
            let ePackage = instance(mockPackage)
            let mockAnnotation = mock<EAnnotation>()
            let annotation = instance(mockAnnotation)
            let mockDetails = mock<EMap<string, string>>()
            let details = instance(mockDetails)
            when(mockPackage.eClassifiers).thenReturn(new ImmutableEList<EClassifier>([eClass1, eClass2]))
            when(mockClass1.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.details).thenReturn(details)
            when(mockDetails.getValue("name")).thenReturn(undefined)
            expect(emd.getDocumentRoot(ePackage)).toBeNull()
        })
        test("with annotations and name", () => {
            let emd = new ExtendedMetaData()
            let mockClass1 = mock<EClass>()
            let eClass1 = instance(mockClass1)
            let mockClass2 = mock<EClass>()
            let eClass2 = instance(mockClass2)
            let mockPackage = mock<EPackage>()
            let ePackage = instance(mockPackage)
            let mockAnnotation = mock<EAnnotation>()
            let annotation = instance(mockAnnotation)
            let mockDetails = mock<EMap<string, string>>()
            let details = instance(mockDetails)
            when(mockPackage.eClassifiers).thenReturn(new ImmutableEList<EClassifier>([eClass1, eClass2]))
            when(mockClass1.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockClass1.name).thenReturn("classifier1")
            when(mockClass2.getEAnnotation(annotationURI)).thenReturn(annotation)
            when(mockAnnotation.details).thenReturn(details)
            when(mockDetails.getValue("name")).thenReturn("")
            expect(emd.getDocumentRoot(ePackage)).toBe(eClass2)
        })
    })

    describe("getXMLNSPrefixMapFeature", () => {
        test("no prefix", () => {
            let emd = new ExtendedMetaData()
            let mockClass = mock<EClass>()
            let eClass = instance(mockClass)
            let mockReference = mock<EReference>()
            let eReference = instance(mockReference)
            when(mockClass.eAllReferences).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.name).thenReturn("reference")
            expect(emd.getXMLNSPrefixMapFeature(eClass)).toBeNull()
        })

        test("prefix", () => {
            let emd = new ExtendedMetaData()
            let mockClass = mock<EClass>()
            let eClass = instance(mockClass)
            let mockReference = mock<EReference>()
            let eReference = instance(mockReference)
            when(mockClass.eAllReferences).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.name).thenReturn("xmlns:prefix")
            expect(emd.getXMLNSPrefixMapFeature(eClass)).toBe(eReference)
        })
    })

    describe("getXSISchemaLocationMapFeature", () => {
        test("no schema", () => {
            let emd = new ExtendedMetaData()
            let mockClass = mock<EClass>()
            let eClass = instance(mockClass)
            let mockReference = mock<EReference>()
            let eReference = instance(mockReference)
            when(mockClass.eAllReferences).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.name).thenReturn("reference")
            expect(emd.getXSISchemaLocationMapFeature(eClass)).toBeNull()
        })

        test("schema", () => {
            let emd = new ExtendedMetaData()
            let mockClass = mock<EClass>()
            let eClass = instance(mockClass)
            let mockReference = mock<EReference>()
            let eReference = instance(mockReference)
            when(mockClass.eAllReferences).thenReturn(new ImmutableEList<EReference>([eReference]))
            when(mockReference.getEAnnotation(annotationURI)).thenReturn(null)
            when(mockReference.name).thenReturn("xsi:schemaLocation")
            expect(emd.getXSISchemaLocationMapFeature(eClass)).toBe(eReference)
        })
    })
})
