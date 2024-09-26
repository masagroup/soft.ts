import { describe, expect, test } from "vitest"
import { instance, mock, when } from "ts-mockito"
import { EObject } from "./EObject.js";
import { EObjectInternal, isEObject, isEObjectInternal } from "./EObjectInternal.js";
import { ENotifier } from "./ENotifier.js";

describe('EObjectInternal', () => {
    test('isEObject', () => {
        const mockObject = mock<EObject>()
        const object = instance(mockObject)
        when(mockObject.eClass()).thenReturn(null)
        expect(isEObject(object)).toBeTruthy()

        const mockNotifier = mock<ENotifier>()
        const notifier = instance(mockNotifier)
        expect(isEObject(notifier)).toBeFalsy()
    });
    test('isEObjectInternal', () => {
        const mockObjectInternal = mock<EObjectInternal>()
        const objectInternal = instance(mockObjectInternal)
        when(mockObjectInternal.eClass()).thenReturn(null)
        when(mockObjectInternal.eStaticClass()).thenReturn(null)
        expect(isEObjectInternal(objectInternal)).toBeTruthy()

        const mockObject = mock<EObject>()
        const object = instance(mockObject)
        when(mockObject.eClass()).thenReturn(null)
        expect(isEObjectInternal(object)).toBeFalsy()
    });
});