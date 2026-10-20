// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { Ok } from "ts-results-es"
import { describe, expect, test } from "vitest"
import { ECodec, ECodecRegistry, EDecoder, EEncoder, EResource, EResourceSetImpl, URI } from "./internal.js"

// a resource whose codec is codec
function newResource(codec: ECodec): EResource {
    const rs = new EResourceSetImpl()
    rs.setCodecRegistry({ getCodec: () => codec } as unknown as ECodecRegistry)
    return rs.createResource(new URI("test.t"))
}

describe("EResourceImpl load and save", () => {
    test("saveToString options", () => {
        let encoderOptions: Map<string, any> = undefined
        const codec: ECodec = {
            newEncoder(_: EResource, options?: Map<string, any>): EEncoder {
                encoderOptions = options
                return { encode: () => Ok(new Uint8Array([104, 105])) } as unknown as EEncoder
            },
            newDecoder(): EDecoder {
                return null
            }
        }
        const r = newResource(codec)
        const options = new Map<string, any>([["key", "value"]])
        expect(r.saveToString(options)).toBe("hi")
        expect(encoderOptions).toBe(options)
    })

    test("loadFromBuffer error resets loading", () => {
        const codec: ECodec = {
            newEncoder(): EEncoder {
                return null
            },
            newDecoder(): EDecoder {
                return {
                    decode: () => {
                        throw new Error("decode error")
                    }
                } as unknown as EDecoder
            }
        }
        const r = newResource(codec)
        expect(() => r.loadFromBuffer(new Uint8Array([1]))).toThrow("decode error")
        expect(r.isLoading()).toBeFalsy()
    })
})
