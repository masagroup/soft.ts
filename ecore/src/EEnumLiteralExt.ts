import { EEnumLiteralImpl } from "./internal";

export class EEnumLiteralExt extends EEnumLiteralImpl {
    get literal(): string {
        let literal = super.literal;
        return literal.length == 0 ? this.name : literal;
    }
}
