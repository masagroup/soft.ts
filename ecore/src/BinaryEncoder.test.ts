import { BinaryEncoder } from "./BinaryEncoder";
import { EPackage, URI, XMIProcessor, XMLProcessor } from "./internal";
import * as fs from "fs";
import * as url from "url";

function loadPackage(filename: string): EPackage {
    let xmiProcessor = new XMIProcessor();
    let uri = new URI("file:///" + __dirname + "/../testdata/" + filename);
    let resource = xmiProcessor.loadSync(uri);
    expect(resource.isLoaded).toBeTruthy();
    expect(resource.getErrors().isEmpty()).toBeTruthy();
    expect(resource.eContents().isEmpty()).toBeFalsy();
    return resource.eContents().get(0) as EPackage;
}

describe("BinaryEncoder", () => {
    test("complex", () => {
        // package
        // let ePackage = loadPackage("library.complex.ecore");
        // expect(ePackage).not.toBeNull();
        // let resourceURI = url.pathToFileURL("testdata/library.complex.xml")
        // let t = resourceURI.toString()
        // //let resourceURI = new URI("file:///" + __dirname + "/../testdata/library.complex.xml");
        // //let resourceURI = new URI("file://testdata/library.complex.xml");
        // let expectedURI = new URI("file:///" + __dirname + "/../testdata/library.complex.bin")
        // let xmlProcessor = new XMLProcessor([ePackage]);
        // let eResource = xmlProcessor.loadSync(resourceURI)
        // expect(eResource.isLoaded).toBeTruthy();
        // expect(eResource.getErrors().isEmpty()).toBeTruthy();
        // expect(eResource.eContents().isEmpty()).toBeFalsy();
        // let e = new BinaryEncoder(eResource)
        // let r = e.encode(eResource)
        // expect(r.ok).toBeTruthy()
        // let expected = fs.readFileSync(expectedURI).toString()
        // let result = Buffer.from(r.unwrap()).toString()
        // expect(result).toBe(expected);
    });
});
