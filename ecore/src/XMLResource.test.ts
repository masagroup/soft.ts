// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { XMLNamespaces } from "./internal";

describe("XMLNamespaces", () => {
    test("constructor", () => {
        let n = new XMLNamespaces();
        expect(n.getPrefix("uri")).toBeNull();
        expect(n.getURI("prefix")).toBeNull();
    });

    test("empty", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.getPrefix("uri")).toBeNull();
        expect(n.getURI("prefix")).toBeNull();
        let c = n.popContext();
        expect(c.length).toBe(0);
    });

    test("context ", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        n.pushContext();
        expect(n.declarePrefix("prefix", "uri2")).toBeFalsy();
        expect(n.getPrefix("uri2")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri2");

        n.popContext();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        n.popContext();
        expect(n.getPrefix("uri")).toBeNull();
        expect(n.getURI("prefix")).toBeNull();
    });

    test("contextRemap", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        expect(n.declarePrefix("prefix", "uri2")).toBeTruthy();
        expect(n.getPrefix("uri2")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri2");
    });

    test("contextNoRemap ", () => {
        let n = new XMLNamespaces();
        n.pushContext();
        expect(n.declarePrefix("prefix", "uri")).toBeFalsy();
        expect(n.getPrefix("uri")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri");

        n.pushContext();
        expect(n.declarePrefix("prefix", "uri2")).toBeFalsy();
        expect(n.getPrefix("uri2")).toBe("prefix");
        expect(n.getURI("prefix")).toBe("uri2");
    });
});
