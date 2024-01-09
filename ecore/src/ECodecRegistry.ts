import { ECodec, ECodecRegistryImpl } from "./internal";

export interface ECodecRegistry {
    getCodec(url: URL): ECodec;
    getProtocolToCodecMap(): Map<string, ECodec>;
    getExtensionToCodecMap(): Map<string, ECodec>;
}

export function getCodecRegistry(): ECodecRegistry {
    return ECodecRegistryImpl.getInstance();
}
