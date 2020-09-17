// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { instance, mock, verify, when } from "ts-mockito";
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

