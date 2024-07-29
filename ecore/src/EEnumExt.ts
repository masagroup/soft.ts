import { EEnum, EEnumImpl, EEnumLiteral } from "./internal.js"

export function isEEnum(o: any): o is EEnum {
    return o == undefined ? undefined : "getELiterals" in o
}

export class EEnumExt extends EEnumImpl {
    getDefaultValue(): any {
        return this.getELiterals().isEmpty() ? null : this.getELiterals().get(0).getValue()
    }

    // getEEnumLiteralByLiteral default implementation
    getEEnumLiteralByLiteral(literal: string): EEnumLiteral {
        for (const eLiteral of this.getELiterals()) {
            if (eLiteral.getLiteral() == literal) {
                return eLiteral
            }
        }
        return null
    }

    // getEEnumLiteralByName default implementation
    getEEnumLiteralByName(name: string): EEnumLiteral {
        for (const eLiteral of this.getELiterals()) {
            if (eLiteral.getName() == name) {
                return eLiteral
            }
        }
        return null
    }

    // getEEnumLiteralByValue default implementation
    getEEnumLiteralByValue(value: number): EEnumLiteral {
        for (const eLiteral of this.getELiterals()) {
            if (eLiteral.getValue() == value) {
                return eLiteral
            }
        }
        return null
    }
}
