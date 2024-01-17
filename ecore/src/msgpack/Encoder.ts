import { ExtData, ExtensionCodec, ExtensionCodecType } from "./Extension";
import { setInt64, setUint64 } from "./Int";
import { ensureUint8Array } from "./TypedArray";
import * as Types from "./Types"
import { utf8Count, utf8Encode } from "./UTF8";

export const DEFAULT_INITIAL_BUFFER_SIZE = 2048;

export type EncoderOptions = Partial<
    Readonly<{
        extensionCodec: ExtensionCodecType;

        /**
        * The initial size of the internal buffer.
        *
        * Defaults to 2048.
        */
        initialBufferSize: number;
    }>
>;

export class Encoder {
    private readonly _extensionCodec: ExtensionCodecType;
    private readonly _initialBufferSize: number;
    private _pos: number;
    private _view: DataView;
    private _bytes: Uint8Array;

    constructor(options?: EncoderOptions) {
        this._extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec;
        this._initialBufferSize = options?.initialBufferSize ?? DEFAULT_INITIAL_BUFFER_SIZE;
        this._pos = 0;
        this._view = new DataView(new ArrayBuffer(this._initialBufferSize));
        this._bytes = new Uint8Array(this._view.buffer);
    }

    bytes(): Uint8Array {
        return this._bytes.subarray(0, this._pos)
    }

    encode(object: unknown) {
        if (object == null) {
            this.encodeNil();
        } else if (typeof object === "boolean") {
            this.encodeBoolean(object)
        } else if (typeof object === "number") {
            this.encodeNumber(object)
        } else if (typeof object === "string") {
            this.encodeString(object)
        } else {
            this.encodeObject(object);
        }
    }

    encodeNil() {
        this.writeU8(Types.Nil);
    }

    encodeBoolean(object: boolean) {
        if (object === false) {
            this.writeU8(Types.False);
        } else {
            this.writeU8(Types.True);
        }
    }

    encodeNumber(object: number) {
        if (Number.isSafeInteger(object)) {
            if (object >= 0) {
                if (object < 0x80) {
                    // positive fixint
                    this.writeU8(object);
                } else if (object < 0x100) {
                    // uint 8
                    this.writeU8(Types.Uint8);
                    this.writeU8(object);
                } else if (object < 0x10000) {
                    // uint 16
                    this.writeU8(Types.Uint16);
                    this.writeU16(object);
                } else if (object < 0x100000000) {
                    // uint 32
                    this.writeU8(Types.Uint32);
                    this.writeU32(object);
                } else {
                    // uint 64
                    this.writeU8(Types.Uint64);
                    this.writeU64(object);
                }
            } else {
                if (object >= -0x20) {
                    // negative fixint
                    this.writeU8(Types.NegFixedNumLow | (object + 0x20));
                } else if (object >= -0x80) {
                    // int 8
                    this.writeU8(Types.Int8);
                    this.writeI8(object);
                } else if (object >= -0x8000) {
                    // int 16
                    this.writeU8(Types.Int16);
                    this.writeI16(object);
                } else if (object >= -0x80000000) {
                    // int 32
                    this.writeU8(Types.Int32);
                    this.writeI32(object);
                } else {
                    // int 64
                    this.writeU8(Types.Int64);
                    this.writeI64(object);
                }
            }
        } else {
            // float 64
            this.writeU8(Types.Double)
            this.writeF64(object)
        }
    }

    encodeBinary(object: ArrayBufferView) {
        const size = object.byteLength;
        if (size < 0x100) {
            // bin 8
            this.writeU8(0xc4);
            this.writeU8(size);
        } else if (size < 0x10000) {
            // bin 16
            this.writeU8(0xc5);
            this.writeU16(size);
        } else if (size < 0x100000000) {
            // bin 32
            this.writeU8(0xc6);
            this.writeU32(size);
        } else {
            throw new Error(`Too large binary: ${size}`);
        }
        const bytes = ensureUint8Array(object);
        this.writeU8a(bytes);
    }

