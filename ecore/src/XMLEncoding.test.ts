// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import {
    EAttribute,
    EClass,
    EObject,
    EPackage,
    EResource,
    EResourceSet,
    EResourceSetImpl,
    getEcoreFactory,
    getEcorePackage,
    URI,
    XMLDecoder,
    XMLEncoder,
    XMLOptions
} from "./internal.js"

// a package of one class C with a string attribute "single", registered in a resource set
class EncodingModel {
    ePackage: EPackage
    eClass: EClass
    single: EAttribute
    eResourceSet: EResourceSet

    constructor() {
        const f = getEcoreFactory()
        this.ePackage = f.createEPackage()
        this.ePackage.setName("p")
        this.ePackage.setNsURI("http://p")
        this.ePackage.setNsPrefix("p")
        this.ePackage.setEFactoryInstance(f.createEFactory())
        this.eClass = f.createEClass()
        this.eClass.setName("C")
        this.ePackage.getEClassifiers().add(this.eClass)
        this.single = f.createEAttribute()
        this.single.setName("single")
        this.single.setEType(getEcorePackage().getEString())
        this.eClass.getEStructuralFeatures().add(this.single)
        this.eResourceSet = new EResourceSetImpl()
        this.eResourceSet.getPackageRegistry().registerPackage(this.ePackage)
    }

    // decode reads document into a new resource, without error, and returns its decoder, the
    // resource and the value of single
    decode(document: Uint8Array): { decoder: XMLDecoder; eResource: EResource; value: any } {
        const eResource = this.eResourceSet.createResource(new URI("file:///encoding.xml"))
        const decoder = new XMLDecoder(eResource, null)
        decoder.decode(document)
        expect(
            eResource
                .getErrors()
                .toArray()
                .map((e) => e.message)
        ).toEqual([])
        expect(eResource.eContents().size()).toBe(1)
        return { decoder, eResource, value: eResource.eContents().get(0).eGet(this.single) }
    }

    // decodeAsync reads document in chunks of size into a new resource and returns its decoder and
    // the value of single
    async decodeAsync(document: Uint8Array, size: number): Promise<{ decoder: XMLDecoder; value: any }> {
        const eResource = this.eResourceSet.createResource(new URI("file:///encoding-async.xml"))
        const decoder = new XMLDecoder(eResource, null)
        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                for (let i = 0; i < document.length; i += size) {
                    controller.enqueue(document.subarray(i, i + size))
                }
                controller.close()
            }
        })
        await decoder.decodeAsync(stream)
        expect(eResource.eContents().size()).toBe(1)
        return { decoder, value: eResource.eContents().get(0).eGet(this.single) }
    }

    // decodeError reads document into a new resource and returns its first error, "" for none
    decodeError(document: Uint8Array): string {
        const eResource = this.eResourceSet.createResource(new URI("file:///encoding-error.xml"))
        new XMLDecoder(eResource, null).decode(document)
        return eResource.getErrors().isEmpty() ? "" : eResource.getErrors().get(0).message
    }
}

// encode writes eResource in encoding with the document type documentType, and returns its bytes,
// without error
function encode(eResource: EResource, encoding: string, documentType: string): Uint8Array {
    const encoder = new XMLEncoder(eResource, new Map([[XMLOptions.ENCODING, encoding]]))
    encoder.setDocumentType(documentType)
    const result = encoder.encode(eResource)
    expect(
        eResource
            .getErrors()
            .toArray()
            .map((e) => e.message)
    ).toEqual([])
    return result.unwrap()
}

