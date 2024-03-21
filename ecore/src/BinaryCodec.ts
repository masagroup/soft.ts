import { BinaryDecoder } from "./BinaryDecoder"
import { BinaryEncoder } from "./BinaryEncoder"
import { EResource } from "./EResource"
import { ECodec } from "./ECodec"
import { EDecoder } from "./EDecoder"
import { EEncoder } from "./EEncoder"

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
