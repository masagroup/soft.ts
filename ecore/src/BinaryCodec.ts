import { EResource } from "./EResource";
import { EResourceCodec } from "./EResourceCodec";
import { EResourceDecoder } from "./EResourceDecoder";
import { EResourceEncoder } from "./EResourceEncoder";

export class BinaryCodec implements EResourceCodec {

    newEncoder(eContext: EResource, options?: Map<string, any>): EResourceEncoder {
        throw new Error("Method not implemented.");
    }
    newDecoder(eContext: EResource, options?: Map<string, any>): EResourceDecoder {
        throw new Error("Method not implemented.");
    }

}