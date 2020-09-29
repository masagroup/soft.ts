// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import { EAttribute, EClass, EClassifier, EPackage, EReference, XMIResource } from "./internal";

describe("XMIResource", () => {
    describe("load", () => {
        let resource = new XMIResource();
        resource.eURI = new URL("file:///" + __dirname + "/../testdata/bookStore.ecore");
    
        beforeEach(() => {
            resource.unload();
            expect(resource.isLoaded).toBeFalsy();
        })
    
        afterEach(() => {
            expect(resource.isLoaded).toBeTruthy();
            expect(resource.getErrors().isEmpty()).toBeTruthy();
            expect(resource.getWarnings().isEmpty()).toBeTruthy();
            expect(resource.xmiVersion).toBe("2.0");

            let contents = resource.eContents();
            expect(contents.size()).toBe(1);
    
            let ePackage = contents.get(0) as EPackage;
            expect(ePackage).not.toBeNull();
            expect(ePackage.name).toBe("BookStorePackage");
            expect(ePackage.nsPrefix).toBe("bookStore");
            expect(ePackage.nsURI).toBe("http:///com.ibm.dynamic.example.bookStore.ecore");

            let eClassifiers = ePackage.eClassifiers;
            expect(eClassifiers.size()).toBe(2);

            let eBookStore = eClassifiers.get(0) as EClassifier;
            expect(eBookStore).not.toBeNull();
            expect(eBookStore.name).toBe("BookStore");

            let eBookStoreClass = eBookStore as EClass;
            expect(eBookStoreClass).not.toBeNull();
            expect(eBookStoreClass.getFeatureCount()).toBe(3);

            let eOwnerAttribute = eBookStoreClass.getEStructuralFeature(0) as EAttribute;
            expect(eOwnerAttribute.name).toBe("owner");
            let eOwnerAttributeType = eOwnerAttribute.eAttributeType;
            expect(eOwnerAttributeType.name).toBe("EString");

            let eLocationAttribute = eBookStoreClass.getEStructuralFeature(1) as EAttribute;
            expect(eLocationAttribute.name).toBe("location");
            let eLocationType = eLocationAttribute.eAttributeType;
            expect(eLocationType).not.toBeNull();

            let eBooksReference = eBookStoreClass.getEStructuralFeature(2) as EReference;
            expect(eBooksReference.name).toBe("books");
	
            let eBookClass = eClassifiers.get(1) as EClass;
            expect(eBookClass.name).toBe("Book");
            expect(eBookClass.getFeatureCount()).toBe(2);

            let eNameAttribute = eBookClass.getEStructuralFeature(0) as EAttribute;
            expect(eNameAttribute.name).toBe("name");
	

            let eISBNFeature = eBookClass.getEStructuralFeature(1) as EAttribute;
            expect(eISBNFeature.name).toBe("isbn");
	
            // check resolved reference
            expect(eBooksReference.eReferenceType).toBe(eBookClass);
        })
    
        test("loadStream", async () => {
            let stream = fs.createReadStream(resource.eURI);
            await resource.loadFromStream(stream);         
        });
    
        test("load", async () => {
            await resource.load();
        });
    });
    
});