    encodeString(object: string) {
        const maxHeaderSize = 1 + 4
        const byteLength = utf8Count(object)
        this.ensureBufferSizeToWrite(maxHeaderSize + byteLength)
        this.writeStringHeader(byteLength)
        utf8Encode(object, this._bytes, this._pos)
        this._pos += byteLength
    }

    private encodeObject(object: unknown) {
        // try to encode objects with custom codec first of non-primitives
        const ext = this._extensionCodec.tryToEncode(object);
        if (ext != null) {
            this.encodeExtension(ext);
        } else if (ArrayBuffer.isView(object)) {
            this.encodeBinary(object);
        } else {
            // symbol, function and other special object come here unless extensionCodec handles them.
            throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
        }
    }

    private encodeExtension(ext: ExtData) {
        let size = ext.data.length
        switch (size) {
            case 1:
                this.writeU8(Types.FixExt1)
                break;
            case 2:
                this.writeU8(Types.FixExt2)
                break;
            case 4:
                this.writeU8(Types.FixExt4)
                break;
            case 8:
                this.writeU8(Types.FixExt8)
                break;
            case 16:
                this.writeU8(Types.FixExt16)
                break;
            default:
                if (size < 0x100) {
                    this.writeU8(Types.Ext8);
                    this.writeU8(size)
                }
                else if (size < 0x10000) {
                    this.writeU8(Types.Ext16);
                    this.writeU16(size)
                }
                else if (size < 0x100000000) {
                    // ext 32
                    this.writeU8(Types.Ext32);
                    this.writeU32(size);
                }
                else throw new Error(`ext (${ext.type}) data too large to encode (length > 2^32 - 1)`);
        }
        this.writeI8(ext.type);
        this.writeU8a(ext.data);
    }

    private writeU8(value: number) {
        this.ensureBufferSizeToWrite(1);
        this._view.setUint8(this._pos, value);
        this._pos++;
    }

    private writeU8a(values: ArrayLike<number>) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this._bytes.set(values, this._pos);
        this._pos += size;
    }

    private writeI8(value: number) {
        this.ensureBufferSizeToWrite(1);
        this._view.setInt8(this._pos, value);
        this._pos++;
    }

    private writeU16(value: number) {
        this.ensureBufferSizeToWrite(2);
        this._view.setUint16(this._pos, value);
        this._pos += 2;
    }

    private writeI16(value: number) {
        this.ensureBufferSizeToWrite(2);
        this._view.setInt16(this._pos, value);
        this._pos += 2;
    }

    private writeU32(value: number) {
        this.ensureBufferSizeToWrite(4);
        this._view.setUint32(this._pos, value);
        this._pos += 4;
    }

    private writeI32(value: number) {
        this.ensureBufferSizeToWrite(4);
        this._view.setInt32(this._pos, value);
        this._pos += 4;
    }

    private writeF64(value: number) {
        this.ensureBufferSizeToWrite(8);
        this._view.setFloat64(this._pos, value);
        this._pos += 8;
    }

    private writeU64(value: number) {
        this.ensureBufferSizeToWrite(8);
        setUint64(this._view, this._pos, value);
        this._pos += 8;
    }

    private writeI64(value: number) {
        this.ensureBufferSizeToWrite(8);
        setInt64(this._view, this._pos, value);
        this._pos += 8;
    }

    private writeStringHeader(byteLength: number) {
        if (byteLength < 32) {
            // fixstr
            this.writeU8(0xa0 + byteLength);
        } else if (byteLength < 0x100) {
            // str 8
            this.writeU8(0xd9);
            this.writeU8(byteLength);
        } else if (byteLength < 0x10000) {
            // str 16
            this.writeU8(0xda);
            this.writeU16(byteLength);
        } else if (byteLength < 0x100000000) {
            // str 32
            this.writeU8(0xdb);
            this.writeU32(byteLength);
        } else {
            throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }
    }

    private ensureBufferSizeToWrite(sizeToWrite: number) {
        const requiredSize = this._pos + sizeToWrite;
        if (this._view.byteLength < requiredSize) {
            this.resizeBuffer(requiredSize * 2);
        }
    }

    private resizeBuffer(newSize: number) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);
        newBytes.set(this._bytes);
        this._view = newView;
        this._bytes = newBytes;
    }

}
