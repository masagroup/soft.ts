import { WriteStream } from "fs";
import { Result } from "ts-results";
import { EObject } from "./EObject";
import { EResource } from "./EResource";
import { EResourceEncoder } from "./EResourceEncoder";


export class BinaryEncoder implements EResourceEncoder {
    private _resource : EResource;

    constructor(eContext: EResource, options: Map<string, any>) {
        this._resource = eContext;
    }

    encode(eResource: EResource): Result<Uint8Array, Error> {
        throw new Error("Method not implemented.");
    }
    encodeObject(eObject: EObject): Result<Uint8Array, Error> {
        throw new Error("Method not implemented.");
    }
    encodeAsync(eResource: EResource, s: WriteStream): Promise<Result<Uint8Array, Error>> {
        throw new Error("Method not implemented.");
    }
    encodeObjectAsync(eObject: EObject, s: WriteStream): Promise<Result<Uint8Array, Error>> {
        throw new Error("Method not implemented.");
    }

}