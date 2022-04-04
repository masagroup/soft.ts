import { EObject } from "./EObject"
import { EResource } from "./EResource"

export interface EResourceEncoder {
    encode(eResource : EResource) : Uint8Array
    encodeObject(eObject : EObject) : Uint8Array
}