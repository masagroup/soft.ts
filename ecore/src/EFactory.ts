// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group                                                 
//                                                                              
// This Source Code Form is subject to the terms of the Mozilla Public          
// License, v. 2.0. If a copy of the MPL was not distributed with this          
// file, You can obtain one at https://mozilla.org/MPL/2.0/.                    
//                                                                              
// *****************************************************************************


import {
    EClass,
    EDataType,
    EModelElement,
    EObject,
    EPackage,
} from "./internal"


export interface EFactory extends EModelElement
{
    // References
    ePackage : EPackage
    
    // Operations
    create(eClass : EClass) : EObject;
    createFromString(eDataType : EDataType, literalValue : string) : any;
    convertToString(eDataType : EDataType, instanceValue : any) : string;
    
}

