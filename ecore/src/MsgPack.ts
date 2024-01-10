export const UINT32_MAX = 0xffff_ffff;

export const PosFixedNumHigh = 0x7f;
export const NegFixedNumLow = 0xe0;

export const Nil = 0xc0;

export const False = 0xc2;
export const True = 0xc3;

export const Float = 0xca;
export const Double = 0xcb;

export const Uint8 = 0xcc;
export const Uint16 = 0xcd;
export const Uint32 = 0xce;
export const Uint64 = 0xcf;

export const Int8 = 0xd0;
export const Int16 = 0xd1;
export const Int32 = 0xd2;
export const Int64 = 0xd3;

export const FixedStrLow = 0xa0;
export const FixedStrHigh = 0xbf;
export const FixedStrMask = 0x1f;
export const Str8 = 0xd9;
export const Str16 = 0xda;
export const Str32 = 0xdb;

export const Bin8 = 0xc4;
export const Bin16 = 0xc5;
export const Bin32 = 0xc6;

export const FixedArrayLow = 0x90;
export const FixedArrayHigh = 0x9f;
export const FixedArrayMask = 0xf;
export const Array16 = 0xdc;
export const Array32 = 0xdd;

export const FixedMapLow = 0x80;
export const FixedMapHigh = 0x8f;
export const FixedMapMask = 0xf;
export const Map16 = 0xde;
export const Map32 = 0xdf;

export const FixExt1 = 0xd4;
export const FixExt2 = 0xd5;
export const FixExt4 = 0xd6;
export const FixExt8 = 0xd7;
export const FixExt16 = 0xd8;
export const Ext8 = 0xc7;
export const Ext16 = 0xc8;
export const Ext32 = 0xc9;

export function isFixedNum(c: number): boolean {
    return c <= PosFixedNumHigh || c >= NegFixedNumLow;
}

export function isFixedMap(c: number): boolean {
    return c >= FixedMapLow && c <= FixedMapHigh;
}

export function isFixedArray(c: number): boolean {
    return c >= FixedArrayLow && c <= FixedArrayHigh;
}

export function isFixedString(c: number): boolean {
    return c >= FixedStrLow && c <= FixedStrHigh;
}

export function isString(c: number): boolean {
    return isFixedString(c) || c == Str8 || c == Str16 || c == Str32;
}

export function isBin(c: number): boolean {
    return c == Bin8 || c == Bin16 || c == Bin32;
}

export function isFixedExt(c: number): boolean {
    return c >= FixExt1 && c <= FixExt16;
}

export function isExt(c: number): boolean {
    return isFixedExt(c) || c == Ext8 || c == Ext16 || c == Ext32;
}

const TEXT_ENCODING_AVAILABLE =
    (typeof process === "undefined" || process?.env?.["TEXT_ENCODING"] !== "never") &&
    typeof TextEncoder !== "undefined" &&
    typeof TextDecoder !== "undefined";

export function utf8Count(str: string): number {
    const strLength = str.length;

    let byteLength = 0;
    let pos = 0;
    while (pos < strLength) {
        let value = str.charCodeAt(pos++);

        if ((value & 0xffffff80) === 0) {
            // 1-byte
            byteLength++;
            continue;
        } else if ((value & 0xfffff800) === 0) {
            // 2-bytes
            byteLength += 2;
        } else {
            // handle surrogate pair
            if (value >= 0xd800 && value <= 0xdbff) {
                // high surrogate
                if (pos < strLength) {
                    const extra = str.charCodeAt(pos);
                    if ((extra & 0xfc00) === 0xdc00) {
                        ++pos;
                        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                    }
                }
            }

            if ((value & 0xffff0000) === 0) {
                // 3-byte
                byteLength += 3;
            } else {
                // 4-byte
                byteLength += 4;
            }
        }
    }
    return byteLength;
}

