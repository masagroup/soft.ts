// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EObject, EObjectIDManager } from "./internal"
import { Ulid, Uuid4 } from "id128"

export abstract class UniqueIDManager<E> implements EObjectIDManager {
    private _detachedToID: Map<EObject, E> = new Map<EObject, E>()
    private _objectToID: Map<EObject, E> = new Map<EObject, E>()
    private _idToObject: Map<E, EObject> = new Map<E, EObject>()

    abstract newID(): E
    abstract isValidID(id: E): boolean
    abstract convertToID(v: any): E
    abstract setCurrentID(id: E): void

    private setObjectID(eObject: EObject, newID: E) {
        if (this._objectToID.has(eObject)) {
            let oldID = this._objectToID.get(eObject)
            this._idToObject.delete(oldID)
        }

        if (this.isValidID(newID)) {
            this.setCurrentID(newID)
            this._objectToID.set(eObject, newID)
            this._idToObject.set(newID, eObject)
        } else {
            this._objectToID.delete(eObject)
        }
    }

    clear(): void {
        this._detachedToID.clear()
        this._objectToID.clear()
        this._idToObject.clear()
    }

    register(eObject: EObject): void {
        if (!this._objectToID.has(eObject)) {
            let newID = this._detachedToID.get(eObject)
            if (newID == undefined) {
                newID = this.newID()
            } else {
                this._detachedToID.delete(eObject)
            }
            this.setObjectID(eObject, newID)
        }
    }

    unRegister(eObject: EObject): void {
        let id = this._objectToID.get(eObject)
        if (id != undefined) {
            this._idToObject.delete(id)
            this._objectToID.delete(eObject)
            this._detachedToID.set(eObject, id)
        }
    }

    setID(eObject: EObject, id: any): void {
        let newID = this.convertToID(id)
        this.setObjectID(eObject, newID)
    }

    getID(eObject: EObject): any {
        return this._objectToID.get(eObject)
    }

    getEObject(id: any): EObject {
        let convertedID = this.convertToID(id)
        return convertedID != undefined ? this._idToObject.get(convertedID) : undefined
    }

    getDetachedID(eObject: EObject): any {
        return this._detachedToID.get(eObject)
    }
}

export class UUIDManager extends UniqueIDManager<Uuid4> {
    newID(): Uuid4 {
        return Uuid4.generate()
    }
    isValidID(id: Uuid4): boolean {
        return true
    }
    convertToID(v: any): Uuid4 {
        if (typeof v === "string") {
            return Uuid4.fromCanonical(v)
        } else if (v instanceof Uint8Array) {
            return Uuid4.construct(v)
        }
        return undefined
    }
    setCurrentID(id: Uuid4): void {}
}

export class ULIDManager extends UniqueIDManager<Ulid> {
    newID(): Ulid {
        return Ulid.generate()
    }
    isValidID(id: Ulid): boolean {
        return true
    }
    convertToID(v: any): Ulid {
        if (typeof v === "string") {
            return Ulid.fromCanonical(v)
        } else if (v instanceof Uint8Array) {
            return Ulid.construct(v)
        }
        return undefined
    }
    setCurrentID(id: Ulid): void {}
}

export class IncrementalIDManager extends UniqueIDManager<number> {
    private _id: number = 0

    newID(): number {
        return this._id++
    }

    isValidID(id: number): boolean {
        return id >= 0
    }

    convertToID(v: any): number {
        if (typeof v === "string") {
            return parseInt(v as string)
        } else if (typeof v === "number") {
            return v as number
        }
        return undefined
    }

    setCurrentID(id: number): void {
        this._id = id
    }
}
