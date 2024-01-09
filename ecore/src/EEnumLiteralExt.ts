import { EEnumLiteralImpl } from "./internal";

export class EEnumLiteralExt extends EEnumLiteralImpl {
    get literal(): string {
        let l = super.literal;
        return l.length == 0 ? this.name : l;
    }

    set literal(newLiteral: string) {
        super.literal = newLiteral;
    }
}
