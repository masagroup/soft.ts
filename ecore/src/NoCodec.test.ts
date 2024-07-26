import { describe, expect, test } from "vitest"
import { NoCodec } from "./NoCodec.js"

describe("NoCoder", () => {
    test("newEncoder", () => {
        const codec = new NoCodec()
        const e = codec.newEncoder(null)
        expect(e).toBeNull()
    })

    test("newDecoder", () => {
        const codec = new NoCodec()
        const d = codec.newDecoder(null)
        expect(d).toBeNull()
    })
})
