// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { v4 as uuid } from "uuid"
import { EObject, EObjectIDManager } from "./internal"

export class UniqueIDManager implements EObjectIDManager {
    private _detachedToID: Map<EObject, string> = new Map<EObject, string>()
    private _objectToID: Map<EObject, string> = new Map<EObject, string>()
    private _idToObject: Map<string, EObject> = new Map<string, EObject>()

    private newID(): string {
        return uuid()
    }

    clear(): void {
        this._detachedToID.clear()
        this._objectToID.clear()
        this._idToObject.clear()
    }

    register(eObject: EObject): void {
        if (!this._objectToID.has(eObject)) {
            let newID = this._detachedToID.get(eObject)
            if (newID === undefined) {
                newID = this.newID()
            } else {
                this._detachedToID.delete(eObject)
            }
            this.setID(eObject, newID)
        }
    }

    unRegister(eObject: EObject): void {
        let id = this._objectToID.get(eObject)
        if (id !== undefined) {
            this._idToObject.delete(id)
            this._objectToID.delete(eObject)
            this._detachedToID.set(eObject, id)
        }
    }

    setID(eObject: EObject, id: any): void {
        let oldID = this._objectToID.get(eObject)
        let newID = id !== undefined && id !== null ? String(id) : undefined
        if (newID !== undefined) {
            this._objectToID.set(eObject, newID)
        } else {
            this._objectToID.delete(eObject)
        }
        if (oldID !== undefined) {
            this._idToObject.delete(oldID)
        }
        if (newID !== undefined) {
            this._idToObject.set(newID, eObject)
        }
    }

    getID(eObject: EObject): any {
        return this._objectToID.get(eObject)
    }

    getEObject(id: any): EObject {
        return this._idToObject.get(String(id))
    }

    getDetachedID(eObject: EObject): any {
        return this._detachedToID.get(eObject)
    }
}