// bytes returns the bytes of a string of code points under 256
function bytes(s: string): Uint8Array {
    return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

function utf8(s: string): Uint8Array {
    return new TextEncoder().encode(s)
}

function toUTF16(s: string, bigEndian: boolean, bom: boolean): Uint8Array {
    const units = (bom ? "﻿" : "") + s
    const result = new Uint8Array(units.length * 2)
    const view = new DataView(result.buffer)
    for (let i = 0; i < units.length; i++) {
        view.setUint16(i * 2, units.charCodeAt(i), !bigEndian)
    }
    return result
}

describe("XML encoding", () => {
    // a document in ISO-8859-1 is read as ISO-8859-1, not windows-1252, and written in the encoding
    // its decoder gives: a character the encoding cannot represent is written as a character reference
    test("ISO-8859-1", () => {
        const m = new EncodingModel()
        const document = bytes('<?xml version="1.0" encoding="ISO-8859-1"?>\n<p:C xmlns:p="http://p" single="\xe9\x80"/>\n')
        const { decoder, eResource, value } = m.decode(document)
        expect(value).toBe("é\u0080")
        expect(decoder.getEncoding()).toBe("ISO-8859-1")
        expect(encode(eResource, decoder.getEncoding(), "")).toEqual(document)

        eResource.eContents().get(0).eSet(m.single, "é€")
        expect(encode(eResource, "ISO-8859-1", "")).toEqual(
            bytes('<?xml version="1.0" encoding="ISO-8859-1"?>\n<p:C xmlns:p="http://p" single="\xe9&#8364;"/>\n')
        )
    })

    // the ENCODING option writes a document in another encoding than UTF-8, the default
    test("ENCODING option", () => {
        const m = new EncodingModel()
        const { eResource } = m.decode(utf8('<?xml version="1.0" encoding="UTF-8"?>\n<p:C xmlns:p="http://p" single="é€"/>\n'))
        expect(new TextDecoder().decode(encode(eResource, "", ""))).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n<p:C xmlns:p="http://p" single="é€"/>\n'
        )
        const ascii = encode(eResource, "US-ASCII", "")
        expect(ascii).toEqual(bytes('<?xml version="1.0" encoding="US-ASCII"?>\n<p:C xmlns:p="http://p" single="&#233;&#8364;"/>\n'))
        expect(m.decode(ascii).value).toBe("é€")

        // a single-byte WHATWG encoding is written with its table
        const cp1252 = encode(eResource, "windows-1252", "")
        expect(cp1252).toEqual(bytes('<?xml version="1.0" encoding="windows-1252"?>\n<p:C xmlns:p="http://p" single="\xe9\x80"/>\n'))
        expect(m.decode(cp1252).value).toBe("é€")

        // a character out of the basic plane is one reference
        eResource.eContents().get(0).eSet(m.single, "😀")
        expect(encode(eResource, "US-ASCII", "")).toEqual(
            bytes('<?xml version="1.0" encoding="US-ASCII"?>\n<p:C xmlns:p="http://p" single="&#128512;"/>\n')
        )
    })

    // a document in UTF-16 is read by its byte order mark, or by its declaration without one, and
    // written in UTF-16 with a byte order mark
    test.each([
        ["little endian with bom", false, true],
        ["big endian with bom", true, true],
        ["little endian without bom", false, false],
        ["big endian without bom", true, false]
    ])("UTF-16 %s", async (_, bigEndian: boolean, bom: boolean) => {
        const m = new EncodingModel()
        const text = '<?xml version="1.0" encoding="UTF-16"?>\n<p:C xmlns:p="http://p" single="é€"/>\n'
        const document = toUTF16(text, bigEndian, bom)
        const { decoder, eResource, value } = m.decode(document)
        expect(value).toBe("é€")
        expect(decoder.getEncoding()).toBe("UTF-16")
        expect(encode(eResource, decoder.getEncoding(), "")).toEqual(toUTF16(text, true, true))

        const decoded = await m.decodeAsync(document, 3)
        expect(decoded.value).toBe("é€")
        expect(decoded.decoder.getEncoding()).toBe("UTF-16")
    })

    // a stream is read in the encoding its declaration names, even split in small chunks
    test("a stream in ISO-8859-1", async () => {
        const m = new EncodingModel()
        const document = bytes('<?xml version="1.0" encoding="ISO-8859-1"?>\n<p:C xmlns:p="http://p" single="\xe9\xe8"/>\n')
        for (const size of [1, 5, 1024]) {
            const { decoder, value } = await m.decodeAsync(document, size)
            expect(value).toBe("éè")
            expect(decoder.getEncoding()).toBe("ISO-8859-1")
        }
        // a stream without declaration is in UTF-8
        expect((await m.decodeAsync(utf8('<p:C xmlns:p="http://p" single="é€"/>'), 2)).value).toBe("é€")
    })

    // a document detected as UTF-16 that declares another encoding, or that declares an unknown one,
    // is an error; so is an encoding the encoder cannot write, which writes nothing
    test("errors", () => {
        const m = new EncodingModel()
        expect(m.decodeError(toUTF16('<?xml version="1.0" encoding="ISO-8859-1"?><p:C xmlns:p="http://p"/>', false, true))).toContain(
            `encoding "ISO-8859-1" of a document in UTF-16`
        )
        expect(m.decodeError(bytes('<?xml version="1.0" encoding="X-NOPE"?><p:C xmlns:p="http://p"/>'))).toContain(
            `unsupported encoding "X-NOPE"`
        )

        for (const encoding of ["X-NOPE", "GBK"]) {
            const { eResource } = m.decode(bytes('<p:C xmlns:p="http://p" single="v"/>'))
            const result = new XMLEncoder(eResource, new Map([[XMLOptions.ENCODING, encoding]])).encode(eResource)
            expect(result.isErr()).toBe(true)
            expect(eResource.getErrors().size()).toBe(1)
            expect(eResource.getErrors().get(0).message).toContain(`unsupported encoding "${encoding}"`)
        }
    })

    // a label IANA does not support is read with its WHATWG encoding
    test("WHATWG label", () => {
        const m = new EncodingModel()
        const { decoder, value } = m.decode(bytes('<?xml version="1.0" encoding="GB2312"?><p:C xmlns:p="http://p" single="\xc4\xe3"/>'))
        expect(value).toBe("你")
        expect(decoder.getEncoding()).toBe("GB2312")
    })

    // the document type declaration of a document, <!DOCTYPE TS> of a Qt Linguist file, is given by
    // its decoder, and written after the XML declaration
    test("document type", () => {
        const m = new EncodingModel()
        const document = '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE TS>\n<p:C xmlns:p="http://p" single="v"/>\n'
        const { decoder, eResource } = m.decode(utf8(document))
        expect(decoder.getDocumentType()).toBe("<!DOCTYPE TS>")
        expect(new TextDecoder().decode(encode(eResource, decoder.getEncoding(), decoder.getDocumentType()))).toBe(document)
    })

    // a string is a text: loadFromString does not decode it again in the encoding it declares, and
    // saveToString gives the text of the document, a character its encoding cannot represent as a
    // character reference
    test("strings are texts", () => {
        const m = new EncodingModel()
        const eResource = m.eResourceSet.createResource(new URI("file:///encoding-string.xml"))
        eResource.loadFromString('<?xml version="1.0" encoding="ISO-8859-1"?>\n<p:C xmlns:p="http://p" single="é"/>\n')
        expect(eResource.getErrors().isEmpty()).toBe(true)
        const eObject: EObject = eResource.eContents().get(0)
        expect(eObject.eGet(m.single)).toBe("é")

        eObject.eSet(m.single, "é€")
        expect(eResource.saveToString(new Map([[XMLOptions.ENCODING, "ISO-8859-1"]]))).toBe(
            '<?xml version="1.0" encoding="ISO-8859-1"?>\n<p:C xmlns:p="http://p" single="é&#8364;"/>\n'
        )
    })

    // XML is escaped as XML requires, as EMF does: an apostrophe stays an apostrophe, and so does a
    // double quote in a text
    test("escape", () => {
        const m = new EncodingModel()
        const many = getEcoreFactory().createEAttribute()
        many.setName("many")
        many.setEType(getEcorePackage().getEString())
        many.setUpperBound(-1)
        m.eClass.getEStructuralFeatures().add(many)
        const eResource = m.eResourceSet.createResource(new URI("file:///escape.xml"))
        const eObject = m.ePackage.getEFactoryInstance().create(m.eClass)
        eObject.eSet(m.single, "a\nb\tc\r<&>\"'")
        ;(eObject.eGet(many) as any).add(`x<y&z "'`)
        eResource.eContents().add(eObject)
        const document = eResource.saveToString()
        expect(document).toContain(`single="a&#xA;b&#x9;c&#13;&lt;&amp;&gt;&quot;'"`)
        expect(document).toContain(`<many>x&lt;y&amp;z "'</many>`)

        const eDecoded = m.eResourceSet.createResource(new URI("file:///escape-decoded.xml"))
        eDecoded.loadFromString(document)
        expect(eDecoded.getErrors().isEmpty()).toBe(true)
        expect(eDecoded.eContents().get(0).eGet(m.single)).toBe("a\nb\tc\r<&>\"'")
        expect((eDecoded.eContents().get(0).eGet(many) as any).toArray()).toEqual([`x<y&z "'`])
    })
})
