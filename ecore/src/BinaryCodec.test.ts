import { mock } from "ts-mockito"
import { describe, expect, test } from "vitest"
import { BinaryCodec, EResource } from "./internal.js"

describe("BinaryCodec", () => {
    test("newEncoder", () => {
        const c = new BinaryCodec()
        const resource = mock<EResource>()
        const d = c.newDecoder(resource, null)
        expect(d).not.toBeNull()
    })

    test("newDecoder", () => {
        const c = new BinaryCodec()
        const resource = mock<EResource>()
        const d = c.newEncoder(resource, null)
        expect(d).not.toBeNull()
    })
})
