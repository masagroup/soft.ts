// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClassifierImpl } from "./internal";

export class EClassifierExt extends EClassifierImpl {
    constructor() {
        super();
    }

    protected initClassifierID(): number {
        return this.ePackage != null ? this.ePackage.eClassifiers.indexOf(this) : -1;
    }

    get defaultValue(): any {
        return null;
    }

    get instanceTypeName(): string {
        return this.instanceClassName
    }

    set instanceTypeName(newInstanceTypeName: string) {
        this.instanceClassName = newInstanceTypeName
    }
}
