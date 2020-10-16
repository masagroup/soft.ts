// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { Adapter, ENotification, ENotifier } from "./internal";

export class EContentAdapter extends Adapter {

    notifyChanged(notification: ENotification): void {
        throw new Error("Method not implemented.");
    }

    get target(): ENotifier {
        return super.target;
    }

    set target(notifier: ENotifier) {
        super.target = notifier;
        // var it EIterator
        // switch t := notifier.(type) {
        // case EObject:
        //     it = t.EContents().Iterator()
        // case EResource:
        //     it = t.GetContents().Iterator()
        // case EResourceSet:
        //     it = t.GetResources().Iterator()
        // }
        // for it.HasNext() {
        //     n := it.Next().(ENotifier)
        //     adapter.addAdapter(n)
        // }
    }    
};