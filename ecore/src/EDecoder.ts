import { EObject } from "./EObject"
import { EResource } from "./EResource"
import * as fs from "fs"
import { Result } from "ts-results-es"

export interface EDecoder {
    decode(buffer: BufferSource): Result<EResource, Error>
    decodeObject(buffer: BufferSource): Result<EObject, Error>

    decodeAsync(stream: fs.ReadStream): Promise<EResource>
    decodeObjectAsync(stream: fs.ReadStream): Promise<EObject>
}
