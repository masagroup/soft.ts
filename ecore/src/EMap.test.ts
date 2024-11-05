import { anyNumber, instance, mock, when } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { EMap, isEMap } from "./EMap.js"

describe("EMap", () => {
    test("isEMap", () => {
        var a: any
        expect(isEMap(a)).toBeFalsy()

        const mockMap = mock<EMap<any,any>>()
        const map = instance(mockMap)
        when(mockMap.moveTo(anyNumber(), anyNumber())).thenReturn(undefined)
        when(mockMap.put(anyNumber(), anyNumber())).thenReturn(undefined)
        expect(isEMap(map)).toBeTruthy()
    })
})