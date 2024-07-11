// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { WriterExt } from "./internal.js"

describe("WriterExt", () => {
    test("names", () => {
        let w = new WriterExt()
        expect(w).not.toBeNull()

        w.firstName = "First 1"
        w.lastName = "Last 1"
        expect(w.name).toBe("First 1--Last 1")

        w.name = "First 2--Last 2"
        expect(w.firstName).toBe("First 2")
        expect(w.lastName).toBe("Last 2")
    })
})
