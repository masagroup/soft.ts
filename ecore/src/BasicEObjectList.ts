// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { AbstractNotifyingList } from "./AbstractNotifyingList";
import { EObjectInternal, EOPPOSITE_FEATURE_BASE } from "./BasicEObject";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { ENotificationChain } from "./ENotificationChain";
import { EObject } from "./EObject";
import { EObjectList } from "./EObjectList";
import { EList } from "./EList";
import { EventType } from "./ENotification";
import { Collection } from "./Collection";
import { getNonDuplicates } from "./ImmutableEList";

export class BasicEObjectList<O extends EObject> extends AbstractNotifyingList<O>
    implements EObjectList<O> {
    private _owner: EObjectInternal;
    private _featureID: number;
    private _inverseFeatureID: number;
    private _containment: boolean;
    private _inverse: boolean;
    private _opposite: boolean;
    private _proxies: boolean;
    private _unset: boolean;

    constructor(
        owner: EObjectInternal,
        featureID: number,
        inverseFeatureID: number,
        containment: boolean,
        inverse: boolean,
        opposite: boolean,
        proxies: boolean,
        unset: boolean
    ) {
        super();
        this._featureID = featureID;
        this._inverseFeatureID = inverseFeatureID;
        this._containment = containment;
        this._inverse = inverse;
        this._opposite = opposite;
        this._proxies = proxies;
        this._unset = unset;
    }

    get notifier(): ENotifier {
        return this._owner;
    }

    get feature(): EStructuralFeature {
        return this._owner != null
            ? this._owner.eClass().getEStructuralFeature(this._featureID)
            : null;
    }

    get featureID(): number {
        return this._featureID;
    }

    getUnResolvedList(): EList<O> {
        return new (class implements EList<O> {
            constructor(private _delegate: BasicEObjectList<O>) {}
            move(newIndex: number, e: O): void {
                let oldIndex = this.indexOf(e);
                if (oldIndex == -1) {
                    throw new Error("Object not found");
                }
                this._delegate.moveTo(oldIndex, newIndex);
            }
            moveTo(oldIndex: number, newIndex: number): O {
                return this._delegate.moveTo(oldIndex, newIndex);
            }
            insert(index: number, e: O): boolean {
                if (index < 0 || index > this.size()) {
                    throw new Error("Index out of bounds: index=" + index + " size=" + this.size());
                }
                if (this._delegate._isUnique && this.contains(e)) {
                    return false;
                }
                this._delegate.doInsert(index, e);
                return true;
            }
            insertAll(index: number, c: Collection<O>): boolean {
                if (index < 0 || index > this.size()) {
                    throw new Error("Index out of bounds: index=" + index + " size=" + this.size());
                }
                if (this._delegate._isUnique) {
                    c = getNonDuplicates<O>(this, c);
                    if (c.isEmpty()) {
                        return false;
                    }
                }
                this._delegate.doInsertAll(index, c);
                return true;
            }
            removeAt(index: number): O {
                return this._delegate.removeAt(index);
            }
            remove(e: O): boolean {
                let index = this.indexOf(e);
                if (index == -1) {
                    return false;
                }
                this._delegate.removeAt(index);
                return true;
            }
            get(index: number): O {
                if (index < 0 || index > this.size()) {
                    throw new Error("Index out of bounds: index=" + index + " size=" + this.size());
                }
                return this._delegate._v[index];
            }
            set(index: number, e: O): O {
                if (index < 0 || index > this.size()) {
                    throw new Error("Index out of bounds: index=" + index + " size=" + this.size());
                }
                if (this._delegate._isUnique) {
                    let currIndex = this.indexOf(e);
                    if (currIndex >= 0 && currIndex != index)
                        throw new Error(
                            "element already in list : uniqueness constraint is not respected"
                        );
                }
                return this._delegate.doSet(index, e);
            }
            indexOf(e: O): number {
                let index = 0;
                for (const element of this._delegate._v) {
                    if (element == e) return index;
                    else index++;
                }
                return -1;
            }
            add(e: O): boolean {
                if (this._delegate._isUnique && this.contains(e)) return false;
                this._delegate.doAdd(e);
                return true;
            }
            addAll(c: Collection<O>): boolean {
                if (this._delegate._isUnique) {
                    c = getNonDuplicates<O>(this, c);
                    if (c.isEmpty()) return false;
                }
                this._delegate.doAddAll(c);
            }
            clear(): void {
                this._delegate.clear();
            }
            contains(e: O): boolean {
                return this.indexOf(e) != -1;
            }
            isEmpty(): boolean {
                return this._delegate.isEmpty();
            }
            removeAll(c: Collection<O>): boolean {
                throw new Error("Method not implemented.");
            }
            retainAll(c: Collection<O>): boolean {
                throw new Error("Method not implemented.");
            }
            size(): number {
                return this._delegate.size();
            }
            toArray(): O[] {
                return this._delegate.toArray();
            }
            [Symbol.iterator](): Iterator<O, any, undefined> {
                return new (class implements Iterator<O> {
                    private _cursor: number;
                    private _delegate: BasicEObjectList<O>;
                    constructor(_delegate: BasicEObjectList<O>) {
                        this._cursor = 0;
                        this._delegate = _delegate;
                    }

                    next(value?: any): IteratorResult<O> {
                        return this._cursor++ < this._delegate.size()
                            ? { value: this._delegate._v[this._cursor - 1], done: false }
                            : { value: undefined, done: true };
                    }
                })(this._delegate);
            }
        })(this);
    }

    doGet(index: number): O {
        return this.resolve(index, super.doGet(index));
    }

    inverseAdd(o: O, notifications: ENotificationChain): ENotificationChain {
        const internal = this.forceCast<EObjectInternal>(o);
        if (internal != null && this._inverse) {
            if (this._opposite) {
                return internal.eInverseAdd(this._owner, this._inverseFeatureID, notifications);
            } else {
                return internal.eInverseAdd(
                    this._owner,
                    EOPPOSITE_FEATURE_BASE - this._featureID,
                    notifications
                );
            }
        }
        return notifications;
    }

    inverseRemove(o: O, notifications: ENotificationChain): ENotificationChain {
        const internal = this.forceCast<EObjectInternal>(o);
        if (internal != null && this._inverse) {
            if (this._opposite) {
                return internal.eInverseRemove(this._owner, this._inverseFeatureID, notifications);
            } else {
                return internal.eInverseRemove(
                    this._owner,
                    EOPPOSITE_FEATURE_BASE - this._featureID,
                    notifications
                );
            }
        }
        return notifications;
    }

    private forceCast<T>(input: any): T {
        // @ts-ignore
        return input;
    }

    private resolve(index: number, object: O): O {
        let resolved = this.resolveProxy(object);
        if (resolved != object) {
            this.doSet(index, resolved);
            let notifications: ENotificationChain = null;
            if (this._containment) {
                notifications = this.inverseRemove(object, notifications);
                let resolvedInternal = this.forceCast<EObjectInternal>(resolved);
                if (resolvedInternal != null)
                    notifications = this.inverseAdd(resolved, notifications);
            }
            this.createAndDispatchNotification(
                notifications,
                EventType.RESOLVE,
                object,
                resolved,
                index
            );
        }
        return resolved;
    }

    private resolveProxy(o: O) {
        if (this._proxies && o.eIsProxy()) {
            <EObjectInternal>this._owner.eResolveProxy(o);
        }
        return o;
    }
}
