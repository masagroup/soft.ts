// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { anything, instance, mock, verify, when } from "ts-mockito";
import { EObject, EResourceFactory, EResourceFactoryRegistry, EResourceInternal, EResourceSetImpl, EResourceImpl } from "./internal";

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

        verify(mockEResource.loadSync()).once();
    });
    
    test('getRegisteredResource', () => {
        let uriResource = new URL("test://file.t");
        let rs = new EResourceSetImpl();
    
        // register resource
        let mockEResource = mock<EResourceInternal>();
        let eResource = instance(mockEResource);
        when(mockEResource.basicSetResourceSet(rs, null)).thenReturn(null);
        rs.getResources().add(eResource);
    
        // get registered resource - no loading
        when(mockEResource.eURI).thenReturn(uriResource);
        expect(rs.getResource(uriResource,false)).toBe(eResource);
    
        // get registered resource - loading
        when(mockEResource.isLoaded).thenReturn(false);
        expect(rs.getResource(uriResource,true)).toBe(eResource);
        verify(mockEResource.loadSync()).once();
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

        verify(mockEResource.loadSync()).once();
    });
});
