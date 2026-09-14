// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { XMLString } from "./internal.js"

describe("XMLString", () => {
    test("escapes XML entities in attributes and text content", () => {
        const xml = new XMLString()
        xml.startElement("test")
        xml.addAttribute("attr", "a < b & c > d \"quoted\" 'apos'")
        xml.addContent("content", "hello <world> & goodbye")
        xml.endElement()

        const str = xml.toString()
        expect(str).toContain('attr="a &lt; b &amp; c &gt; d &quot;quoted&quot; &apos;apos&apos;"')
        expect(str).toContain("<content>hello &lt;world&gt; &amp; goodbye</content>")
    })
})
