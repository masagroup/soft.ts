import { EResourceCodec, EResourceCodecRegistryImpl } from "./internal";

export interface EResourceCodecRegistry  {
    getCodec(url :URL) : EResourceCodec;
    getProtocolToCodecMap() : Map<string,EResourceCodec>;
	getExtensionToCodecMap() : Map<string,EResourceCodec>;
}

export function getResourceCodecRegistry(): EResourceCodecRegistry {
    return EResourceCodecRegistryImpl.getInstance();
}