// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EObject, EObjectIDManager } from "./internal";

export class IncrementalIDManager implements EObjectIDManager {
    private _detachedToID: Map<EObject, number> = new Map<EObject, number>();
    private _objectToID: Map<EObject, number> = new Map<EObject, number>();
    private _idToObject: Map<number, EObject> = new Map<number, EObject>();
    private _currentID: number = 0;

    private newID(): number {
        return this._currentID++;
    }

    clear(): void {
        this._detachedToID.clear();
        this._objectToID.clear();
        this._idToObject.clear();
        this._currentID = 0;
    }

    register(eObject: EObject): void {
        if (!this._objectToID.has(eObject)) {
            let newID = this._detachedToID.get(eObject);
            if (newID === undefined) {
                newID = this.newID();
            } else {
                this._detachedToID.delete(eObject);
            }
            this.setID(eObject, newID);
        }
    }

    unRegister(eObject: EObject): void {
        let id = this._objectToID.get(eObject);
        if (id !== undefined) {
            this._idToObject.delete(id);
            this._objectToID.delete(eObject);
            this._detachedToID.set(eObject, id);
        }
    }

    setID(eObject: EObject, id: any): void {
        let oldID = this._objectToID.get(eObject);
        let newID = id !== undefined && id !== null ? Number(id) : undefined;
        if (newID !== undefined) {
            this._objectToID.set(eObject, newID);
        } else {
            this._objectToID.delete(eObject);
        }
        if (oldID !== undefined) {
            this._idToObject.delete(oldID);
        }
        if (newID !== undefined) {
            this._idToObject.set(newID, eObject);
        }
    }

    getID(eObject: EObject): any {
        return this._objectToID.get(eObject);
    }

    getEObject(id: any): EObject {
        return this._idToObject.get(Number(id));
    }

    getDetachedID(eObject: EObject): any {
        return this._detachedToID.get(eObject);
    }

    
}
