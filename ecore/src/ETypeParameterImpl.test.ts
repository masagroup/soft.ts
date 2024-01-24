// Code generated by soft.generator.ts. DO NOT EDIT.

// *****************************************************************************
// Copyright(c) 2024 MASA Group                                                 
//                                                                              
// This Source Code Form is subject to the terms of the Mozilla Public          
// License, v. 2.0. If a copy of the MPL was not distributed with this          
// file, You can obtain one at https://mozilla.org/MPL/2.0/.                    
//                                                                              
// *****************************************************************************


import * as deepEqual from "deep-equal";
import { anything , capture, instance, mock, reset, verify, when } from "ts-mockito";
import {
    EAdapter,
    EGenericType,
    EList,
    ENamedElement,
    ENotificationChain,
    ENotifyingList,
    EOPPOSITE_FEATURE_BASE,
    EObject,
    EObjectInternal,
    EObjectList,
    EResource,
    EResourceSet,
    ETypeParameterImpl,
    EcoreConstants,
    ImmutableEList,
    URI,
    getEcorePackage,
    isEObjectList,
} from "./internal"


interface EGenericTypeInternal extends EGenericType, EObjectInternal {} 

describe("ETypeParameterImpl", () => {
	
	test("eStaticClass", () => {
        let o = new ETypeParameterImpl()
		expect(o.eStaticClass()).toBe(getEcorePackage().getETypeParameter())
    });

	
	test("getEBounds", () => {
		let o = new ETypeParameterImpl()
		expect(o.eBounds).not.toBeNull()
	})
	
	
	
	
	test("eGetFromID", () => {
		let o = new ETypeParameterImpl()
		expect(() => o.eGetFromID(-1,true)).toThrow(Error)
		expect(o.eGetFromID(EcoreConstants.ETYPE_PARAMETER__EBOUNDS,true)).toStrictEqual(o.eBounds)
		expect(
			deepEqual(
				o.eGetFromID(EcoreConstants.ETYPE_PARAMETER__EBOUNDS,false),
				(o.eBounds as EObjectList<EGenericType>).getUnResolvedList()
			)
		).toBeTruthy()
	})
	
	test("eSetFromID", () => {
		let o = new ETypeParameterImpl()
		expect(() => o.eSetFromID(-1,null)).toThrow(Error)
		{
			// list with a value
			let mockValue = mock<EGenericTypeInternal>()
			let value = instance(mockValue)
			let l = new ImmutableEList<EGenericType>([value])
			when(mockValue.eInverseAdd(o,EOPPOSITE_FEATURE_BASE - EcoreConstants.ETYPE_PARAMETER__EBOUNDS,anything())).thenReturn(null)
			
			// set list with new contents
			o.eSetFromID(EcoreConstants.ETYPE_PARAMETER__EBOUNDS, l)
			// checks
			expect(o.eBounds.size()).toBe(1)
			expect(o.eBounds.get(0)).toBe(value)
			verify(mockValue.eInverseAdd(o,EOPPOSITE_FEATURE_BASE - EcoreConstants.ETYPE_PARAMETER__EBOUNDS,anything())).once()
			
		}
		
		
	})
	
	test("eIsSetFromID", () => {
		let o = new ETypeParameterImpl()
		expect(() => o.eIsSetFromID(-1)).toThrow(Error)
			expect(o.eIsSetFromID(EcoreConstants.ETYPE_PARAMETER__EBOUNDS)).toBeFalsy()
	})
	
	test("eUnsetFromID", () => {
		let o = new ETypeParameterImpl()
		expect(() => o.eUnsetFromID(-1)).toThrow(Error)
		{
			o.eUnsetFromID(EcoreConstants.ETYPE_PARAMETER__EBOUNDS)
			let v = o.eGetFromID(EcoreConstants.ETYPE_PARAMETER__EBOUNDS, false)
			expect(v).not.toBeNull()
			let l = v as EList<EGenericType> 
			expect(l.isEmpty()).toBeTruthy()
		}
	})
	
	
	
	test("eBasicInverseRemove", () => {
		let o = new ETypeParameterImpl()
		{
			let mockObject = mock<EObject>()
			let object = instance(mockObject)
			let mockNotifications = mock<ENotificationChain>() 
			let notifications = instance(mockNotifications)
			expect(o.eBasicInverseRemove(object,-1,notifications)).toBe(notifications)
		}
		{
			// initialize list with a mock object
			let mockValue = mock<EGenericTypeInternal>()
			let value = instance(mockValue)
			when(mockValue.eInverseAdd(o,EOPPOSITE_FEATURE_BASE - EcoreConstants.ETYPE_PARAMETER__EBOUNDS,anything())).thenReturn(null)
			
			o.eBounds.add(value)
		
			// basic inverse remove
			o.eBasicInverseRemove(value,EcoreConstants.ETYPE_PARAMETER__EBOUNDS,null)
		
			// check it was removed
			expect(o.eBounds.contains(value)).toBeFalsy()
		}
		
	})
	

})

