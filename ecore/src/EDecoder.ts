
import { Result } from "ts-results-es"
import { EObject } from "./EObject.js"
import { EResource } from "./EResource.js"
import { BufferLike, ReadableStreamLike } from "./Buffer.js"

export interface EDecoder {
    decode(buffer: BufferLike): Result<EResource, Error>
    decodeObject(buffer: BufferLike): Result<EObject, Error>

    decodeAsync(stream: ReadableStreamLike<BufferLike>): Promise<EResource>
    decodeObjectAsync(stream: ReadableStreamLike<BufferLike>): Promise<EObject>
}
