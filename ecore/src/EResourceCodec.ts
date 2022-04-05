import { EResource } from "./EResource";
import { EResourceDecoder } from "./EResourceDecoder";
import { EResourceEncoder } from "./EResourceEncoder";

export interface EResourceCodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EResourceEncoder;
    newDecoder(eContext: EResource, options?: Map<string, any>): EResourceDecoder;
}
