import { createDataView, ensureUint8Array } from "../utils/TypedArray.js"
import { utf8Decode } from "../utils/UTF8.js"
import { ExtensionCodec, ExtensionCodecType } from "./Extension.js"
import * as Types from "./Types.js"

function prettyByte(byte: number): string {
    return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`
}

function uncomplement(val: number, bitwidth: number) {
    var isnegative = val & (1 << (bitwidth - 1))
    var boundary = 1 << bitwidth
    var minval = -boundary
    var mask = boundary - 1
    return isnegative ? minval + (val & mask) : val
}

export type DecoderOptions = Partial<
    Readonly<{
        extensionCodec: ExtensionCodecType
    }>
>

export class Decoder {
    private readonly _extensionCodec: ExtensionCodecType

    private _pos: number
    private _view: DataView
    private _bytes: Uint8Array

    constructor(buffer: ArrayLike<number> | BufferSource, options?: DecoderOptions) {
        this._extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec
        this._bytes = ensureUint8Array(buffer)
        this._view = createDataView(this._bytes)
        this._pos = 0
    }

    decode(): unknown {
        let code = this.readU8()
        if (Types.isFixedNum(code)) {
            return code
        }
        if (Types.isFixedString(code)) {
            return this.string(code)
        }

        switch (code) {
            case Types.Nil:
                return null
            case Types.False:
            case Types.True:
                return this.bool(code)
            case Types.Float:
            case Types.Double:
            case Types.Uint8:
            case Types.Uint16:
            case Types.Uint32:
            case Types.Uint64:
            case Types.Int8:
            case Types.Int16:
            case Types.Int32:
            case Types.Int64:
                return this.number(code)
            case Types.Bin8:
            case Types.Bin16:
            case Types.Bin32:
                return this.bytes(code)
            case Types.Str8:
            case Types.Str16:
            case Types.Str32:
                return this.string(code)
            case Types.FixExt1:
            case Types.FixExt2:
            case Types.FixExt4:
            case Types.FixExt8:
            case Types.FixExt16:
            case Types.Ext8:
            case Types.Ext16:
            case Types.Ext32:
                return this.decodeExt(code)
        }
        throw new Error(`Unrecognized type byte: ${prettyByte(code)} decoding any`)
    }

    decodeBoolean(): boolean {
        let code = this.readU8()
        return this.bool(code)
    }

    private bool(code: number): boolean {
        switch (code) {
            case Types.True:
                return true
            case Types.False:
                return false
        }
        throw new Error(`Unrecognized type byte: ${prettyByte(code)}`)
    }

    decodeNumber(): number {
        let code = this.readU8()
        return this.number(code)
    }

    private number(code: number): number {
        if (code === Types.Nil) {
            return 0
        }
        if (Types.isFixedNum(code)) {
            return uncomplement(code, 8)
        }
        switch (code) {
            case Types.Uint8:
                return this.readU8()
            case Types.Int8:
                return this.readI8()
            case Types.Uint16:
                return this.readU16()
            case Types.Int16:
                return this.readI16()
            case Types.Uint32:
                return this.readU32()
            case Types.Int32:
                return this.readI32()
            case Types.Uint64:
                return this.readU64()
            case Types.Int64:
                return this.readI64()
            case Types.Float:
                return this.readF32()
            case Types.Double:
                return this.readF64()
        }
        throw new Error(`Unrecognized type byte: ${prettyByte(code)}`)
    }

    decodeString(): string {
        let code = this.readU8()
        return this.string(code)
    }

    private string(code: number): string {
        let len = this.bytesLen(code)
        let str = ""
        if (len > 0) {
            str = utf8Decode(this._bytes, this._pos, len)
        }
        this._pos += len
        return str
    }

    decodeBinary(): Uint8Array {
        let code = this.readU8()
        return this.bytes(code)
    }

    private bytes(code: number): Uint8Array {
        let len = this.bytesLen(code)
        let bytes = this._bytes.subarray(this._pos, this._pos + len)
        this._pos += len
        return bytes
    }

    private bytesLen(c: number): number {
        if (c == Types.Nil) {
            return -1
        }

        if (Types.isFixedString(c)) {
            return c & Types.FixedStrMask
        }

        switch (c) {
            case Types.Str8:
            case Types.Bin8:
                return this.readU8()
            case Types.Str16:
            case Types.Bin16:
                return this.readU16()
            case Types.Str32:
            case Types.Bin32:
                return this.readU32()
        }
        throw new Error(`invalid code type byte: ${prettyByte(c)} decoding string/bytes length`)
    }

    private decodeExt(c: number) {
        let extLen = this.parseExtLen(c)
        let extID = this.readI8()
        const data = this._bytes.subarray(this._pos, this._pos + extLen)
        this._pos += extLen
        return this._extensionCodec.decode(data, extID)
    }

    private parseExtLen(c: number): number {
        switch (c) {
            case Types.FixExt1:
                return 1
            case Types.FixExt2:
                return 2
            case Types.FixExt4:
                return 4
            case Types.FixExt8:
                return 8
            case Types.FixExt16:
                return 16
            case Types.Ext8:
                return this.readU8()
            case Types.Ext16:
                return this.readU16()
            case Types.Ext32:
                return this.readU32()
            default:
                return 0
        }
    }

    private readU8(): number {
        const value = this._view.getUint8(this._pos)
        this._pos++
        return value
    }

    private readI8(): number {
        const value = this._view.getInt8(this._pos)
        this._pos++
        return value
    }

    private readU16(): number {
        const value = this._view.getUint16(this._pos)
        this._pos += 2
        return value
    }

    private readI16(): number {
        const value = this._view.getInt16(this._pos)
        this._pos += 2
        return value
    }

    private readU32(): number {
        const value = this._view.getUint32(this._pos)
        this._pos += 4
        return value
    }

    private readI32(): number {
        const value = this._view.getInt32(this._pos)
        this._pos += 4
        return value
    }

    private readU64(): number {
        const high = this._view.getUint32(this._pos)
        const low = this._view.getUint32(this._pos + 4)
        const value = high * 0x1_0000_0000 + low
        this._pos += 8
        return value
    }

    private readI64(): number {
        const high = this._view.getInt32(this._pos)
        const low = this._view.getUint32(this._pos + 4)
        const value = high * 0x1_0000_0000 + low
        this._pos += 8
        return value
    }

    private readF32(): number {
        const value = this._view.getFloat32(this._pos)
        this._pos += 4
        return value
    }

    private readF64(): number {
        const value = this._view.getFloat64(this._pos)
        this._pos += 8
        return value
    }
}
