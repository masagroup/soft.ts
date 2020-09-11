// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { EObject } from "./EObject";

export interface EResourceIDManager {
    register(object : EObject) : void;
	unRegister(object : EObject) : void;

	getID(object :EObject) : string;
	getEObject(id : string) : EObject;
}