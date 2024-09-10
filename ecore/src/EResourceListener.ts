import { EObject } from "./internal.js"

export interface EResourceListener {
    attached(object: EObject): void
    detached(object: EObject): void
}