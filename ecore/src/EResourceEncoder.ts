import { EObject } from "./EObject";
import { EResource } from "./EResource";
import * as fs from "fs";
import { Result } from "ts-results";

export interface EResourceEncoder {
    encode(eResource: EResource): Result<Uint8Array, Error>;
    encodeObject(eObject: EObject): Result<Uint8Array, Error>;

    encodeAsync(eResource: EResource, s: fs.WriteStream): Promise<Result<Uint8Array, Error>>;
    encodeObjectAsync(eObject: EObject, s: fs.WriteStream): Promise<Result<Uint8Array, Error>>;
}
