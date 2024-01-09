import { BinaryDecoder } from "./BinaryDecoder";
import { EPackage, EResourceImpl, EResourceSetImpl, XMIProcessor, XMLProcessor } from "./internal";

import * as fs from "fs";

function loadPackage(filename: string): EPackage {
    let xmiProcessor = new XMIProcessor();
    let uri = new URL("file:///" + __dirname + "/../testdata/" + filename);
    let resource = xmiProcessor.loadSync(uri);
    expect(resource.isLoaded).toBeTruthy();
    expect(resource.getErrors().isEmpty()).toBeTruthy();
    expect(resource.eContents().isEmpty()).toBeFalsy();
    return resource.eContents().get(0) as EPackage;
}

describe("BinaryDecoder", () => {
    describe("complex", () => {
        test("decodeAsync", async () => {
            // package
            let ePackage = loadPackage("library.complex.ecore");
            expect(ePackage).not.toBeNull();
            let resourceURI = new URL("file:///" + __dirname + "/../testdata/library.complex.bin");

            // context
            let eResource = new EResourceImpl();
            eResource.eURI = resourceURI;
            let eResourceSet = new EResourceSetImpl();
            eResourceSet.getResources().add(eResource);
            eResourceSet.getPackageRegistry().registerPackage(ePackage);

            let stream = fs.createReadStream(resourceURI);
            let decoder = new BinaryDecoder(eResource, null);
            let resource = await decoder.decodeAsync(stream);
            expect(resource).toEqual(eResource);
        });
    });
});
