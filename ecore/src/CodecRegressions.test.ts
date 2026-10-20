// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import fs from "fs"
import os from "os"
import path from "path"
import { describe, expect, test, vi } from "vitest"
import {
    BasicEMap,
    BinaryDecoder,
    BinaryEncoder,
    BinaryOptions,
    EAttribute,
    EClass,
    EList,
    EObject,
    EObjectInternal,
    EPackage,
    EReference,
    EResourceImpl,
    EResourceSetImpl,
    ExtendedMetaData,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY,
    URI,
    XMIProcessor,
    XMLDecoder,
    XMLEncoder,
    XMLNamespaces,
    XMLOptions,
    XMLProcessor
} from "./internal.js"
import { Decoder } from "./msgpack/Decoder.js"
import { Encoder } from "./msgpack/Encoder.js"

function createModel() {
    const factory = getEcoreFactory()
    const ePackage = factory.createEPackage()
    ePackage.setName("p")
    ePackage.setNsPrefix("p")
    ePackage.setNsURI("urn:codec-regressions")

    const nodeClass = factory.createEClass()
    nodeClass.setName("Node")
    ePackage.getEClassifiers().add(nodeClass)

    const tags = factory.createEAttribute()
    tags.setName("tags")
    tags.setEType(getEcorePackage().getEString())
    tags.setUpperBound(UNBOUNDED_MULTIPLICITY)
    nodeClass.getEStructuralFeatures().add(tags)

    const name = factory.createEAttribute()
    name.setName("name")
    name.setEType(getEcorePackage().getEString())
    name.setDefaultValueLiteral("default")
    nodeClass.getEStructuralFeatures().add(name)

    const children = factory.createEReference()
    children.setName("children")
    children.setEType(nodeClass)
    children.setContainment(true)
    children.setUpperBound(UNBOUNDED_MULTIPLICITY)
    nodeClass.getEStructuralFeatures().add(children)

    const ref = factory.createEReference()
    ref.setName("ref")
    ref.setEType(nodeClass)
    ref.setResolveProxies(true)
    nodeClass.getEStructuralFeatures().add(ref)

    const resourceSet = new EResourceSetImpl()
    resourceSet.getPackageRegistry().registerPackage(ePackage)
    return { ePackage, nodeClass, tags, name, children, ref, resourceSet }
}

function loadPackage(filename: string): EPackage {
    const resource = new XMIProcessor().loadSync(new URI("testdata/" + filename))
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    return resource.eContents().get(0) as EPackage
}

function streamOf(...chunks: Uint8Array[]): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(chunk)
            controller.close()
        }
    })
}

describe("XMLDecoder", () => {
    test("many-valued data type element content", () => {
        const { resourceSet, tags } = createModel()
        const eResource = resourceSet.createResource(new URI("a.xml"))
        eResource.loadFromString(
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
                `<p:Node xmlns:p="urn:codec-regressions"><tags>a</tags><tags> b </tags><tags></tags><tags><![CDATA[<c>]]></tags></p:Node>`
        )
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        const eObject = eResource.eContents().get(0)
        expect((eObject.eGet(tags) as EList<string>).toArray()).toEqual(["a", " b ", "", "<c>"])
    })

    test("empty attribute is not null", () => {
        const { resourceSet, name } = createModel()
        const eResource = resourceSet.createResource(new URI("a.xml"))
        eResource.loadFromString(`<?xml version="1.0" encoding="UTF-8"?>\n<p:Node xmlns:p="urn:codec-regressions" name=""/>`)
        const eObject = eResource.eContents().get(0)
        expect(eObject.eIsSet(name)).toBeTruthy()
        expect(eObject.eGet(name)).toBe("")
    })

    test("decodeAsync multibyte character split across chunks", async () => {
        const { resourceSet, name } = createModel()
        const eResource = resourceSet.createResource(new URI("a.xml"))
        const bytes = new TextEncoder().encode(
            `<?xml version="1.0" encoding="UTF-8"?>\n<p:Node xmlns:p="urn:codec-regressions" name="é€"/>`
        )
        const split = bytes.indexOf(0xc3) + 1
        await new XMLDecoder(eResource, null).decodeAsync(streamOf(bytes.subarray(0, split), bytes.subarray(split)))
        expect(eResource.eContents().get(0).eGet(name)).toBe("é€")
    })

    test("same document proxies", () => {
        const { resourceSet, nodeClass, ePackage } = createModel()
        const eResource = resourceSet.createResource(new URI("http://host/dir/a.xml"))
        const decoder = new XMLDecoder(eResource, null) as any
        const factory = ePackage.getEFactoryInstance()

        const sameDocument = factory.create(nodeClass)
        decoder.handleProxy(sameDocument, "a.xml#//@children.0")
        expect((sameDocument as EObjectInternal).eProxyURI().fragment).toBe("//@children.0")

        const otherDocument = factory.create(nodeClass)
        decoder.handleProxy(otherDocument, "b.xml#//@children.0")

        expect(decoder._sameDocumentProxies).toEqual([sameDocument])
    })
})

