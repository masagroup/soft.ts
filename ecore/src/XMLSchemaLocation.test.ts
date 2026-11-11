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
    EMap,
    EModelElement,
    EObject,
    EPackage,
    EReference,
    EResource,
    EResourceImpl,
    EResourceSet,
    EResourceSetImpl,
    ExtendedMetaData,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY,
    URI,
    XMLOptions
} from "./internal.js"

const annotationURI = "http:///org/eclipse/emf/ecore/util/ExtendedMetaData"

// a library package of namespace http://lib with a document root holding the prefixes and the
// schemas of a document
class DocumentRootModel {
    ePackage: EPackage
    library: EClass
    book: EClass
    name: EAttribute
    books: EReference
    documentRoot: EClass
    prefixMap: EReference
    schemaLocation: EReference
    rootLibrary: EReference

    constructor(qualified: boolean = true) {
        const f = getEcoreFactory()
        const setMetaData = (eElement: EModelElement, details: Record<string, string>) => {
            const eAnnotation = f.createEAnnotation()
            eAnnotation.setSource(annotationURI)
            for (const [key, value] of Object.entries(details)) {
                eAnnotation.getDetails().put(key, value)
            }
            eElement.getEAnnotations().add(eAnnotation)
        }
        this.ePackage = f.createEPackage()
        this.ePackage.setName("lib")
        this.ePackage.setNsPrefix("lib")
        this.ePackage.setNsURI("http://lib")
        this.ePackage.setEFactoryInstance(f.createEFactory())
        if (!qualified) {
            setMetaData(this.ePackage, { qualified: "false" })
        }

        this.book = f.createEClass()
        this.book.setName("Book")
        const bookName = f.createEAttribute()
        bookName.setName("name")
        bookName.setEType(getEcorePackage().getEString())
        this.book.getEStructuralFeatures().add(bookName)
        this.ePackage.getEClassifiers().add(this.book)

        this.library = f.createEClass()
        this.library.setName("Library")
        this.name = f.createEAttribute()
        this.name.setName("name")
        this.name.setEType(getEcorePackage().getEString())
        this.library.getEStructuralFeatures().add(this.name)
        this.books = f.createEReference()
        this.books.setName("books")
        this.books.setEType(this.book)
        this.books.setContainment(true)
        this.books.setUpperBound(UNBOUNDED_MULTIPLICITY)
        this.library.getEStructuralFeatures().add(this.books)
        this.ePackage.getEClassifiers().add(this.library)

        const newReference = (name: string, eType: EClass, details: Record<string, string>): EReference => {
            const eReference = f.createEReference()
            eReference.setName(name)
            eReference.setEType(eType)
            eReference.setContainment(true)
            setMetaData(eReference, details)
            this.documentRoot.getEStructuralFeatures().add(eReference)
            return eReference
        }
        this.documentRoot = f.createEClass()
        this.documentRoot.setName("DocumentRoot")
        setMetaData(this.documentRoot, { name: "" })
        this.ePackage.getEClassifiers().add(this.documentRoot)
        this.prefixMap = newReference("xMLNSPrefixMap", getEcorePackage().getEStringToStringMapEntry(), { name: "xmlns:prefix" })
        this.prefixMap.setUpperBound(UNBOUNDED_MULTIPLICITY)
        this.prefixMap.setTransient(true)
        this.schemaLocation = newReference("xSISchemaLocation", getEcorePackage().getEStringToStringMapEntry(), {
            name: "xsi:schemaLocation"
        })
        this.schemaLocation.setUpperBound(UNBOUNDED_MULTIPLICITY)
        this.schemaLocation.setTransient(true)
        this.rootLibrary = newReference("library", this.library, { name: "library", namespace: "##targetNamespace" })
    }

    // newResourceSet returns a resource set knowing the package; an unqualified package is also the
    // package of the documents without namespace
    newResourceSet(): EResourceSet {
        const rs = new EResourceSetImpl()
        const registry = rs.getPackageRegistry()
        registry.registerPackage(this.ePackage)
        if (!new ExtendedMetaData().isQualified(this.ePackage)) {
            const getPackage = registry.getPackage.bind(registry)
            const getFactory = registry.getFactory.bind(registry)
            registry.getPackage = (nsURI: string) => (nsURI == "" ? this.ePackage : getPackage(nsURI))
            registry.getFactory = (nsURI: string) => (nsURI == "" ? this.ePackage.getEFactoryInstance() : getFactory(nsURI))
        }
        return rs
    }
}

