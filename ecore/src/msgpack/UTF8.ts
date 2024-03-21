export const UINT32_MAX = 0xffff_ffff

const TEXT_ENCODING_AVAILABLE =
    (typeof process === "undefined" || process?.env?.["TEXT_ENCODING"] !== "never") &&
    typeof TextEncoder !== "undefined" &&
    typeof TextDecoder !== "undefined"

export function utf8Count(str: string): number {
    const strLength = str.length

    let byteLength = 0
    let pos = 0
    while (pos < strLength) {
        let value = str.charCodeAt(pos++)

        if ((value & 0xffffff80) === 0) {
            // 1-byte
            byteLength++
            continue
        } else if ((value & 0xfffff800) === 0) {
            // 2-bytes
            byteLength += 2
        } else {
            // handle surrogate pair
            if (value >= 0xd800 && value <= 0xdbff) {
                // high surrogate
                if (pos < strLength) {
                    const extra = str.charCodeAt(pos)
                    if ((extra & 0xfc00) === 0xdc00) {
                        ++pos
                        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000
                    }
                }
            }

            if ((value & 0xffff0000) === 0) {
                // 3-byte
                byteLength += 3
            } else {
                // 4-byte
                byteLength += 4
            }
        }
    }
    return byteLength
}

export function utf8EncodeJs(str: string, output: Uint8Array, outputOffset: number): void {
    const strLength = str.length
    let offset = outputOffset
    let pos = 0
    while (pos < strLength) {
        let value = str.charCodeAt(pos++)

        if ((value & 0xffffff80) === 0) {
            // 1-byte
            output[offset++] = value
            continue
        } else if ((value & 0xfffff800) === 0) {
            // 2-bytes
            output[offset++] = ((value >> 6) & 0x1f) | 0xc0
        } else {
            // handle surrogate pair
            if (value >= 0xd800 && value <= 0xdbff) {
                // high surrogate
                if (pos < strLength) {
                    const extra = str.charCodeAt(pos)
                    if ((extra & 0xfc00) === 0xdc00) {
                        ++pos
                        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000
                    }
                }
            }

            if ((value & 0xffff0000) === 0) {
                // 3-byte
                output[offset++] = ((value >> 12) & 0x0f) | 0xe0
                output[offset++] = ((value >> 6) & 0x3f) | 0x80
            } else {
                // 4-byte
                output[offset++] = ((value >> 18) & 0x07) | 0xf0
                output[offset++] = ((value >> 12) & 0x3f) | 0x80
                output[offset++] = ((value >> 6) & 0x3f) | 0x80
            }
        }

        output[offset++] = (value & 0x3f) | 0x80
    }
}

const sharedTextEncoder = TEXT_ENCODING_AVAILABLE ? new TextEncoder() : undefined
export const TEXT_ENCODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE
    ? UINT32_MAX
    : typeof process !== "undefined" && process?.env?.["TEXT_ENCODING"] !== "force"
      ? 200
      : 0

function utf8EncodeTEencode(str: string, output: Uint8Array, outputOffset: number): void {
    output.set(sharedTextEncoder!.encode(str), outputOffset)
}

function utf8EncodeTEencodeInto(str: string, output: Uint8Array, outputOffset: number): void {
    sharedTextEncoder!.encodeInto(str, output.subarray(outputOffset))
}

export const utf8EncodeTE = sharedTextEncoder?.encodeInto ? utf8EncodeTEencodeInto : utf8EncodeTEencode

const CHUNK_SIZE = 0x1_000

export function utf8DecodeJs(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
    let offset = inputOffset
    const end = offset + byteLength

    const units: Array<number> = []
    let result = ""
    while (offset < end) {
        const byte1 = bytes[offset++]!
        if ((byte1 & 0x80) === 0) {
            // 1 byte
            units.push(byte1)
        } else if ((byte1 & 0xe0) === 0xc0) {
            // 2 bytes
            const byte2 = bytes[offset++]! & 0x3f
            units.push(((byte1 & 0x1f) << 6) | byte2)
        } else if ((byte1 & 0xf0) === 0xe0) {
            // 3 bytes
            const byte2 = bytes[offset++]! & 0x3f
            const byte3 = bytes[offset++]! & 0x3f
            units.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3)
        } else if ((byte1 & 0xf8) === 0xf0) {
            // 4 bytes
            const byte2 = bytes[offset++]! & 0x3f
            const byte3 = bytes[offset++]! & 0x3f
            const byte4 = bytes[offset++]! & 0x3f
            let unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4
            if (unit > 0xffff) {
                unit -= 0x10000
                units.push(((unit >>> 10) & 0x3ff) | 0xd800)
                unit = 0xdc00 | (unit & 0x3ff)
            }
            units.push(unit)
        } else {
            units.push(byte1)
        }

        if (units.length >= CHUNK_SIZE) {
            result += String.fromCharCode(...units)
            units.length = 0
        }
    }

    if (units.length > 0) {
        result += String.fromCharCode(...units)
    }

    return result
}

const sharedTextDecoder = TEXT_ENCODING_AVAILABLE ? new TextDecoder() : null
export const TEXT_DECODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE
    ? UINT32_MAX
    : typeof process !== "undefined" && process?.env?.["TEXT_DECODER"] !== "force"
      ? 200
      : 0

export function utf8DecodeTD(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
    const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength)
    return sharedTextDecoder!.decode(stringBytes)
}

export function utf8Decode(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
    if (byteLength > TEXT_DECODER_THRESHOLD) {
        return utf8DecodeTD(bytes, inputOffset, byteLength)
    } else {
        return utf8DecodeJs(bytes, inputOffset, byteLength)
    }
}

export function utf8Encode(str: string, output: Uint8Array, outputOffset: number): void {
    if (str.length > TEXT_ENCODER_THRESHOLD) {
        utf8EncodeTE(str, output, outputOffset)
    } else {
        utf8EncodeJs(str, output, outputOffset)
    }
}
