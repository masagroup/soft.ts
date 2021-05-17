// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EList , EAdapter, AbstractENotifier} from "./internal";
import { instance, mock, verify, when } from "ts-mockito";
import { ImmutableEList } from "./ImmutableEList";
import { ENotification } from "./ENotification";

class ENotifierTest extends AbstractENotifier {
    deliver : boolean;
    adapters : EList<EAdapter>;
 
    constructor() {
        super();
        this.deliver = false;
        this.adapters = null;
        
    }

    get eDeliver() : boolean {
        return this.deliver
    }

    set eDeliver(eDeliver : boolean) {
        super.eDeliver = eDeliver
    } 

    protected eBasicAdapters() : EList<EAdapter> {
        return this.adapters
    }    
}


describe('AbstractENotifier', () => {
    test('constructor', () => {
        expect(new AbstractENotifier()).not.toBeNull();
    });
    describe('eDeliver ', () => {
        test('get', () => {
            let n = new AbstractENotifier();
            expect(n.eDeliver).toBeFalsy();
        });
        test('set', () => {
            let n = new AbstractENotifier();
            expect(() => { n.eDeliver = true }).toThrow(Error);
        });        
    });
    test('eAdapters', () => {
        let n = new AbstractENotifier();
        expect(n.eAdapters).not.toBeNull()
        expect(n.eAdapters.isEmpty()).toBeTruthy()
    });
    describe('eNotificationRequired', () => {
        test('default', () => {
            let n = new AbstractENotifier();
            expect(n.eNotificationRequired).toBeFalsy();
        });
        test('deliver', () => {
            let n = new ENotifierTest();
            n.deliver = true;
            expect(n.eNotificationRequired).toBeFalsy();
        });
        test('adapters', () => {
            let n = new ENotifierTest();
            let mockAdapters = mock<EList<EAdapter>>();
            let instanceAdapters = instance(mockAdapters)
            n.deliver = true;
            n.adapters = instanceAdapters;
            when(mockAdapters.isEmpty()).thenReturn(true);
            expect(n.eNotificationRequired).toBeFalsy();

            when(mockAdapters.isEmpty()).thenReturn(false);
            expect(n.eNotificationRequired).toBeTruthy();

            verify(mockAdapters.isEmpty()).twice();
        });
    });
    test('eNotify', () => {
        let n = new ENotifierTest();
        let mockNotification = mock<ENotification>();
        let notification = instance(mockNotification)
        n.eNotify(notification)
        
        let mockAdapter = mock<EAdapter>();
        let adapter = instance(mockAdapter)
        n.deliver = true
        n.adapters = new ImmutableEList<EAdapter>([adapter])
        n.eNotify(notification)
        verify(mockAdapter.notifyChanged(notification)).once()
    });
});