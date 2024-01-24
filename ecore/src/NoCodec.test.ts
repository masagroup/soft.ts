import { NoCodec } from "./NoCodec"

describe("NoCoder", () => {
    test("newEncoder", () => {
        let codec = new NoCodec()
        let e = codec.newEncoder(null)
        expect(e).toBeNull()
    })

    test("newDecoder", () => {
        let codec = new NoCodec()
        let d = codec.newDecoder(null)
        expect(d).toBeNull()
    })
})