function options(entries: [string, any][] = []): Map<string, any> {
    return new Map<string, any>([[XMLOptions.EXTENDED_META_DATA, new ExtendedMetaData()], ...entries])
}

function decode(eResource: EResource, document: string): EObject {
    eResource.loadFromString(document, options())
    expect(
        eResource
            .getErrors()
            .toArray()
            .map((e) => e.message)
    ).toEqual([])
    expect(eResource.eContents().size()).toBe(1)
    return eResource.eContents().get(0)
}

function encode(eResource: EResource, opts: Map<string, any> = options()): string {
    const document = eResource.saveToString(opts)
    expect(
        eResource
            .getErrors()
            .toArray()
            .map((e) => e.message)
    ).toEqual([])
    return document
}

// putInResource puts a package in a resource at uri, as a package loaded from a file
function putInResource(ePackage: EPackage, uri: string) {
    const eResource = new EResourceImpl()
    eResource.setURI(new URI(uri))
    eResource.eContents().add(ePackage)
}

describe("XML schema location", () => {
    test("isQualified", () => {
        const emd = new ExtendedMetaData()
        expect(emd.isQualified(new DocumentRootModel().ePackage)).toBe(true)
        expect(emd.isQualified(new DocumentRootModel(false).ePackage)).toBe(false)
    })

    // the xsi:schemaLocation of a document is recorded in its document root and written back, as EMF
    // does: a document that names the schema of its namespace keeps naming it
    test("the document root keeps xsi:schemaLocation", () => {
        const m = new DocumentRootModel()
        const document = `<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://lib schemas/1.0/lib.xsd" name="l"/>
`
        const eResource = m.newResourceSet().createResource(new URI("library.xml"))
        const root = decode(eResource, document)
        expect((root.eGet(m.schemaLocation) as EMap<string, string>).getValue("http://lib")).toBe("schemas/1.0/lib.xsd")
        expect(encode(eResource)).toBe(document)
    })

    // a document that names no schema leaves the map unbuilt
    test("a document without schema leaves the map unset", () => {
        const m = new DocumentRootModel()
        const eResource = m.newResourceSet().createResource(new URI("library.xml"))
        const root = decode(eResource, `<lib:library xmlns:lib="http://lib" name="l"/>`)
        expect(root.eIsSet(m.schemaLocation)).toBe(false)
    })

    // a document without namespace keeps its xsi:noNamespaceSchemaLocation, recorded in its document
    // root under "", and is written back without namespace
    test("a document without namespace keeps xsi:noNamespaceSchemaLocation", () => {
        const m = new DocumentRootModel(false)
        const document = `<?xml version="1.0" encoding="UTF-8"?>
<library xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="schemas/1.0/lib.xsd" name="l">
  <books name="b"/>
</library>
`
        const eResource = m.newResourceSet().createResource(new URI("library.xml"))
        const root = decode(eResource, document)
        expect((root.eGet(m.schemaLocation) as EMap<string, string>).getValue("")).toBe("schemas/1.0/lib.xsd")
        expect(encode(eResource)).toBe(document)
    })

    // a document of a package that is not qualified, and that names no schema without namespace,
    // keeps its namespace: the package is written qualified, as before
    test("an unqualified package of a document with namespace stays qualified", () => {
        const m = new DocumentRootModel(false)
        const document = `<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://lib schemas/1.0/lib.xsd" name="l"/>
`
        const eResource = m.newResourceSet().createResource(new URI("library.xml"))
        decode(eResource, document)
        expect(encode(eResource)).toBe(document)
    })

    // the SCHEMA_LOCATION option names the schemas of a document a save writes, over the ones its
    // document root records, and leaves the document root as it is
    test("the option names the schemas", () => {
        const m = new DocumentRootModel()
        const eResource = m.newResourceSet().createResource(new URI("library.xml"))
        const root = decode(
            eResource,
            `<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://lib schemas/1.0/lib.xsd" name="l"/>
`
        )
        const locations = new Map([
            ["http://other", "other.xsd"],
            ["http://lib", "schemas/2.0/lib.xsd"]
        ])
        expect(encode(eResource, options([[XMLOptions.SCHEMA_LOCATION, locations]]))).toBe(
            `<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://lib schemas/2.0/lib.xsd http://other other.xsd" name="l"/>
`
        )
        // a record is read as a map
        expect(encode(eResource, options([[XMLOptions.SCHEMA_LOCATION, { "http://lib": "lib.xsd" }]]))).toContain(
            `xsi:schemaLocation="http://lib lib.xsd"`
        )
        // an empty option writes no schema; xmlns:xsi is still declared by the prefix map of the document
        expect(encode(eResource, options([[XMLOptions.SCHEMA_LOCATION, new Map()]]))).toBe(
            `<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" name="l"/>
`
        )
        expect((root.eGet(m.schemaLocation) as EMap<string, string>).getValue("http://lib")).toBe("schemas/1.0/lib.xsd")
    })

    // the SCHEMA_LOCATION option with a schema without namespace writes a document without namespace
    // from a document with one: its xsi:noNamespaceSchemaLocation, or none for an empty location
    test("the option names a schema without namespace", () => {
        const m = new DocumentRootModel(false)
        const eResource = m.newResourceSet().createResource(new URI("library.xml"))
        decode(eResource, `<lib:library xmlns:lib="http://lib" name="l"><books name="b"/></lib:library>`)
        expect(encode(eResource, options([[XMLOptions.SCHEMA_LOCATION, new Map([["", "lib.xsd"]])]]))).toBe(
            `<?xml version="1.0" encoding="UTF-8"?>
<library xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="lib.xsd" name="l">
  <books name="b"/>
</library>
`
        )
        expect(encode(eResource, options([[XMLOptions.SCHEMA_LOCATION, new Map([["", ""]])]]))).toBe(
            `<?xml version="1.0" encoding="UTF-8"?>
<library name="l">
  <books name="b"/>
</library>
`
        )
    })

    // the SCHEMA_LOCATION option true writes the location of the packages of the document, as EMF:
    // the uri of the resource of a package, relative to the document, and none for a package without
    // resource or registered at its namespace
    test("the option true writes the location of the packages", () => {
        const m = new DocumentRootModel()
        const eResource = m.newResourceSet().createResource(new URI("file:///data/library.xml"))
        decode(eResource, `<lib:library xmlns:lib="http://lib" name="l"/>`)
        const declare = options([[XMLOptions.SCHEMA_LOCATION, true]])

        // a package without resource
        expect(encode(eResource, declare)).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" name="l"/>
`)

        // a package loaded from a file
        putInResource(m.ePackage, "file:///data/schemas/lib.ecore")
        expect(encode(eResource, declare)).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://lib schemas/lib.ecore" name="l"/>
`)
        // false writes none
        expect(encode(eResource, options([[XMLOptions.SCHEMA_LOCATION, false]]))).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" name="l"/>
`)

        // a package registered at its namespace, as a generated package is
        putInResource(m.ePackage, "http://lib")
        expect(encode(eResource, declare)).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<lib:library xmlns:lib="http://lib" name="l"/>
`)
    })

    // the SCHEMA_LOCATION option true keeps the schemas a document names, and gives a location to the
    // schema without namespace it names without one
    test("the option true keeps the schemas of the document", () => {
        const m = new DocumentRootModel(false)
        putInResource(m.ePackage, "file:///data/schemas/lib.ecore")
        const eResource = m.newResourceSet().createResource(new URI("file:///data/library.xml"))
        const root = decode(
            eResource,
            `<library xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="lib.xsd" name="l"/>`
        )
        const declare = options([[XMLOptions.SCHEMA_LOCATION, true]])
        expect(encode(eResource, declare)).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<library xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="lib.xsd" name="l"/>
`)

        ;(root.eGet(m.schemaLocation) as EMap<string, string>).put("", "")
        expect(encode(eResource, declare)).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<library xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="schemas/lib.ecore" name="l"/>
`)
    })
})
