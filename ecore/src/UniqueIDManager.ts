// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import id128 from "id128"
import { EObject, EObjectIDManager } from "./internal.js"

type Primitive = string | number

export abstract class UniqueIDManager<ID, K extends Primitive> implements EObjectIDManager {
    private _detachedToID: Map<EObject, ID> = new Map<EObject, ID>()
    private _objectToID: Map<EObject, ID> = new Map<EObject, ID>()
    private _idToObject: Map<K, EObject> = new Map<K, EObject>()

    abstract newID(): ID
    abstract toKey(id: ID): K
    abstract toID(v: any): ID
    abstract isValid(id: ID): boolean
    abstract setCurrent(id: ID): void

    private setObjectID(eObject: EObject, newID: ID) {
        if (this._objectToID.has(eObject)) {
            let oldID = this._objectToID.get(eObject)
            let oldKey = this.toKey(oldID)
            this._idToObject.delete(oldKey)
        }

        if (this.isValid(newID)) {
            let newKey = this.toKey(newID)
            this.setCurrent(newID)
            this._objectToID.set(eObject, newID)
            this._idToObject.set(newKey, eObject)
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
            let key = this.toKey(id)
            this._idToObject.delete(key)
            this._objectToID.delete(eObject)
            this._detachedToID.set(eObject, id)
        }
    }

    setID(eObject: EObject, id: any): void {
        let newID = this.toID(id)
        this.setObjectID(eObject, newID)
    }

    getID(eObject: EObject): any {
        return this._objectToID.get(eObject)
    }

    getEObject(aid: any): EObject {
        let id = this.toID(aid)
        let key = this.toKey(id)
        return key != undefined ? this._idToObject.get(key) : undefined
    }

    getDetachedID(eObject: EObject): any {
        return this._detachedToID.get(eObject)
    }
}

export class UUIDManager extends UniqueIDManager<id128.Uuid4, string> {
    newID(): id128.Uuid4 {
        return id128.Uuid4.generate()
    }

    isValid(id: id128.Uuid4): boolean {
        return id != undefined
    }

    toID(v: any): id128.Uuid4 {
        if (v instanceof id128.Uuid4.type) {
            return v
        } else if (typeof v === "string") {
            return id128.Uuid4.fromCanonical(v)
        } else if (v instanceof Uint8Array) {
            return id128.Uuid4.construct(v)
        }
        return undefined
    }

    toKey(id: id128.Uuid4): string {
        return id ? id.toRaw() : undefined
    }

    setCurrent(id: id128.Uuid4): void {}
}

export class ULIDManager extends UniqueIDManager<id128.Ulid, string> {
    newID(): id128.Ulid {
        return id128.Ulid.generate()
    }

    isValid(id: id128.Ulid): boolean {
        return id != undefined
    }

    isID(id: id128.Ulid): boolean {
        return true
    }
    toID(v: any): id128.Ulid {
        if (v instanceof id128.Ulid.type) {
            return v
        } else if (typeof v === "string") {
            return id128.Ulid.fromCanonical(v)
        } else if (v instanceof Uint8Array) {
            return id128.Ulid.construct(v)
        }
        return undefined
    }

    toKey(id: id128.Ulid): string {
        return id ? id.toRaw() : undefined
    }

    setCurrent(id: id128.Ulid): void {}
}

export class IncrementalIDManager extends UniqueIDManager<number, number> {
    private _id: number = 0

    newID(): number {
        return this._id++
    }

    isValid(id: number): boolean {
        return id >= 0
    }

    toID(v: any): number {
        if (typeof v === "string") {
            return parseInt(v as string)
        } else if (typeof v === "number") {
            return v as number
        }
        return undefined
    }

    toKey(id: number): number {
        return id
    }

    setCurrent(id: number): void {
        this._id = id
    }
}
