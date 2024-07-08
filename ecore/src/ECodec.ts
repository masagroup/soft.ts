import { EResource } from "./EResource.js"
import { EDecoder } from "./EDecoder.js"
import { EEncoder } from "./EEncoder.js"

export interface ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder
}
