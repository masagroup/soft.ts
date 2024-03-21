import { Uuid4 } from "id128"

export const EXT_UUID = 2

export const uuidExtension = {
    type: EXT_UUID,
    encode: encodeUUIDExtension,
    decode: decodeUUIDExtension,
}

export function encodeUUIDExtension(object: unknown): Uint8Array | null {
    return object instanceof Uuid4.type ? object.bytes : null
}

export function decodeUUIDExtension(data: Uint8Array): Uuid4 {
    return Uuid4.construct(data)
}
