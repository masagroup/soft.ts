import { EObject } from "./EObject";
import { EReference } from "./EReference";
import { EFactoryExt, EPackage, XMIProcessor, XMLProcessor, EClass, EAttribute, EList } from "./internal";

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
    test("load.resource.complex", () => {
        let ePackage = loadPackage("library.complex.ecore");
        expect(ePackage).not.toBeNull();
        let xmlProcessor = new XMLProcessor([ePackage]);
        expect(xmlProcessor).not.toBeNull();
        let resourceURI = new URL("file:///" + __dirname + "/../testdata/library.complex.bin");
        let resource = xmlProcessor.loadSync(resourceURI);
        expect(resource.isLoaded).toBeTruthy();
        expect(resource.getErrors().isEmpty()).toBeTruthy();
        expect(resource.eContents().isEmpty()).toBeFalsy();

        // retrieve document root class , library class & library name attribute
        let eDocumentRootClass = ePackage.getEClassifier("DocumentRoot") as EClass;
        expect(eDocumentRootClass).not.toBeNull()
        let eDocumentRootLibraryFeature = eDocumentRootClass.getEStructuralFeatureFromName("library") as EReference;
        expect(eDocumentRootLibraryFeature).not.toBeNull()
        let eLibraryClass = ePackage.getEClassifier("Library") as EClass
        expect(eLibraryClass).not.toBeNull()
        let eLibraryNameAttribute = eLibraryClass.getEStructuralFeatureFromName("name") as EAttribute;
        expect(eLibraryNameAttribute).not.toBeNull()

        // check library name
        let eDocumentRoot = resource.eContents().get(0);
        expect(eDocumentRoot).not.toBeNull()
        let eLibrary = eDocumentRoot.eGet(eDocumentRootLibraryFeature) as EObject;
        expect(eLibrary).not.toBeNull()
        expect(eLibrary.eGet(eLibraryNameAttribute)).toBe("My Library")
        
        // book class and attributes
        let eLibraryBooksRefeference = eLibraryClass.getEStructuralFeatureFromName("books") as EReference;
        expect(eLibraryBooksRefeference).not.toBeNull()
        let eBookClass = ePackage.getEClassifier("Book") as EClass;
        expect(eBookClass).not.toBeNull()
        let eBookTitleAttribute = eBookClass.getEStructuralFeatureFromName("title") as EAttribute;
        expect(eBookTitleAttribute).not.toBeNull()
        let eBookDateAttribute = eBookClass.getEStructuralFeatureFromName("publicationDate") as EAttribute;
        expect(eBookDateAttribute).not.toBeNull()
        let eBookCategoryAttribute = eBookClass.getEStructuralFeatureFromName("category") as EAttribute;
        expect(eBookCategoryAttribute).not.toBeNull()
        let eBookAuthorReference = eBookClass.getEStructuralFeatureFromName("author") as EAttribute;
        expect(eBookAuthorReference).not.toBeNull()

        // retrive book
        let eBooks = eLibrary.eGet(eLibraryBooksRefeference) as EList<EObject>;
        expect(eBooks).not.toBeNull()
        let eBook = eBooks.get(0);
        expect(eBook).not.toBeNull()
       
        // check book name
        expect(eBook.eGet(eBookTitleAttribute)).toBe("Title 0");

        // check book date
        let date = eBook.eGet(eBookDateAttribute) as Date;
        expect(date).not.toBeNull()
        //assert.Equal(t, time.Date(2015, time.September, 6, 4, 24, 46, 0, time.UTC), *date)

        // check book category
        let category = eBook.eGet(eBookCategoryAttribute)
        expect(category).toBe(2);

        // check author
        let author = eBook.eGet(eBookAuthorReference) as EObject;
        expect(author).not.toBeNull()

        let eWriterClass = ePackage.getEClassifier("Writer") as EClass;
        expect(eWriterClass).not.toBeNull()
        let eWriterNameAttribute = eWriterClass.getEStructuralFeatureFromName("firstName") as EAttribute;
        expect(eWriterNameAttribute).not.toBeNull()
        expect(author.eGet(eWriterNameAttribute)).toBe("First Name 0");
    });
});
