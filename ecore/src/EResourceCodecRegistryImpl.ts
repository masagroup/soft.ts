import { BinaryCodec } from "./BinaryCodec";
import { EResourceCodec } from "./EResourceCodec";
import { EResourceCodecRegistry } from "./EResourceCodecRegistry";
import { NoCodec } from "./NoCodec";
import { XMICodec } from "./XMICodec";
import { XMLCodec } from "./XMLCodec";

export class EResourceCodecRegistryImpl implements EResourceCodecRegistry {
    private _protocolToCodec: Map<string, EResourceCodec>;
    private _extensionToCodec: Map<string, EResourceCodec>;
    private _delegate : EResourceCodecRegistry;
    private static _instance: EResourceCodecRegistryImpl = null;

    public static getInstance(): EResourceCodecRegistryImpl {
        if (!this._instance) {
            this._instance = new EResourceCodecRegistryImpl();
            this._instance._extensionToCodec.set("ecore",new XMICodec());
            this._instance._extensionToCodec.set("xml",new XMLCodec());
            this._instance._extensionToCodec.set("bin",new BinaryCodec());
            this._instance._protocolToCodec.set("memory",new NoCodec());
        }
        return this._instance;
    }


    public constructor( delegate?: EResourceCodecRegistry) {
        this._protocolToCodec = new Map<string, EResourceCodec>();
        this._extensionToCodec = new Map<string, EResourceCodec>();
        this._delegate = delegate;
    }

    getCodec(uri: URL): EResourceCodec {
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
            return this._delegate.getCodec(uri)
        }
        return null;
    }

    getProtocolToCodecMap(): Map<string, EResourceCodec> {
        return  this._protocolToCodec;
    }

    getExtensionToCodecMap(): Map<string, EResourceCodec> {
        return  this._extensionToCodec;
    }

}