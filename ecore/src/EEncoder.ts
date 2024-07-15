import fs from "fs"
import { Result } from "ts-results-es"
import { EObject } from "./EObject.js"
import { EResource } from "./EResource.js"

export interface EEncoder {
    encode(eResource: EResource): Result<Uint8Array, Error>
    encodeObject(eObject: EObject): Result<Uint8Array, Error>

    encodeAsync(eResource: EResource, s: fs.WriteStream): Promise<Uint8Array>
    encodeObjectAsync(eObject: EObject, s: fs.WriteStream): Promise<Uint8Array>
}
