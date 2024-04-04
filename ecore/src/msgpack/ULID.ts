import { Ulid } from "id128"

export const EXT_ULID = 1

export const ulidExtension = {
    type: EXT_ULID,
    encode: encodeULIDExtension,
    decode: decodeULIDExtension
}

export function encodeULIDExtension(object: unknown): Uint8Array | null {
    return object instanceof Ulid.type ? object.bytes : null
}

export function decodeULIDExtension(data: Uint8Array): Ulid {
    return Ulid.construct(data)
}
