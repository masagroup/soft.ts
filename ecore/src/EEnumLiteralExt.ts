import { EEnumLiteralImpl } from "./internal.js"

export class EEnumLiteralExt extends EEnumLiteralImpl {
    getLiteral(): string {
        const l = super.getLiteral()
        return l.length == 0 ? this.getName() : l
    }
}
