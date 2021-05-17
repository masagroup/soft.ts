import { EClassifier, EDataType } from "./internal";

export function isEDataType(e: EClassifier): e is EDataType {
    return "isSerializable" in e;
}