describe("XMLNamespaces", () => {
    test("redeclare prefix in sibling context", () => {
        const namespaces = new XMLNamespaces()
        namespaces.pushContext()
        namespaces.declarePrefix("p", "urn:root")
        namespaces.pushContext()
        namespaces.declarePrefix("x", "urn:u1")
        namespaces.popContext()
        namespaces.pushContext()
        namespaces.declarePrefix("x", "urn:u2")
        expect(namespaces.getURI("x")).toBe("urn:u2")
        expect(namespaces.getURI("p")).toBe("urn:root")
    })
})

describe("XMLEncoder", () => {
    test("prefix to namespace map", () => {
        const { resourceSet } = createModel()
        const eResource = resourceSet.createResource(new URI("a.xml"))
        const encoder = new XMLEncoder(eResource, null) as any
        const map = new BasicEMap<string, string>()
        map.put("x", "urn:x")
        map.put("y", "urn:x")
        encoder.setPrefixToNamespace(map)
        expect(encoder._uriToPrefixes.get("urn:x")).toEqual(["x", "y"])
    })
})

describe("XMLProcessor", () => {
    test("load uses extended meta data", async () => {
        const { ePackage } = createModel()
        const processor = new XMLProcessor([ePackage])
        const load = vi.spyOn(EResourceImpl.prototype, "load").mockResolvedValue()
        try {
            await processor.load(new URI("a.xml"), new Map([["key", "value"]]))
            const options = load.mock.calls[0][0]
            expect(options.get(XMLOptions.EXTENDED_META_DATA)).toBeInstanceOf(ExtendedMetaData)
            expect(options.get("key")).toBe("value")
        } finally {
            load.mockRestore()
        }
    })
})

describe("ExtendedMetaData", () => {
    test("empty namespace is cached", () => {
        const { tags } = createModel()
        const emd = new ExtendedMetaData()
        const spy = vi.spyOn(emd, "basicGetNamespace")
        expect(emd.getNamespace(tags)).toBe("")
        expect(emd.getNamespace(tags)).toBe("")
        expect(spy).toHaveBeenCalledTimes(1)
    })
})

