import { EObject } from "./EObject";
import { EResource } from "./EResource";

export interface EResourceDecoder {
    decode( buffer : ArrayLike<number> | BufferSource ) :  EResource
    decodeObject( buffer : ArrayLike<number> | BufferSource ) : EObject
}