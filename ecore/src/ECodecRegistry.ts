import { ECodec, ECodecRegistryImpl, URI } from "./internal.js"

export interface ECodecRegistry {
    getCodec(url: URI): ECodec
    getProtocolToCodecMap(): Map<string, ECodec>
    getExtensionToCodecMap(): Map<string, ECodec>
}

export function getCodecRegistry(): ECodecRegistry {
    return ECodecRegistryImpl.getInstance()
}