export function utf8EncodeJs(str: string, output: Uint8Array, outputOffset: number): void {
    const strLength = str.length;
    let offset = outputOffset;
    let pos = 0;
    while (pos < strLength) {
        let value = str.charCodeAt(pos++);

        if ((value & 0xffffff80) === 0) {
            // 1-byte
            output[offset++] = value;
            continue;
        } else if ((value & 0xfffff800) === 0) {
            // 2-bytes
            output[offset++] = ((value >> 6) & 0x1f) | 0xc0;
        } else {
            // handle surrogate pair
            if (value >= 0xd800 && value <= 0xdbff) {
                // high surrogate
                if (pos < strLength) {
                    const extra = str.charCodeAt(pos);
                    if ((extra & 0xfc00) === 0xdc00) {
                        ++pos;
                        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                    }
                }
            }

            if ((value & 0xffff0000) === 0) {
                // 3-byte
                output[offset++] = ((value >> 12) & 0x0f) | 0xe0;
                output[offset++] = ((value >> 6) & 0x3f) | 0x80;
            } else {
                // 4-byte
                output[offset++] = ((value >> 18) & 0x07) | 0xf0;
                output[offset++] = ((value >> 12) & 0x3f) | 0x80;
                output[offset++] = ((value >> 6) & 0x3f) | 0x80;
            }
        }

        output[offset++] = (value & 0x3f) | 0x80;
    }
}

const sharedTextEncoder = TEXT_ENCODING_AVAILABLE ? new TextEncoder() : undefined;
export const TEXT_ENCODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE
    ? UINT32_MAX
    : typeof process !== "undefined" && process?.env?.["TEXT_ENCODING"] !== "force"
      ? 200
      : 0;

function utf8EncodeTEencode(str: string, output: Uint8Array, outputOffset: number): void {
    output.set(sharedTextEncoder!.encode(str), outputOffset);
}

function utf8EncodeTEencodeInto(str: string, output: Uint8Array, outputOffset: number): void {
    sharedTextEncoder!.encodeInto(str, output.subarray(outputOffset));
}

export const utf8EncodeTE = sharedTextEncoder?.encodeInto ? utf8EncodeTEencodeInto : utf8EncodeTEencode;

const CHUNK_SIZE = 0x1_000;

export function utf8DecodeJs(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
    let offset = inputOffset;
    const end = offset + byteLength;

    const units: Array<number> = [];
    let result = "";
    while (offset < end) {
        const byte1 = bytes[offset++]!;
        if ((byte1 & 0x80) === 0) {
            // 1 byte
            units.push(byte1);
        } else if ((byte1 & 0xe0) === 0xc0) {
            // 2 bytes
            const byte2 = bytes[offset++]! & 0x3f;
            units.push(((byte1 & 0x1f) << 6) | byte2);
        } else if ((byte1 & 0xf0) === 0xe0) {
            // 3 bytes
            const byte2 = bytes[offset++]! & 0x3f;
            const byte3 = bytes[offset++]! & 0x3f;
            units.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
        } else if ((byte1 & 0xf8) === 0xf0) {
            // 4 bytes
            const byte2 = bytes[offset++]! & 0x3f;
            const byte3 = bytes[offset++]! & 0x3f;
            const byte4 = bytes[offset++]! & 0x3f;
            let unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
            if (unit > 0xffff) {
                unit -= 0x10000;
                units.push(((unit >>> 10) & 0x3ff) | 0xd800);
                unit = 0xdc00 | (unit & 0x3ff);
            }
            units.push(unit);
        } else {
            units.push(byte1);
        }

        if (units.length >= CHUNK_SIZE) {
            result += String.fromCharCode(...units);
            units.length = 0;
        }
    }

    if (units.length > 0) {
        result += String.fromCharCode(...units);
    }

    return result;
}

const sharedTextDecoder = TEXT_ENCODING_AVAILABLE ? new TextDecoder() : null;
export const TEXT_DECODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE
    ? UINT32_MAX
    : typeof process !== "undefined" && process?.env?.["TEXT_DECODER"] !== "force"
      ? 200
      : 0;

export function utf8DecodeTD(bytes: Uint8Array, inputOffset: number, byteLength: number): string {
    const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
    return sharedTextDecoder!.decode(stringBytes);
}
