import { Uuid4 } from "id128"
import { BinaryEncoder } from "./BinaryEncoder"
import {
    BinaryOptions,
    EPackage,
    EResourceImpl,
    EResourceSetImpl,
    URI,
    ULIDManager,
    XMIProcessor,
    XMLOptions,
    XMLProcessor,
    uriToFilePath,
    UUIDManager,
} from "./internal"
import * as fs from "fs"

function loadPackage(filename: string): EPackage {
    let xmiProcessor = new XMIProcessor()
    let uri = new URI("testdata/" + filename)
    let resource = xmiProcessor.loadSync(uri)
    expect(resource.isLoaded).toBeTruthy()
    expect(resource.getErrors().isEmpty()).toBeTruthy()
    expect(resource.eContents().isEmpty()).toBeFalsy()
    return resource.eContents().get(0) as EPackage
}

describe("BinaryEncoder", () => {
    test("complex", () => {
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        let resourceURI = new URI("testdata/library.complex.xml")
        let expectedURI = new URI("testdata/library.complex.bin")
        let xmlProcessor = new XMLProcessor([ePackage])
        let eResource = xmlProcessor.loadSync(resourceURI)
        expect(eResource.isLoaded).toBeTruthy()
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(eResource.eContents().isEmpty()).toBeFalsy()
        let e = new BinaryEncoder(eResource)
        let r = e.encode(eResource)
        expect(r.isOk()).toBeTruthy()
        let expected = fs.readFileSync(uriToFilePath(expectedURI)).toString()
        let result = Buffer.from(r.unwrap()).toString()
        expect(result).toBe(expected)
    })

    test("complexWithID", () => {
        let ePackage = loadPackage("library.complex.ecore")
        expect(ePackage).not.toBeNull()
        let resourceURI = new URI("testdata/library.complex.id.xml")
        let expectedURI = new URI("testdata/library.complex.id.bin")

        let eResource = new EResourceImpl()
        let idManager = new UUIDManager()
        eResource.eObjectIDManager = idManager
        eResource.eURI = resourceURI

        let eResourceSet = new EResourceSetImpl()
        eResourceSet.getResources().add(eResource)
        eResourceSet.getPackageRegistry().registerPackage(ePackage)
        eResource.loadSync(new Map<string, any>([[XMLOptions.ID_ATTRIBUTE_NAME, "id"]]))
        expect(eResource.isLoaded).toBeTruthy()
        expect(eResource.getErrors().isEmpty()).toBeTruthy()
        expect(eResource.eContents().isEmpty()).toBeFalsy()

        let eDocumentRoot = eResource.eContents().get(0)
        expect(eDocumentRoot).not.toBeNull()
        expect(
            idManager.setID(eDocumentRoot, Uuid4.fromCanonical("dc48710b-0e2e-419f-94fb-178c7fc1370b")),
        ).toBeUndefined()

        let e = new BinaryEncoder(eResource, new Map<string, any>([[BinaryOptions.BINARY_OPTION_ID_ATTRIBUTE, true]]))
        let r = e.encode(eResource)
        expect(r.isOk()).toBeTruthy()
        let expected = fs.readFileSync(uriToFilePath(expectedURI)).toString()
        let result = Buffer.from(r.unwrap()).toString()
        expect(result).toBe(expected)
    })
})
