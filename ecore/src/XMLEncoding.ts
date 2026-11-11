// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { utf8Count, utf8Decode, utf8Encode } from "./utils/UTF8.js"

// The encodings of an XML document. TextDecoder knows the WHATWG labels, where ISO-8859-1 and
// US-ASCII are windows-1252: their IANA meaning, Latin-1 and ASCII, is read and written here, as
// UTF-8 and UTF-16 are. Another label is read with its WHATWG decoder, and written when its WHATWG
// encoding is a single-byte one; a multi-byte one (GBK, Shift_JIS...) cannot be written.

// XMLTextDecoder decodes the bytes of a document, chunk by chunk when stream is true
export interface XMLTextDecoder {
    decode(bytes: Uint8Array, stream: boolean): string
}

// XMLCharset writes a document: a character it cannot represent is written as a character
// reference, &#8364;, as EMF does
interface XMLCharset {
    // canEncode returns whether the charset represents the code point cp
    canEncode(cp: number): boolean
    // encode returns the bytes of text, whose characters the charset represents
    encode(text: string): Uint8Array
}

const utf8Labels = new Set(["utf-8", "utf8", "unicode-1-1-utf-8"])
const latin1Labels = new Set([
    "iso-8859-1",
    "iso_8859-1",
    "iso_8859-1:1987",
    "iso-ir-100",
    "latin1",
    "l1",
    "ibm819",
    "cp819",
    "csisolatin1"
])
const asciiLabels = new Set([
    "us-ascii",
    "ascii",
    "ansi_x3.4-1968",
    "ansi_x3.4-1986",
    "iso-ir-6",
    "iso_646.irv:1991",
    "iso646-us",
    "us",
    "ibm367",
    "cp367",
    "csascii"
])
// the single-byte encodings of WHATWG, by their canonical name
const singleByteEncodings = new Set([
    "ibm866",
    "iso-8859-2",
    "iso-8859-3",
    "iso-8859-4",
    "iso-8859-5",
    "iso-8859-6",
    "iso-8859-7",
    "iso-8859-8",
    "iso-8859-8-i",
    "iso-8859-10",
    "iso-8859-13",
    "iso-8859-14",
    "iso-8859-15",
    "iso-8859-16",
    "koi8-r",
    "koi8-u",
    "macintosh",
    "windows-874",
    "windows-1250",
    "windows-1251",
    "windows-1252",
    "windows-1253",
    "windows-1254",
    "windows-1255",
    "windows-1256",
    "windows-1257",
    "windows-1258",
    "x-mac-cyrillic"
])

function normalize(label: string): string {
    return label.trim().toLowerCase()
}

// isUTF8 returns whether label names UTF-8
export function isUTF8(label: string): boolean {
    return utf8Labels.has(normalize(label))
}

// isUTF16 returns whether label names UTF-16, of either endianness
export function isUTF16(label: string): boolean {
    return normalize(label).startsWith("utf-16")
}

class SingleByteDecoder implements XMLTextDecoder {
    constructor(private _max: number) {}

    decode(bytes: Uint8Array): string {
        let s = ""
        for (let i = 0; i < bytes.length; i += 8192) {
            const chunk = bytes.subarray(i, Math.min(i + 8192, bytes.length))
            if (this._max == 0xff) {
                s += String.fromCharCode(...chunk)
            } else {
                s += String.fromCharCode(...Array.from(chunk, (b) => (b <= this._max ? b : 0xfffd)))
            }
        }
        return s
    }
}

class WHATWGDecoder implements XMLTextDecoder {
    constructor(private _decoder: TextDecoder) {}

    decode(bytes: Uint8Array, stream: boolean): string {
        return this._decoder.decode(bytes, { stream })
    }
}

// newXMLTextDecoder returns the decoder of an encoding, an IANA name or a WHATWG label, null when
// neither knows it
export function newXMLTextDecoder(label: string): XMLTextDecoder {
    const name = normalize(label)
    if (latin1Labels.has(name)) {
        return new SingleByteDecoder(0xff)
    }
    if (asciiLabels.has(name)) {
        return new SingleByteDecoder(0x7f)
    }
    if (name == "utf-16") {
        // without byte order mark, UTF-16 is big endian (RFC 2781)
        return new WHATWGDecoder(new TextDecoder("utf-16be"))
    }
    try {
        return new WHATWGDecoder(new TextDecoder(name))
    } catch {
        return null
    }
}

// sniffUTF16 returns the decoder of a document in UTF-16, by its first bytes (XML 1.0 appendix F): a
// byte order mark, or a declaration without one; null for another document
export function sniffUTF16(head: Uint8Array): XMLTextDecoder {
    if (head.length >= 2 && head[0] == 0xfe && head[1] == 0xff) {
        return new WHATWGDecoder(new TextDecoder("utf-16be"))
    }
    if (head.length >= 2 && head[0] == 0xff && head[1] == 0xfe) {
        return new WHATWGDecoder(new TextDecoder("utf-16le"))
    }
    if (head.length >= 4 && head[0] == 0 && head[1] == 0x3c && head[2] == 0 && head[3] == 0x3f) {
        return new WHATWGDecoder(new TextDecoder("utf-16be"))
    }
    if (head.length >= 4 && head[0] == 0x3c && head[1] == 0 && head[2] == 0x3f && head[3] == 0) {
        return new WHATWGDecoder(new TextDecoder("utf-16le"))
    }
    return null
}

// declaredEncoding returns the encoding the XML declaration at the start of text names, "" for none
export function declaredEncoding(text: string): string {
    const match = /^﻿?<\?xml\s[^?]*?encoding\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(text)
    return match ? (match[1] ?? match[2]) : ""
}

