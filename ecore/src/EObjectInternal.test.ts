import { instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { ENotifier } from "./ENotifier.js"
import { EObject } from "./EObject.js"
import { EObjectInternal, isEObject, isEObjectInternal } from "./EObjectInternal.js"

describe("EObjectInternal", () => {
    test("isEObject", () => {
        const mockObject = mock<EObject>()
        const object = instance(mockObject)
        when(mockObject.eClass()).thenReturn(null)
        expect(isEObject(object)).toBeTruthy()

        const mockNotifier = mock<ENotifier>()
        const notifier = instance(mockNotifier)
        expect(isEObject(notifier)).toBeFalsy()

        const primitives = [42, "string", true, false, null, undefined, Symbol("sym"), 100n]
        for (const p of primitives) {
            expect(isEObject(p as any)).toBe(false)
        }
    })
    test("isEObjectInternal", () => {
        const mockObjectInternal = mock<EObjectInternal>()
        const objectInternal = instance(mockObjectInternal)
        when(mockObjectInternal.eClass()).thenReturn(null)
        when(mockObjectInternal.eStaticClass()).thenReturn(null)
        expect(isEObjectInternal(objectInternal)).toBeTruthy()

        const mockObject = mock<EObject>()
        const object = instance(mockObject)
        when(mockObject.eClass()).thenReturn(null)
        expect(isEObjectInternal(object)).toBeFalsy()

        const primitives = [42, "string", true, false, null, undefined, Symbol("sym"), 100n]
        for (const p of primitives) {
            expect(isEObjectInternal(p as any)).toBe(false)
        }
    })
})
