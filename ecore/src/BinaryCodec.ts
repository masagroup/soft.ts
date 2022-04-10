import { BinaryDecoder } from "./BinaryDecoder";
import { BinaryEncoder } from "./BinaryEncoder";
import { EResource } from "./EResource";
import { EResourceCodec } from "./EResourceCodec";
import { EResourceDecoder } from "./EResourceDecoder";
import { EResourceEncoder } from "./EResourceEncoder";

export class BinaryCodec implements EResourceCodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EResourceEncoder {
        return new BinaryEncoder(eContext,options);
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EResourceDecoder {
        return new BinaryDecoder(eContext,options);
    }
}