// declaredEncodingOfBytes returns the encoding the XML declaration at the start of bytes names, read
// as ASCII, "" for none
export function declaredEncodingOfBytes(head: Uint8Array): string {
    let start = 0
    if (head.length >= 3 && head[0] == 0xef && head[1] == 0xbb && head[2] == 0xbf) {
        start = 3
    }
    const end = Math.min(head.length, start + 1024)
    let text = ""
    for (let i = start; i < end; i++) {
        text += String.fromCharCode(head[i])
        if (head[i] == 0x3e) {
            break
        }
    }
    return declaredEncoding(text)
}

// isDeclarationComplete returns whether head holds the XML declaration of a document, if any: its
// encoding can be read
export function isDeclarationComplete(head: Uint8Array): boolean {
    if (head.length >= 1024) {
        return true
    }
    for (let i = 0; i < head.length; i++) {
        if (head[i] == 0x3e) {
            return true
        }
    }
    // a document in UTF-16 is detected by its first 4 bytes
    return head.length >= 4 && sniffUTF16(head) != null
}

class UTF8Charset implements XMLCharset {
    canEncode(): boolean {
        return true
    }

    encode(text: string): Uint8Array {
        const bytes = new Uint8Array(utf8Count(text))
        utf8Encode(text, bytes, 0)
        return bytes
    }
}

class UTF16Charset implements XMLCharset {
    constructor(
        private _bigEndian: boolean,
        private _bom: boolean
    ) {}

    canEncode(): boolean {
        return true
    }

    encode(text: string): Uint8Array {
        const offset = this._bom ? 2 : 0
        const bytes = new Uint8Array(offset + text.length * 2)
        const view = new DataView(bytes.buffer)
        if (this._bom) {
            view.setUint16(0, 0xfeff, !this._bigEndian)
        }
        for (let i = 0; i < text.length; i++) {
            view.setUint16(offset + i * 2, text.charCodeAt(i), !this._bigEndian)
        }
        return bytes
    }
}

class SingleByteCharset implements XMLCharset {
    // the byte of each code point the charset represents
    constructor(private _bytes: Map<number, number>) {}

    canEncode(cp: number): boolean {
        return this._bytes.has(cp)
    }

    encode(text: string): Uint8Array {
        const bytes = new Uint8Array(text.length)
        for (let i = 0; i < text.length; i++) {
            bytes[i] = this._bytes.get(text.charCodeAt(i))
        }
        return bytes
    }
}

const singleByteCharsets = new Map<string, SingleByteCharset>()

function singleByteCharset(name: string, decode: (b: number) => string): SingleByteCharset {
    let charset = singleByteCharsets.get(name)
    if (!charset) {
        const bytes = new Map<number, number>()
        for (let b = 0; b < 256; b++) {
            const s = decode(b)
            if (s.length == 1 && s != "�" && !bytes.has(s.charCodeAt(0))) {
                bytes.set(s.charCodeAt(0), b)
            }
        }
        charset = new SingleByteCharset(bytes)
        singleByteCharsets.set(name, charset)
    }
    return charset
}

// newXMLCharset returns the charset of an encoding, an IANA name or a WHATWG label, null when it
// cannot be written
function newXMLCharset(label: string): XMLCharset {
    const name = normalize(label)
    if (utf8Labels.has(name)) {
        return new UTF8Charset()
    }
    if (name == "utf-16" || name == "utf-16be") {
        // UTF-16 is written big endian with a byte order mark, UTF-16BE and UTF-16LE without
        return new UTF16Charset(true, name == "utf-16")
    }
    if (name == "utf-16le") {
        return new UTF16Charset(false, false)
    }
    if (latin1Labels.has(name)) {
        return singleByteCharset("iso-8859-1", (b) => String.fromCharCode(b))
    }
    if (asciiLabels.has(name)) {
        return singleByteCharset("us-ascii", (b) => (b < 0x80 ? String.fromCharCode(b) : "�"))
    }
    let decoder: TextDecoder
    try {
        decoder = new TextDecoder(name)
    } catch {
        return null
    }
    if (!singleByteEncodings.has(decoder.encoding)) {
        return null
    }
    return singleByteCharset(decoder.encoding, (b) => decoder.decode(new Uint8Array([b])))
}

// escapeUnsupported returns text with the characters charset cannot represent as character
// references
function escapeUnsupported(text: string, charset: XMLCharset): string {
    let result = ""
    let start = 0
    let i = 0
    while (i < text.length) {
        const cp = text.codePointAt(i)
        const size = cp > 0xffff ? 2 : 1
        if (!charset.canEncode(cp)) {
            result += text.substring(start, i) + "&#" + cp.toString() + ";"
            start = i + size
        }
        i += size
    }
    return start == 0 ? text : result + text.substring(start)
}

// encodeXMLText returns the bytes of the document text in the encoding label, a character the
// encoding cannot represent as a character reference; null when the encoding cannot be written
export function encodeXMLText(text: string, label: string): Uint8Array {
    const charset = newXMLCharset(label)
    return charset ? charset.encode(escapeUnsupported(text, charset)) : null
}

// escapeXMLText returns the document text as it is once written in the encoding label and read back:
// a character the encoding cannot represent as a character reference; null when the encoding cannot
// be written
export function escapeXMLText(text: string, label: string): string {
    const charset = newXMLCharset(label)
    return charset ? escapeUnsupported(text, charset) : null
}

// decodeUTF8 decodes bytes in UTF-8
export function decodeUTF8(bytes: Uint8Array): string {
    return utf8Decode(bytes, 0, bytes.length)
}
