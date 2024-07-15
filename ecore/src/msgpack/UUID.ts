import id128 from "id128"

export const EXT_UUID = 2

export const uuidExtension = {
    type: EXT_UUID,
    encode: encodeUUIDExtension,
    decode: decodeUUIDExtension
}

export function encodeUUIDExtension(object: unknown): Uint8Array | null {
    return object instanceof id128.Uuid4.type ? object.bytes : null
}

export function decodeUUIDExtension(data: Uint8Array): id128.Uuid4 {
    return id128.Uuid4.construct(data)
}
