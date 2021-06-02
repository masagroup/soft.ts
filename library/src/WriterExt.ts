// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { WriterImpl } from "./internal";

export class WriterExt extends WriterImpl {
    constructor() {
        super();
    }

    // get the value of name
    get name(): string {
        return this.firstName + "--" + this.lastName;
    }

    // set the value of name
    set name(newName: string) {
        let index = newName.indexOf("--");
        if (index != -1) {
            this.firstName = newName.slice(0, index);
            this.lastName = newName.slice(index + 2);
        }
    }
}
