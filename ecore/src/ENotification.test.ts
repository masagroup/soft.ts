import { describe, expect, test } from "vitest"
import { EventType } from "./internal.js"

describe("ENotification", () => {
    test("EventType", () => {
        expect(EventType.SET).toBe(0)
        expect(EventType.UNSET).toBe(1)
    })
})
