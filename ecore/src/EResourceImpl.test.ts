import { instance, mock, verify, when } from "ts-mockito"
import { describe, test } from "vitest"
import { EObject, EObjectList, EResourceImpl, EResourceListener, ImmutableEList } from "./internal.js"

describe("EResourceImpl", () => {
    test("listeners", () => {
        const r = new EResourceImpl()
        const mockObject = mock<EObject>()
        const object = instance(mockObject)
        const mockListener = mock<EResourceListener>()
        const listener = instance(mockListener)
        const mockObjectList = mock<EObjectList<EObject>>()
        const objectList = instance(mockObjectList)
        r.getResourceListeners().add(listener)

        when(mockObject.eContents()).thenReturn(objectList)
        when(mockObjectList.getUnResolvedList()).thenReturn(new ImmutableEList())
        r.attached(object)
        verify(mockListener.attached(object)).once()
        r.detached(object)
        verify(mockListener.detached(object)).once()
    })
})
