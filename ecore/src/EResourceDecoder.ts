import { EObject } from "./EObject";
import { EResource } from "./EResource";
import * as fs from "fs";
import { Result } from "ts-results";

export interface EResourceDecoder {
    decode(buffer: BufferSource): Result<EResource, Error>;
    decodeObject(buffer: BufferSource): Result<EObject, Error>;

    decodeAsync(stream: fs.ReadStream): Promise<Result<EResource, Error>>;
    decodeObjectAsync(stream: fs.ReadStream): Promise<Result<EObject, Error>>;
}
