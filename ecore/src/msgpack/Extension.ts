import { dateExtension } from "./Date"
import { ulidExtension } from "./ULID"
import { uuidExtension } from "./UUID"

export class ExtData {
    constructor(
        readonly type: number,
        readonly data: Uint8Array
    ) {}
}

export type ExtensionDecoderType = (data: Uint8Array, extensionType: number) => unknown

export type ExtensionEncoderType = (input: unknown) => Uint8Array | null

// immutable interface to ExtensionCodec
export type ExtensionCodecType = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tryToEncode(object: unknown): ExtData | null
    decode(data: Uint8Array, extType: number): unknown
}

export class ExtensionCodec implements ExtensionCodecType {
    public static readonly defaultCodec: ExtensionCodecType = new ExtensionCodec()

    // built-in extensions
    private readonly builtInEncoders: Array<ExtensionEncoderType | undefined | null> = []
    private readonly builtInDecoders: Array<ExtensionDecoderType | undefined | null> = []

    // custom extensions
    private readonly encoders: Array<ExtensionEncoderType | undefined | null> = []
    private readonly decoders: Array<ExtensionDecoderType | undefined | null> = []

    public constructor() {
        this.register(dateExtension)
        this.register(ulidExtension)
        this.register(uuidExtension)
    }

    public register({
        type,
        encode,
        decode
    }: {
        type: number
        encode: ExtensionEncoderType
        decode: ExtensionDecoderType
    }): void {
        if (type >= 0) {
            // custom extensions
            this.encoders[type] = encode
            this.decoders[type] = decode
        } else {
            // built-in extensions
            const index = 1 + type
            this.builtInEncoders[index] = encode
            this.builtInDecoders[index] = decode
        }
    }

    public tryToEncode(object: unknown): ExtData | null {
        // built-in extensions
        for (let i = 0; i < this.builtInEncoders.length; i++) {
            const encodeExt = this.builtInEncoders[i]
            if (encodeExt != null) {
                const data = encodeExt(object)
                if (data != null) {
                    const type = -1 - i
                    return new ExtData(type, data)
                }
            }
        }

        // custom extensions
        for (let i = 0; i < this.encoders.length; i++) {
            const encodeExt = this.encoders[i]
            if (encodeExt != null) {
                const data = encodeExt(object)
                if (data != null) {
                    const type = i
                    return new ExtData(type, data)
                }
            }
        }

        if (object instanceof ExtData) {
            // to keep ExtData as is
            return object
        }
        return null
    }

    public decode(data: Uint8Array, type: number): unknown {
        const decodeExt = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type]
        if (decodeExt) {
            return decodeExt(data, type)
        } else {
            // decode() does not fail, returns ExtData instead.
            return new ExtData(type, data)
        }
    }
}
