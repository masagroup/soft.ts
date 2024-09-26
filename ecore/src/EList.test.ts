import { describe, expect, test } from "vitest";
import { EList, isEList } from "./EList.js";
import { anyNumber, instance, mock, when } from "ts-mockito";

describe('EList', () => {
    test('isEList', () => {
        var a : any
        expect(isEList(a)).toBeFalsy()

        const mockList = mock<EList<any>>()
        const list = instance(mockList)
        when(mockList.moveTo(anyNumber(),anyNumber())).thenReturn(undefined)
        expect(isEList(list)).toBeTruthy()
    });
});