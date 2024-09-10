// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractNotifyingList,
    EList,
    ENotificationChain,
    ENotifier,
    ENotifyingList,
    EObject,
    EObjectInternal,
    EObjectList,
    EOPPOSITE_FEATURE_BASE,
    EStructuralFeature,
    EventType
} from "./internal.js"

export class BasicEObjectList<O extends EObject> extends AbstractNotifyingList<O> implements EObjectList<O>, ENotifyingList<O> {
    private _owner: EObjectInternal
    private _featureID: number
    private _inverseFeatureID: number
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

    getFeature(): EStructuralFeature {
        return this._owner != null ? this._owner.eClass().getEStructuralFeature(this._featureID) : null
    }

    getFeatureID(): number {
        return this._featureID
    }

    getUnResolvedList(): EList<O> {
        return this._proxies
            ? new (class extends AbstractNotifyingList<O> implements EObjectList<O> {
                  constructor(private _delegate: BasicEObjectList<O>) {
                      super([])
                      this._v = _delegate.toArray()
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

                  inverseAdd(o: O, notifications: ENotificationChain): ENotificationChain {
                      return this._delegate.inverseAdd(o, notifications)
                  }

                  inverseRemove(o: O, notifications: ENotificationChain): ENotificationChain {
                      return this._delegate.inverseRemove(o, notifications)
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

    inverseAdd(o: O, notifications: ENotificationChain): ENotificationChain {
        const internal = this.forceCast<EObjectInternal>(o)
        if (internal != null && this._inverse) {
            if (this._opposite) {
                return internal.eInverseAdd(this._owner, this._inverseFeatureID, notifications)
            } else {
                return internal.eInverseAdd(this._owner, EOPPOSITE_FEATURE_BASE - this._featureID, notifications)
            }
        }
        return notifications
    }

    inverseRemove(o: O, notifications: ENotificationChain): ENotificationChain {
        const internal = this.forceCast<EObjectInternal>(o)
        if (internal != null && this._inverse) {
            if (this._opposite) {
                return internal.eInverseRemove(this._owner, this._inverseFeatureID, notifications)
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
            this.doSet(index, resolved)
            let notifications: ENotificationChain = null
            if (this._containment) {
                notifications = this.inverseRemove(object, notifications)
                const resolvedInternal = this.forceCast<EObjectInternal>(resolved)
                if (resolvedInternal != null) notifications = this.inverseAdd(resolved, notifications)
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
