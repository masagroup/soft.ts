import { EFactoryExt, EPackage, XMIProcessor, XMLProcessor } from "./internal";

function loadPackage(filename: string): EPackage {
    let xmiProcessor = new XMIProcessor();
    let uri = new URL("file:///" + __dirname + "/../testdata/" + filename);
    let resource = xmiProcessor.loadSync(uri);
    expect(resource.isLoaded).toBeTruthy();
    expect(resource.getErrors().isEmpty()).toBeTruthy();
    expect(resource.eContents().isEmpty()).toBeFalsy();
    let ePackage = resource.eContents().get(0) as EPackage;
    ePackage.eFactoryInstance = new EFactoryExt();
    return ePackage;
}

describe("BinaryCodec", () => {
    test("load.complex", () => {
        let ePackage = loadPackage("library.complex.ecore");
        expect(ePackage).not.toBeNull();
        let xmlProcessor = new XMLProcessor([ePackage]);
        expect(xmlProcessor).not.toBeNull();
        let resourceURI = new URL("file:///" + __dirname + "/../testdata/library.complex.bin");
        let resource = xmlProcessor.loadSync(resourceURI);
        expect(resource.isLoaded).toBeTruthy();
        expect(resource.getErrors().isEmpty()).toBeTruthy();
        expect(resource.eContents().isEmpty()).toBeFalsy();
    });
});
