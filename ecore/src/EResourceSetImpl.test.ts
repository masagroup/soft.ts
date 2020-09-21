// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { anything, instance, mock, verify, when } from "ts-mockito";
import { EObject } from "./EObject";
import { EResourceFactory } from "./EResourceFactory";
import { EResourceFactoryRegistry } from "./EResourceFactoryRegistry";
import { EResourceImpl } from "./EResourceImpl";
import { EResourceInternal } from "./EResourceInternal";
import { EResourceSetImpl } from "./EResourceSetImpl";

describe("EResourceSetImpl", () => {
    test("constructor", () => {
        let rs = new EResourceSetImpl();
        expect(rs.getURIResourceMap()).toBeNull();
    });

    test("resourcesWithMock", () => {
        let rs = new EResourceSetImpl();
        let mockEResource = mock<EResourceInternal>();
        let eResource = instance(mockEResource);
        when(mockEResource.basicSetResourceSet(rs, null)).thenReturn(null);
        expect(rs.getResources().add(eResource)).toBeTruthy();
    });

    test("resourcesNoMock", () => {
        let rs = new EResourceSetImpl();
        let r = new EResourceImpl();

        rs.getResources().add(r);
        expect(r.eResourceSet()).toBe(rs);
    });

    test("getResource", () => {
        let mockEResourceFactoryRegitry = mock<EResourceFactoryRegistry>();
        let mockEResourceFactory = mock<EResourceFactory>();
        let mockEResource = mock<EResourceInternal>();
        let eResource = instance(mockEResource);
        let eResourceFactory = instance(mockEResourceFactory);
        let eResourceFactoryRegistry = instance(mockEResourceFactoryRegitry);
        let uriResource = new URL("test://file.t");
        let rs = new EResourceSetImpl();
        rs.setResourceFactoryRegistry(eResourceFactoryRegistry);

        when(mockEResourceFactoryRegitry.getFactory(uriResource)).thenReturn(eResourceFactory);
        when(mockEResourceFactory.createResource(uriResource)).thenReturn(eResource);
        when(mockEResource.basicSetResourceSet(rs, null)).thenReturn(null);

        expect(rs.getResource(uriResource, true)).toBe(eResource);

        verify(mockEResource.load()).once();
    });

    test("getEObject", () => {
        let mockEResourceFactoryRegitry = mock<EResourceFactoryRegistry>();
        let mockEResourceFactory = mock<EResourceFactory>();
        let mockEResource = mock<EResourceInternal>();
        let mockEObject = mock<EObject>();
        let eResource = instance(mockEResource);
        let eResourceFactory = instance(mockEResourceFactory);
        let eResourceFactoryRegistry = instance(mockEResourceFactoryRegitry);
        let eObject = instance(mockEObject);
        let uriObject = new URL("test://file.t#//@first/second");
        let uriResource = new URL("test://file.t");
        let rs = new EResourceSetImpl();
        rs.setResourceFactoryRegistry(eResourceFactoryRegistry);

        when(mockEResourceFactoryRegitry.getFactory(anything())).thenReturn(eResourceFactory);
        when(mockEResourceFactory.createResource(anything())).thenReturn(eResource);
        when(mockEResource.basicSetResourceSet(rs, null)).thenReturn(null);
        when(mockEResource.getEObject("//@first/second")).thenReturn(eObject);

        expect(rs.getEObject(uriObject, true)).toBe(eObject);

        verify(mockEResource.load()).once();
    });
});
