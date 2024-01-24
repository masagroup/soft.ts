import { EEnum, EEnumImpl, EEnumLiteral } from "./internal"

export function isEEnum(o: any): o is EEnum {
    return o == undefined ? undefined : "eLiterals" in o
}

export class EEnumExt extends EEnumImpl {
    get defaultValue(): any {
        return this.eLiterals.isEmpty() ? null : this.eLiterals.get(0).value
    }

    // getEEnumLiteralByLiteral default implementation
    getEEnumLiteralByLiteral(literal: string): EEnumLiteral {
        for (const eLiteral of this.eLiterals) {
            if (eLiteral.literal == literal) {
                return eLiteral
            }
        }
        return null
    }

    // getEEnumLiteralByName default implementation
    getEEnumLiteralByName(name: string): EEnumLiteral {
        for (const eLiteral of this.eLiterals) {
            if (eLiteral.name == name) {
                return eLiteral
            }
        }
        return null
    }

    // getEEnumLiteralByValue default implementation
    getEEnumLiteralByValue(value: number): EEnumLiteral {
        for (const eLiteral of this.eLiterals) {
            if (eLiteral.value == value) {
                return eLiteral
            }
        }
        return null
    }
}
