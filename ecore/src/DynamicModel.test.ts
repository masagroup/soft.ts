// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    EAttribute,
    EClass,
    EFactory,
    EList,
    EObject,
    EPackage,
    EReference,
    getEcoreFactory,
    getEcorePackage,
    UNBOUNDED_MULTIPLICITY
} from "./internal.js"

class DynamicMetaModel {
    bookStoreEPackage: EPackage
    bookStoreEFactory: EFactory
    bookStoreEClass: EClass
    bookStoreOwner: EAttribute
    bookStoreLocation: EAttribute
    bookStoreBooks: EReference
    bookEClass: EClass
    bookName: EAttribute
    bookISBN: EAttribute

    constructor() {
        /*
         * Create EClass instance to model BookStore class
         */
        this.bookStoreEClass = getEcoreFactory().createEClass()

        /*
         * Create EClass instance to model Book class
         */
        this.bookEClass = getEcoreFactory().createEClass()

        /*
         * Instantiate EPackage and provide unique URI
         * to identify this package
         */
        this.bookStoreEFactory = getEcoreFactory().createEFactory()

        this.bookStoreEPackage = getEcoreFactory().createEPackage()
        this.bookStoreEPackage.name = "BookStorePackage"
        this.bookStoreEPackage.nsPrefix = "bookStore"
        this.bookStoreEPackage.nsURI = "http:///cothis.ibthis.dynamic.example.bookstore.ecore"
        this.bookStoreEPackage.eFactoryInstance = this.bookStoreEFactory

        /*
         * Create attributes for BookStore class as specified in the model
         */
        this.bookStoreOwner = getEcoreFactory().createEAttribute()
        this.bookStoreOwner.name = "owner"
        this.bookStoreOwner.eType = getEcorePackage().getEString()

        this.bookStoreLocation = getEcoreFactory().createEAttribute()
        this.bookStoreLocation.name = "location"
        this.bookStoreLocation.eType = getEcorePackage().getEString()

        this.bookStoreBooks = getEcoreFactory().createEReference()
        this.bookStoreBooks.name = "books"
        this.bookStoreBooks.eType = this.bookEClass
        this.bookStoreBooks.upperBound = UNBOUNDED_MULTIPLICITY
        this.bookStoreBooks.isContainment = true

        /*
         * Create attributes for Book class as defined in the model
         */
        this.bookName = getEcoreFactory().createEAttribute()
        this.bookName.name = "name"
        this.bookName.eType = getEcorePackage().getEString()

        this.bookISBN = getEcoreFactory().createEAttribute()
        this.bookISBN.name = "isbn"
        this.bookISBN.eType = getEcorePackage().getEInt()

        /*
         * Add owner, location and books attributes/references
         * to BookStore class
         */
        this.bookStoreEClass.eStructuralFeatures.add(this.bookStoreOwner)
        this.bookStoreEClass.eStructuralFeatures.add(this.bookStoreLocation)
        this.bookStoreEClass.eStructuralFeatures.add(this.bookStoreBooks)

        /*
         * Add name and isbn attributes to Book class
         */
        this.bookEClass.eStructuralFeatures.add(this.bookName)
        this.bookEClass.eStructuralFeatures.add(this.bookISBN)

        /*
         * Place BookStore and Book classes in bookStoreEPackage
         */
        this.bookStoreEPackage.eClassifiers.add(this.bookStoreEClass)
        this.bookStoreEPackage.eClassifiers.add(this.bookEClass)
    }
}

class DynamicModel {
    mm: DynamicMetaModel
    bookObject: EObject
    bookStoreObject: EObject

    constructor(mm: DynamicMetaModel) {
        this.mm = mm

        let bookFactoryInstance = mm.bookStoreEPackage.eFactoryInstance
        /*
         * Create dynamic instance of BookStoreEClass and BookEClass
         */
        this.bookObject = bookFactoryInstance.create(mm.bookEClass)
        this.bookStoreObject = bookFactoryInstance.create(mm.bookStoreEClass)

        /*
         * Set the values of bookStoreObject attributes
         */
        this.bookStoreObject.eSet(mm.bookStoreOwner, "David Brown")
        this.bookStoreObject.eSet(mm.bookStoreLocation, "Street#12, Top Town, NY")
        let allBooks = this.bookStoreObject.eGet(mm.bookStoreBooks) as EList<EObject>
        allBooks.add(this.bookObject)

        /*
         * Set the values of bookObject attributes
         */
        this.bookObject.eSet(mm.bookName, "Harry Potter and the Deathly Hallows")
        this.bookObject.eSet(mm.bookISBN, 157221)
    }
}

describe("DynamicModel", () => {
    test("instance", () => {
        let mm = new DynamicMetaModel()
        let m = new DynamicModel(mm)

        expect(mm.bookStoreEClass).toBe(m.bookStoreObject.eClass())
        expect(mm.bookEClass).toBe(m.bookObject.eClass())
        /*
         * Read/Get the values of bookStoreObject attributes
         */
        expect(m.bookStoreObject.eGet(mm.bookStoreOwner)).toBe("David Brown")
        expect(m.bookStoreObject.eGet(mm.bookStoreLocation)).toBe("Street#12, Top Town, NY")

        /*
         * Read/Get the values of bookObject attributes
         */
        expect(m.bookObject.eGet(mm.bookName)).toBe("Harry Potter and the Deathly Hallows")
        expect(m.bookObject.eGet(mm.bookISBN)).toBe(157221)
    })
})
