import { ECodec } from "./ECodec.js"
import { EDecoder } from "./EDecoder.js"
import { EEncoder } from "./EEncoder.js"
import { EResource } from "./EResource.js"

export class NoCodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return null
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return null
    }
}
