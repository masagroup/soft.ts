// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClassifierImpl } from "./internal.js"

export class EClassifierExt extends EClassifierImpl {
    
    protected initClassifierID(): number {
        return this.getEPackage() != null ? this.getEPackage().getEClassifiers().indexOf(this) : -1
    }

    getDefaultValue(): any {
        return null
    }

    getInstanceTypeName(): string {
        return this.getInstanceClassName()
    }

    setInstanceTypeName(newInstanceTypeName: string) {
        this.setInstanceClassName(newInstanceTypeName)
    }
}
