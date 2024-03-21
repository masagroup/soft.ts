import { EResource } from "./EResource"
import { ECodec } from "./ECodec"
import { EDecoder } from "./EDecoder"
import { EEncoder } from "./EEncoder"

export class NoCodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return null
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return null
    }
}
