// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { anything, instance, mock, resetCalls, verify, when } from "ts-mockito";
import {
    EAdapter,
    EAttribute,
    EContentAdapter,
    EList,
    ENotification,
    ENotifier,
    EObject,
    EObjectInternal,
    EReference,
    EventType,
    ImmutableEList,
} from "./internal";

describe("EContentAdapter", () => {
    test("convert", () => {
        let o: EObject = null;
        let n: ENotifier = o as ENotifier;
        let o2: EObject = n as EObject;
        expect(o2).toBeNull();
    });

    test("setTarget", () => {
        let adapter = new EContentAdapter();
        let children: EObject[] = [];
        let nb = Math.floor(Math.random() * 10) + 1;
        for (let index = 0; index < nb; index++) {
            let mockObject = mock<EObject>();
            let mockAdapters = mock<EList<EAdapter>>();
            let object = instance(mockObject);
            let adapters = instance(mockAdapters);

            when(mockObject.eAdapters).thenReturn(adapters);
            when(mockAdapters.contains(adapter)).thenReturn(false);
            when(mockAdapters.add(adapter)).thenReturn(true);
            when(mockAdapters.remove(adapter)).thenReturn(true);
            children.push(object);
        }
        let mockChildren = new ImmutableEList<EObject>(children);
        let mockObject = mock<EObject>();
        when(mockObject.eContents()).thenReturn(mockChildren);

        let object = instance(mockObject);

        adapter.target = object;

        adapter.target = null;
    });

    describe("notifyChanged", () => {
        test("simple", () => {
            let adapter = new EContentAdapter();
            let mockNotification = mock<ENotification>();
            let notification = instance(mockNotification);
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockAttribute = mock<EAttribute>();
            let attribute = instance(mockAttribute);

            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.feature).thenReturn(attribute);
            adapter.notifyChanged(notification);

            verify(mockNotification.notifier).once();
            verify(mockNotification.feature).once();
            resetCalls(mockNotification);

            let mockReference = mock<EReference>();
            let reference = instance(mockReference);

            when(mockReference.isContainment).thenReturn(false);
            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.feature).thenReturn(reference);
            adapter.notifyChanged(notification);

            verify(mockNotification.notifier).once();
            verify(mockNotification.feature).once();
        });

        test("resolve", () => {
            let adapter = new EContentAdapter();
            let mockNotification = mock<ENotification>();
            let notification = instance(mockNotification);
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockOldObject = mock<EObject>();
            let oldObject = instance(mockOldObject);
            let mockOldAdapters = mock<EList<EAdapter>>();
            let oldAdapters = instance(mockOldAdapters);
            let mockReference = mock<EReference>();
            let reference = instance(mockReference);

            when(mockReference.isContainment).thenReturn(true);
            when(mockReference.eReferenceType).thenReturn(null);
            when(mockOldObject.eAdapters).thenReturn(oldAdapters);
            when(mockOldAdapters.contains(adapter)).thenReturn(false);
            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.eventType).thenReturn(EventType.RESOLVE);
            when(mockNotification.feature).thenReturn(reference);
            when(mockNotification.oldValue).thenReturn(oldObject);

            adapter.notifyChanged(notification);

            verify(mockOldAdapters.contains(adapter)).once();
            verify(mockNotification.notifier).once();
            verify(mockNotification.eventType).once();
            verify(mockNotification.feature).once();
            verify(mockNotification.oldValue).once();
        });

        test("resolveContains", () => {
            let adapter = new EContentAdapter();
            let mockNotification = mock<ENotification>();
            let notification = instance(mockNotification);
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockOldObject = mock<EObject>();
            let oldObject = instance(mockOldObject);
            let mockNewObject = mock<EObject>();
            let newObject = instance(mockNewObject);
            let mockOldAdapters = mock<EList<EAdapter>>();
            let oldAdapters = instance(mockOldAdapters);
            let mockNewAdapters = mock<EList<EAdapter>>();
            let newAdapters = instance(mockNewAdapters);
            let mockReference = mock<EReference>();
            let reference = instance(mockReference);

            when(mockReference.isContainment).thenReturn(true);
            when(mockReference.eReferenceType).thenReturn(null);
            when(mockOldObject.eAdapters).thenReturn(oldAdapters);
            when(mockOldAdapters.contains(adapter)).thenReturn(true);
            when(mockOldAdapters.remove(adapter)).thenReturn(true);
            when(mockNewObject.eAdapters).thenReturn(newAdapters);
            when(mockNewAdapters.contains(adapter)).thenReturn(false);
            when(mockNewAdapters.add(adapter)).thenReturn(true);
            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.eventType).thenReturn(EventType.RESOLVE);
            when(mockNotification.feature).thenReturn(reference);
            when(mockNotification.oldValue).thenReturn(oldObject);
            when(mockNotification.newValue).thenReturn(newObject);

            adapter.notifyChanged(notification);

            verify(mockReference.isContainment).once();
            verify(mockOldObject.eAdapters).twice();
            verify(mockOldAdapters.contains(adapter)).once();
            verify(mockOldAdapters.remove(adapter)).once();
            verify(mockNewObject.eAdapters).twice();
            verify(mockNewAdapters.contains(adapter)).once();
            verify(mockNewAdapters.add(adapter)).once();
            verify(mockNotification.notifier).once();
            verify(mockNotification.eventType).once();
            verify(mockNotification.feature).once();
            verify(mockNotification.oldValue).once();
            verify(mockNotification.newValue).once();
        });

        test("unSet", () => {
            let adapter = new EContentAdapter();
            let mockNotification = mock<ENotification>();
            let notification = instance(mockNotification);
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockOldObject = mock<EObjectInternal>();
            let oldObject = instance(mockOldObject);
            let mockNewObject = mock<EObjectInternal>();
            let newObject = instance(mockNewObject);
            let mockOldAdapters = mock<EList<EAdapter>>();
            let oldAdapters = instance(mockOldAdapters);
            let mockNewAdapters = mock<EList<EAdapter>>();
            let newAdapters = instance(mockNewAdapters);
            let mockReference = mock<EReference>();
            let reference = instance(mockReference);

            when(mockReference.isContainment).thenReturn(true);
            when(mockReference.eReferenceType).thenReturn(null);
            when(mockOldObject.eAdapters).thenReturn(oldAdapters);
            when(mockOldObject.eInternalResource()).thenReturn(null);
            when(mockOldAdapters.remove(adapter)).thenReturn(true);
            when(mockNewObject.eAdapters).thenReturn(newAdapters);
            when(mockNewAdapters.contains(adapter)).thenReturn(false);
            when(mockNewAdapters.add(adapter)).thenReturn(true);
            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.eventType).thenReturn(EventType.UNSET);
            when(mockNotification.feature).thenReturn(reference);
            when(mockNotification.oldValue).thenReturn(oldObject);
            when(mockNotification.newValue).thenReturn(newObject);
        
            adapter.notifyChanged(notification);

            verify(mockReference.isContainment).once();
            verify(mockOldObject.eAdapters).once();
            verify(mockOldAdapters.remove(adapter)).once();
            verify(mockNewObject.eAdapters).twice();
            verify(mockNewAdapters.contains(adapter)).once();
            verify(mockNewAdapters.add(adapter)).once();
            verify(mockNotification.notifier).once();
            verify(mockNotification.eventType).once();
            verify(mockNotification.feature).once();
            verify(mockNotification.oldValue).once();
            verify(mockNotification.newValue).once();

        });

        test("set", () => {
            let adapter = new EContentAdapter();
            let mockNotification = mock<ENotification>();
            let notification = instance(mockNotification);
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockOldObject = mock<EObjectInternal>();
            let oldObject = instance(mockOldObject);
            let mockNewObject = mock<EObjectInternal>();
            let newObject = instance(mockNewObject);
            let mockOldAdapters = mock<EList<EAdapter>>();
            let oldAdapters = instance(mockOldAdapters);
            let mockNewAdapters = mock<EList<EAdapter>>();
            let newAdapters = instance(mockNewAdapters);
            let mockReference = mock<EReference>();
            let reference = instance(mockReference);

            when(mockReference.isContainment).thenReturn(true);
            when(mockReference.eReferenceType).thenReturn(null);
            when(mockOldObject.eAdapters).thenReturn(oldAdapters);
            when(mockOldObject.eInternalResource()).thenReturn(null);
            when(mockOldAdapters.remove(adapter)).thenReturn(true);
            when(mockNewObject.eAdapters).thenReturn(newAdapters);
            when(mockNewAdapters.contains(adapter)).thenReturn(false);
            when(mockNewAdapters.add(adapter)).thenReturn(true);
            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.eventType).thenReturn(EventType.SET);
            when(mockNotification.feature).thenReturn(reference);
            when(mockNotification.oldValue).thenReturn(oldObject);
            when(mockNotification.newValue).thenReturn(newObject);

            adapter.notifyChanged(notification);

            verify(mockReference.isContainment).once();
            verify(mockOldObject.eAdapters).once();
            verify(mockOldAdapters.remove(adapter)).once();
            verify(mockNewObject.eAdapters).twice();
            verify(mockNewAdapters.contains(adapter)).once();
            verify(mockNewAdapters.add(adapter)).once();
            verify(mockNotification.notifier).once();
            verify(mockNotification.eventType).once();
            verify(mockNotification.feature).once();
            verify(mockNotification.oldValue).once();
            verify(mockNotification.newValue).once();

        });

        test("add", () => {
            let adapter = new EContentAdapter();
            let mockNotification = mock<ENotification>();
            let notification = instance(mockNotification);
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockNewObject = mock<EObjectInternal>();
            let newObject = instance(mockNewObject);
            let mockNewAdapters = mock<EList<EAdapter>>();
            let newAdapters = instance(mockNewAdapters);
            let mockReference = mock<EReference>();
            let reference = instance(mockReference);

            when(mockReference.isContainment).thenReturn(true);
            when(mockReference.eReferenceType).thenReturn(null);
            when(mockNewObject.eAdapters).thenReturn(newAdapters);
            when(mockNewAdapters.contains(adapter)).thenReturn(false);
            when(mockNewAdapters.add(adapter)).thenReturn(true);
            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.eventType).thenReturn(EventType.ADD);
            when(mockNotification.feature).thenReturn(reference);
            when(mockNotification.newValue).thenReturn(newObject);

            adapter.notifyChanged(notification);


            verify(mockReference.isContainment).once();
            verify(mockNewObject.eAdapters).twice();
            verify(mockNewAdapters.contains(adapter)).once();
            verify(mockNewAdapters.add(adapter)).once();
            verify(mockNotification.notifier).once();
            verify(mockNotification.eventType).once();
            verify(mockNotification.feature).once();
            verify(mockNotification.newValue).once();
        });

        test("addMany", () => {
            let adapter = new EContentAdapter();
            let mockNotification = mock<ENotification>();
            let notification = instance(mockNotification);
            let mockObject = mock<EObject>();
            let object = instance(mockObject);
            let mockReference = mock<EReference>();
            let reference = instance(mockReference);

            when(mockReference.isContainment).thenReturn(true);
            when(mockReference.eReferenceType).thenReturn(null);

            let children: EObject[] = [];
            let nb = Math.floor(Math.random() * 10) + 1;
            for (let index = 0; index < nb; index++) {
                let mockObject = mock<EObject>();
                let mockAdapters = mock<EList<EAdapter>>();
                let object = instance(mockObject);
                let adapters = instance(mockAdapters);

                when(mockObject.eAdapters).thenReturn(adapters);
                when(mockAdapters.contains(adapter)).thenReturn(false);
                when(mockAdapters.add(adapter)).thenReturn(true);
                children.push(object);
            }
            when(mockNotification.notifier).thenReturn(object);
            when(mockNotification.eventType).thenReturn(EventType.ADD_MANY);
            when(mockNotification.feature).thenReturn(reference);
            when(mockNotification.newValue).thenReturn(children);
           
            adapter.notifyChanged(notification);
        });
    });
});
