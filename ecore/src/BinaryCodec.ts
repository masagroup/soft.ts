import { BinaryDecoder } from "./BinaryDecoder.js"
import { BinaryEncoder } from "./BinaryEncoder.js"
import { EResource } from "./EResource.js"
import { ECodec } from "./ECodec.js"
import { EDecoder } from "./EDecoder.js"
import { EEncoder } from "./EEncoder.js"

export class BinaryOptions {
    static BINARY_OPTION_ID_ATTRIBUTE = "ID_ATTRIBUTE" // if true, save id attribute of the object
}

export class BinaryCodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new BinaryEncoder(eContext, options)
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new BinaryDecoder(eContext, options)
    }
}
