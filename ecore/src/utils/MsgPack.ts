
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

