import { BinaryCodec } from "./BinaryCodec";
import { ECodec } from "./ECodec";
import { ECodecRegistry } from "./ECodecRegistry";
import { NoCodec } from "./NoCodec";
import { XMICodec } from "./XMICodec";
import { XMLCodec } from "./XMLCodec";

export class ECodecRegistryImpl implements ECodecRegistry {
    private _protocolToCodec: Map<string, ECodec>;
    private _extensionToCodec: Map<string, ECodec>;
    private _delegate: ECodecRegistry;
    private static _instance: ECodecRegistryImpl = null;

    public static getInstance(): ECodecRegistryImpl {
        if (!this._instance) {
            this._instance = new ECodecRegistryImpl();
            this._instance._extensionToCodec.set("ecore", new XMICodec());
            this._instance._extensionToCodec.set("xml", new XMLCodec());
            this._instance._extensionToCodec.set("bin", new BinaryCodec());
            this._instance._protocolToCodec.set("memory", new NoCodec());
        }
        return this._instance;
    }

    public constructor(delegate?: ECodecRegistry) {
        this._protocolToCodec = new Map<string, ECodec>();
        this._extensionToCodec = new Map<string, ECodec>();
        this._delegate = delegate;
    }

    getCodec(uri: URL): ECodec {
        let factory = this._protocolToCodec.get(uri.protocol);
        if (factory) {
            return factory;
        }
        let ndx = uri.pathname.lastIndexOf(".");
        if (ndx != -1) {
            let extension = uri.pathname.slice(ndx + 1);
            factory = this._extensionToCodec.get(extension);
            if (factory) {
                return factory;
            }
        }
        factory = this._extensionToCodec.get("*");
        if (factory) {
            return factory;
        }
        if (this._delegate) {
            return this._delegate.getCodec(uri);
        }
        return null;
    }

    getProtocolToCodecMap(): Map<string, ECodec> {
        return this._protocolToCodec;
    }

    getExtensionToCodecMap(): Map<string, ECodec> {
        return this._extensionToCodec;
    }
}
