import { BinaryCodec } from "./BinaryCodec.js"
import { ECodec } from "./ECodec.js"
import { ECodecRegistry } from "./ECodecRegistry.js"
import { NoCodec } from "./NoCodec.js"
import { XMICodec } from "./XMICodec.js"
import { XMLCodec } from "./XMLCodec.js"
import { URI } from "./internal.js"

export class ECodecRegistryImpl implements ECodecRegistry {
    private _protocolToCodec: Map<string, ECodec>
    private _extensionToCodec: Map<string, ECodec>
    private _delegate: ECodecRegistry
    private static _instance: ECodecRegistryImpl = null

    public static getInstance(): ECodecRegistryImpl {
        if (!this._instance) {
            this._instance = new ECodecRegistryImpl()
            this._instance._extensionToCodec.set("ecore", new XMICodec())
            this._instance._extensionToCodec.set("xml", new XMLCodec())
            this._instance._extensionToCodec.set("bin", new BinaryCodec())
            this._instance._protocolToCodec.set("memory", new NoCodec())
        }
        return this._instance
    }

    public constructor(delegate?: ECodecRegistry) {
        this._protocolToCodec = new Map<string, ECodec>()
        this._extensionToCodec = new Map<string, ECodec>()
        this._delegate = delegate
    }

    getCodec(uri: URI): ECodec {
        let factory = this._protocolToCodec.get(uri.scheme)
        if (factory) {
            return factory
        }
        const ndx = uri.path.lastIndexOf(".")
        if (ndx != -1) {
            const extension = uri.path.slice(ndx + 1)
            factory = this._extensionToCodec.get(extension)
            if (factory) {
                return factory
            }
        }
        factory = this._extensionToCodec.get("*")
        if (factory) {
            return factory
        }
        if (this._delegate) {
            return this._delegate.getCodec(uri)
        }
        return null
    }

    getProtocolToCodecMap(): Map<string, ECodec> {
        return this._protocolToCodec
    }

    getExtensionToCodecMap(): Map<string, ECodec> {
        return this._extensionToCodec
    }
}
