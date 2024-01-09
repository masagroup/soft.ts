import { BinaryDecoder } from "./BinaryDecoder";
import { BinaryEncoder } from "./BinaryEncoder";
import { EResource } from "./EResource";
import { ECodec } from "./ECodec";
import { EDecoder } from "./EDecoder";
import { EEncoder } from "./EEncoder";

export class BinaryCodec implements ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder {
        return new BinaryEncoder(eContext, options);
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder {
        return new BinaryDecoder(eContext, options);
    }
}
