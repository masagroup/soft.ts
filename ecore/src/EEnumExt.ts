import { EEnum } from "./internal";

export function isEEnum(o: any): o is EEnum {
    return o == undefined ? undefined : "eLiterals" in o;
}