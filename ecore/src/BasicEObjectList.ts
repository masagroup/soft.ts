// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractEList,
    AbstractNotifyingList,
    Collection,
    EList,
    ENotificationChain,
    ENotifier,
    ENotifyingList,
    EObject,
    checkSameImplementation,
    EObjectInternal,
    EObjectList,
    EOPPOSITE_FEATURE_BASE,
    EReference,
    EStructuralFeature,
    EventType,
    isEReference
} from "./internal.js"

export class BasicEObjectList<O extends EObject> extends AbstractNotifyingList<O> implements EObjectList<O>, ENotifyingList<O> {
    private _owner: EObjectInternal
    private _featureID: number
    private _inverseFeatureID: number
    private _oppositeFeature: EReference = undefined
    private _containment: boolean
    private _inverse: boolean
    private _opposite: boolean
    private _proxies: boolean
    private _unset: boolean

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
        super()
        this._owner = owner
        this._featureID = featureID
        this._inverseFeatureID = inverseFeatureID
        this._containment = containment
        this._inverse = inverse
        this._opposite = opposite
        this._proxies = proxies
        this._unset = unset
    }

    getNotifier(): ENotifier {
        return this._owner
    }

    protected isUnsettable(): boolean {
        return this._unset
    }

    getFeature(): EStructuralFeature {
        return this._owner != null ? this._owner.eClass().getEStructuralFeature(this._featureID) : null
    }

    getFeatureID(): number {
        return this._featureID
    }

    // getUnResolvedList returns a view of the list whose elements are not resolved: it reads and
    // changes the elements of this list.
    getUnResolvedList(): EList<O> {
        return this._proxies
            ? new (class extends AbstractEList<O> implements EObjectList<O>, ENotifyingList<O> {
                  constructor(private _delegate: BasicEObjectList<O>) {
                      super(true)
                  }

                  getNotifier(): ENotifier {
                      return this._delegate.getNotifier()
                  }

                  getFeature(): EStructuralFeature {
                      return this._delegate.getFeature()
                  }

                  getFeatureID(): number {
                      return this._delegate.getFeatureID()
                  }

                  getUnResolvedList(): EList<O> {
                      return this
                  }

                  addWithNotification(o: O, notifications: ENotificationChain): ENotificationChain {
                      return this._delegate.addWithNotification(o, notifications)
                  }

                  removeWithNotification(o: O, notifications: ENotificationChain): ENotificationChain {
                      const index = this._delegate._v.indexOf(o)
                      if (index != -1) {
                          const old = this._delegate.performRemove(index)
                          return this._delegate.createAndAddNotification(notifications, EventType.REMOVE, old, null, index)
                      }
                      return notifications
                  }

                  setWithNotification(index: number, o: O, notifications: ENotificationChain): ENotificationChain {
                      return this._delegate.setWithNotification(index, o, notifications)
                  }

                  size(): number {
                      return this._delegate.size()
                  }

                  toArray(): O[] {
                      return this._delegate._v
                  }

                  indexOf(o: O): number {
                      return this._delegate._v.indexOf(o)
                  }

                  removeAt(index: number): O {
                      return this._delegate.removeAt(index)
                  }

                  moveTo(from: number, to: number): O {
                      return this._delegate.moveTo(from, to)
                  }

                  clear(): void {
                      this._delegate.clear()
                  }

                  protected doGet(index: number): O {
                      return this._delegate._v[index]
                  }

                  protected doAdd(o: O): void {
                      this._delegate.add(o)
                  }

                  protected doAddAll(c: Collection<O>): boolean {
                      return this._delegate.addAll(c)
                  }

                  protected doInsert(index: number, o: O): void {
                      this._delegate.insert(index, o)
                  }

                  protected doInsertAll(index: number, c: Collection<O>): boolean {
                      return this._delegate.insertAll(index, c)
                  }

                  protected doSet(index: number, o: O): O {
                      return this._delegate.doSet(index, o)
                  }
              })(this)
            : this
    }

    indexOf(o: O): number {
        if (this._proxies) {
            for (const [index, value] of this._v.entries()) {
                if (value == o || this.resolve(index, value) == o) return index
            }
            return -1
        }
        return super.indexOf(o)
    }

    doGet(index: number): O {
        return this.resolve(index, super.doGet(index))
    }

    toArray(): O[] {
        if (this._proxies) {
            for (let i = 0; i < this._v.length; i++) {
                this.resolve(i, this._v[i])
            }
        }
        return super.toArray()
    }

    // inverseFeatureID returns the id of the opposite feature in the class of o: it differs from
    // the id in the class declaring the opposite when that class is not the first super type of o
    private inverseFeatureID(o: EObjectInternal): number {
        if (this._oppositeFeature === undefined) {
            const feature = this._owner.eClass()?.getEStructuralFeature(this._featureID)
            this._oppositeFeature = isEReference(feature) ? feature.getEOpposite() : null
        }
        if (this._oppositeFeature) {
            const featureID = o.eClass()?.getFeatureID(this._oppositeFeature)
            if (featureID >= 0) return featureID
        }
        return this._inverseFeatureID
    }

    inverseAdd(o: O, notifications: ENotificationChain): ENotificationChain {
        checkSameImplementation(this._owner, o)
        const internal = this.forceCast<EObjectInternal>(o)
        if (internal != null && this._owner != null && this._inverse) {
            if (this._opposite) {
                return internal.eInverseAdd(this._owner, this.inverseFeatureID(internal), notifications)
            } else {
                return internal.eInverseAdd(this._owner, EOPPOSITE_FEATURE_BASE - this._featureID, notifications)
            }
        }
        return notifications
    }

    inverseRemove(o: O, notifications: ENotificationChain): ENotificationChain {
        const internal = this.forceCast<EObjectInternal>(o)
        if (internal != null && this._owner != null && this._inverse) {
            if (this._opposite) {
                return internal.eInverseRemove(this._owner, this.inverseFeatureID(internal), notifications)
            } else {
                return internal.eInverseRemove(this._owner, EOPPOSITE_FEATURE_BASE - this._featureID, notifications)
            }
        }
        return notifications
    }

    private forceCast<T>(input: any): T {
        return input
    }

    private resolve(index: number, object: O): O {
        const resolved = this.resolveProxy(object)
        if (resolved != object) {
            this.performSet(index, resolved)
            let notifications: ENotificationChain = null
            if (this._containment) {
                notifications = this.inverseRemove(object, notifications)
                const resolvedInternal = this.forceCast<EObjectInternal>(resolved)
                if (resolvedInternal != null && resolvedInternal.eInternalContainer() == null) {
                    notifications = this.inverseAdd(resolved, notifications)
                }
            }
            this.createAndDispatchNotification(notifications, EventType.RESOLVE, object, resolved, index)
        }
        return resolved
    }

    private resolveProxy(o: O): O {
        return this._proxies && o.eIsProxy() ? <O>(<EObjectInternal>this._owner).eResolveProxy(o) : o
    }

    toJSON(): any {
        return {
            _featureID: this._featureID,
            _inverseFeatureID: this._inverseFeatureID,
            _containment: this._containment,
            _inverse: this._inverse,
            _opposite: this._opposite,
            _proxies: this._proxies,
            _unset: this._unset
        }
    }
}
