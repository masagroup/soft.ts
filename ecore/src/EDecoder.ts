import { EObject } from "./EObject.js"
import { EResource } from "./EResource.js"
import * as fs from "fs"
import { Result } from "ts-results-es"

export interface EDecoder {
    decode(buffer: BufferSource): Result<EResource, Error>
    decodeObject(buffer: BufferSource): Result<EObject, Error>

    decodeAsync(stream: fs.ReadStream): Promise<EResource>
    decodeObjectAsync(stream: fs.ReadStream): Promise<EObject>
}
