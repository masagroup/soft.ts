import { EResource } from "./EResource";
import { EDecoder } from "./EDecoder";
import { EEncoder } from "./EEncoder";

export interface ECodec {
    newEncoder(eContext: EResource, options?: Map<string, any>): EEncoder;
    newDecoder(eContext: EResource, options?: Map<string, any>): EDecoder;
}
