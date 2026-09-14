import { anyNumber, instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { EMap, isEMap } from "./EMap.js"

describe("EMap", () => {
    test("isEMap", () => {
        var a: any
        expect(isEMap(a)).toBeFalsy()

        const mockMap = mock<EMap<any, any>>()
        const map = instance(mockMap)
        when(mockMap.moveTo(anyNumber(), anyNumber())).thenReturn(undefined)
        when(mockMap.put(anyNumber(), anyNumber())).thenReturn(undefined)
        expect(isEMap(map)).toBeTruthy()

        const primitives = [42, "string", true, false, null, undefined, Symbol("sym"), 100n]
        for (const p of primitives) {
            expect(isEMap(p as any)).toBe(false)
        }
    })
})
