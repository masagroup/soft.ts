import id128 from "id128"

export const EXT_ULID = 1

export const ulidExtension = {
    type: EXT_ULID,
    encode: encodeULIDExtension,
    decode: decodeULIDExtension
}

export function encodeULIDExtension(object: unknown): Uint8Array | null {
    return object instanceof id128.Ulid.type ? object.bytes : null
}

export function decodeULIDExtension(data: Uint8Array): id128.Ulid {
    return id128.Ulid.construct(data)
}
