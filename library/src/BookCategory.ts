// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

export enum BookCategory {
    BIOGRAPHY = 2,
    MYSTERY = 0,
    SCIENCEFICTION = 1,
}

export function bookCategoryToString(bookCategory: BookCategory): string {
    switch (bookCategory) {
        case BookCategory.BIOGRAPHY:
            return "Biography"
        case BookCategory.MYSTERY:
            return "Mystery"
        case BookCategory.SCIENCEFICTION:
            return "ScienceFiction"
    }
}

export function bookCategoryFromString(literalValue: string): BookCategory {
    if (literalValue == "Biography") return BookCategory.BIOGRAPHY
    else if (literalValue == "Mystery") return BookCategory.MYSTERY
    else if (literalValue == "ScienceFiction") return BookCategory.SCIENCEFICTION
    throw new Error("Invalid value for enum BookCategory: " + literalValue)
}
