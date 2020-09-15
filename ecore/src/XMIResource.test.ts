// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import test from "ava";
import { XMIResource } from "./XMIResource";

test('loadSimple', t => {
    let resource = new XMIResource();
    resource.eURI = new URL("file:///" + __dirname + "/../testdata/bookStore.ecore");
    resource.load();
    t.true(resource.isLoaded);
    t.true(resource.getErrors().isEmpty());
    t.true(resource.getWarnings().isEmpty());
});