// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { anything, deepEqual, instance, mock, strictEqual, verify, when } from "ts-mockito";
import { EObject } from "./EObject";
import { EResourceFactory } from "./EResourceFactory";
import { EResourceFactoryRegistry } from "./EResourceFactoryRegistry";
import { EResourceImpl } from "./EResourceImpl";
import { EResourceInternal } from "./EResourceInternal";
import { EResourceSetImpl } from "./EResourceSetImpl";

test("constructor", (t) => {
    let rs = new EResourceSetImpl();
    t.true( rs.getURIResourceMap() == null );
});

test("resourcesWithMock", (t) => {
    let rs = new EResourceSetImpl();
    let mockEResource = mock<EResourceInternal>();
    let eResource = instance(mockEResource);
    when(mockEResource.basicSetResourceSet(rs,null)).thenReturn(null);
    t.true( rs.getResources().add(eResource) );
});

test("resourcesNoMock", (t) => {
    let rs = new EResourceSetImpl();
    let r = new EResourceImpl();

    rs.getResources().add(r);
    t.is(r.eResourceSet() , rs ); 
});

test("getResource", (t) => {
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
    when(mockEResource.basicSetResourceSet(rs,null)).thenReturn(null);
    
    t.is(rs.getResource(uriResource,true), eResource);

    verify(mockEResource.load()).once();
    
});



test("getEObject", (t) => {
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
    when(mockEResource.basicSetResourceSet(rs,null)).thenReturn(null);
    when(mockEResource.getEObject("//@first/second")).thenReturn(eObject);

    t.is(rs.getEObject(uriObject,true), eObject);

    verify(mockEResource.load()).once();   
});
