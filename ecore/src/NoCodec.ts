import { EResource } from "./EResource";
import { EResourceCodec } from "./EResourceCodec";
import { EResourceDecoder } from "./EResourceDecoder";
import { EResourceEncoder } from "./EResourceEncoder";

export class NoCodec implements EResourceCodec {

    newEncoder(eContext: EResource, options?: Map<string, any>): EResourceEncoder {
        return null;
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EResourceDecoder {
        return null;
    }

}