describe("save to file", () => {
    test.each(["xml", "bin"])("%s", async (extension) => {
        const { resourceSet, nodeClass, ePackage, name } = createModel()
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecore-"))
        try {
            const filePath = path.join(dir, "out." + extension)
            const uri = new URI("file:///" + filePath.replace(/\\/g, "/"))
            const eResource = resourceSet.createResource(uri)
            const eObject = ePackage.getEFactoryInstance().create(nodeClass)
            eObject.eSet(name, "saved")
            eResource.eContents().add(eObject)
            await eResource.save()
            expect(fs.statSync(filePath).size).toBeGreaterThan(0)

            const eLoaded = new EResourceSetImpl()
            eLoaded.getPackageRegistry().registerPackage(ePackage)
            const r = eLoaded.createResource(uri)
            await r.load()
            expect(r.getErrors().isEmpty()).toBeTruthy()
            expect(r.eContents().get(0).eGet(name)).toBe("saved")
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })
})

describe("msgpack", () => {
    test("nil as bytes and string", () => {
        const decoder = new Decoder(Uint8Array.from([0xc0, 0xc0, 0x05]))
        expect(decoder.decodeBinary()).toBeNull()
        expect(decoder.decodeString()).toBe("")
        expect(decoder.decodeNumber()).toBe(5)
    })

    test("negative fixint", () => {
        const encoder = new Encoder()
        encoder.encode(-5)
        expect(new Decoder(encoder.bytes()).decode()).toBe(-5)
    })

    test.each([2 ** 60, -(2 ** 60), 2 ** 63, -(2 ** 63)])("large integer %d", (value) => {
        const encoder = new Encoder()
        encoder.encodeNumber(value)
        const bytes = encoder.bytes()
        expect(bytes[0]).toBe(value > 0 ? 0xcf : 0xd3)
        expect(new Decoder(bytes).decodeNumber()).toBe(value)
    })

    test("float32", () => {
        const encoder = new Encoder()
        encoder.encodeFloat32(1.5)
        const bytes = encoder.bytes()
        expect(bytes[0]).toBe(0xca)
        expect(new Decoder(bytes).decodeNumber()).toBe(1.5)
    })
})

describe("BinaryEncoder", () => {
    test("encodeObject encodes references outside the object as proxies", () => {
        const { resourceSet, nodeClass, ePackage, children, ref, name } = createModel()
        const eResource = resourceSet.createResource(new URI("file:///a.bin"))
        const factory = ePackage.getEFactoryInstance()
        const root = factory.create(nodeClass)
        const a = factory.create(nodeClass)
        const b = factory.create(nodeClass)
        b.eSet(name, "b")
        const rootChildren = root.eGet(children) as EList<EObject>
        rootChildren.add(a)
        rootChildren.add(b)
        a.eSet(ref, b)
        eResource.eContents().add(root)

        const result = new BinaryEncoder(eResource, null).encodeObject(a)
        expect(result.isOk()).toBeTruthy()

        const eDecodedResource = resourceSet.createResource(new URI("file:///a2.bin"))
        const decoded = new BinaryDecoder(eDecodedResource, null).decodeObject(result.unwrap())
        expect(decoded.isOk()).toBeTruthy()
        const eRef = decoded.unwrap().eGet(ref) as EObjectInternal
        expect(eRef.eIsProxy()).toBeTruthy()
        expect(eRef.eProxyURI().fragment).toBe("//@children.1")
    })

    test("namespace attribute", () => {
        const factory = getEcoreFactory()
        const ePackage = factory.createEPackage()
        ePackage.setName("ns")
        ePackage.setNsPrefix("ns")
        ePackage.setNsURI("urn:codec-regressions-ns")
        const eClass = factory.createEClass()
        eClass.setName("Root")
        ePackage.getEClassifiers().add(eClass)
        const prefixes = factory.createEAttribute()
        prefixes.setName("prefixes")
        prefixes.setEType(getEcorePackage().getEString())
        prefixes.setTransient(true)
        const annotation = factory.createEAnnotation()
        annotation.setSource("http:///org/eclipse/emf/ecore/util/ExtendedMetaData")
        annotation.getDetails().put("name", "xmlns:prefix")
        prefixes.getEAnnotations().add(annotation)
        eClass.getEStructuralFeatures().add(prefixes)

        const resourceSet = new EResourceSetImpl()
        resourceSet.getPackageRegistry().registerPackage(ePackage)
        const eResource = resourceSet.createResource(new URI("file:///a.bin"))
        const eObject = ePackage.getEFactoryInstance().create(eClass)
        eObject.eSet(prefixes, "value")
        eResource.eContents().add(eObject)

        const encode = (options: Map<string, any>) =>
            Buffer.from(new BinaryEncoder(eResource, options).encode(eResource).unwrap()).toString()
        expect(encode(new Map())).toContain("prefixes")
        expect(encode(new Map([[BinaryOptions.BINARY_OPTION_NAMESPACE_ATTRIBUTE, true]]))).toContain("prefixes")
        expect(encode(new Map([[BinaryOptions.BINARY_OPTION_NAMESPACE_ATTRIBUTE, false]]))).not.toContain("prefixes")
        expect(encode(null)).not.toContain("prefixes")
    })
})

describe("BinaryDecoder", () => {
    test("unknown package", () => {
        const { resourceSet, nodeClass, ePackage } = createModel()
        const eResource = resourceSet.createResource(new URI("file:///a.bin"))
        eResource.eContents().add(ePackage.getEFactoryInstance().create(nodeClass))
        const bytes = new BinaryEncoder(eResource, null).encode(eResource).unwrap()

        const eDecoded = new EResourceImpl()
        eDecoded.setURI(new URI("file:///b.bin"))
        const result = new BinaryDecoder(eDecoded, null).decode(bytes)
        expect(result.isErr()).toBeTruthy()
        expect(eDecoded.getErrors().size()).toBe(1)
        expect(eDecoded.getErrors().get(0).message).toBe("unable to find package 'urn:codec-regressions'")
    })

    test("truncated buffer is reported", () => {
        const { resourceSet, nodeClass, ePackage } = createModel()
        const eResource = resourceSet.createResource(new URI("file:///a.bin"))
        eResource.eContents().add(ePackage.getEFactoryInstance().create(nodeClass))
        const bytes = new BinaryEncoder(eResource, null).encode(eResource).unwrap()

        const eDecoded = resourceSet.createResource(new URI("file:///b.bin"))
        const result = new BinaryDecoder(eDecoded, null).decode(bytes.subarray(0, bytes.length - 4))
        expect(result.isErr()).toBeTruthy()
        expect(eDecoded.getErrors().size()).toBe(1)
    })

    test("decodeAsync errors are reported", async () => {
        const { resourceSet } = createModel()
        const eDecoded = resourceSet.createResource(new URI("file:///b.bin"))
        await expect(new BinaryDecoder(eDecoded, null).decodeAsync(streamOf(Uint8Array.from([1, 2, 3])))).rejects.toThrow()
        expect(eDecoded.getErrors().size()).toBe(1)
    })
})

describe("Binary go compatibility", () => {
    const ePackage = loadPackage("alltypes.ecore")
    const eClass = ePackage.getEClassifier("Object") as EClass
    const feature = (name: string) => eClass.getEStructuralFeatureFromName(name) as EAttribute

    function decodeResource(bytes: Uint8Array) {
        const resourceSet = new EResourceSetImpl()
        resourceSet.getPackageRegistry().registerPackage(ePackage)
        const eResource = resourceSet.createResource(new URI("testdata/alltypes.bin"))
        const result = new BinaryDecoder(eResource, null).decode(bytes)
        expect(result.isOk(), result.isErr() ? result.error.message : "").toBeTruthy()
        return eResource.eContents().get(0)
    }

    test("decode go file", () => {
        const eObject = decodeResource(fs.readFileSync("testdata/alltypes.bin"))
        expect(eObject.eGet(feature("f32"))).toBe(3)
        expect(eObject.eGet(feature("f64"))).toBe(4)
        expect(eObject.eGet(feature("str"))).toBe("str")
        expect(eObject.eGet(feature("i8"))).toBe("b".charCodeAt(0))
        expect(eObject.eGet(feature("i16"))).toBe(2)
        expect(eObject.eGet(feature("i32"))).toBe(1)
        expect(eObject.eGet(feature("i64"))).toBe(0)
        expect(eObject.eGet(feature("i"))).toBe(-1)
        expect(new TextDecoder().decode(eObject.eGet(feature("bytes")) as Uint8Array)).toBe("bytes")
        expect(eObject.eGet(feature("b"))).toBe(true)
    })

    test("encode like go", () => {
        const resourceSet = new EResourceSetImpl()
        resourceSet.getPackageRegistry().registerPackage(ePackage)
        const eResource = resourceSet.createResource(new URI("testdata/alltypes.bin"))
        const eObject = ePackage.getEFactoryInstance().create(eClass)
        eObject.eSet(feature("f32"), 1.5)
        eObject.eSet(feature("i8"), 98)
        eObject.eSet(feature("i64"), 2 ** 60)
        eResource.eContents().add(eObject)
        const bytes = new BinaryEncoder(eResource, null).encode(eResource).unwrap()

        const after = (name: string) => bytes[Buffer.from(bytes).indexOf(name) + name.length]
        // go reads float32 features with DecodeFloat32, byte features with DecodeUint8 and int64 with DecodeInt64
        expect(after("f32")).toBe(0xca)
        expect(after("i8")).toBe(0xcc)
        expect(after("i64")).toBe(0xcf)

        const eDecoded = decodeResource(bytes)
        expect(eDecoded.eGet(feature("f32"))).toBe(1.5)
        expect(eDecoded.eGet(feature("i8"))).toBe(98)
        expect(eDecoded.eGet(feature("i64"))).toBe(2 ** 60)
    })

    test("decode byte encoded as string", () => {
        const bytes = new Uint8Array(fs.readFileSync("testdata/alltypes.bin"))
        // replace i8 value (uint8 'b') by the legacy string encoding "b"
        const ndx = Buffer.from(bytes).indexOf("i8") + 2
        expect(bytes[ndx]).toBe(0xcc)
        bytes[ndx] = 0xa1
        const eObject = decodeResource(bytes)
        expect(eObject.eGet(feature("i8"))).toBe("b".charCodeAt(0))
    })
})
