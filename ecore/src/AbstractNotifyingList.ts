// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractNotification,
    BasicEList,
    Collection,
    ENotification,
    ENotificationChain,
    ENotifier,
    ENotifyingList,
    EStructuralFeature,
    EUnsettableList,
    EventType,
    NotificationChain
} from "./internal.js"

export abstract class AbstractNotifyingList<E> extends BasicEList<E> implements ENotifyingList<E>, EUnsettableList<E> {
    // _isSet tells whether the list of an unsettable feature changed since it was created or unset
    protected _isSet: boolean = false

    constructor(iterable: Iterable<E> | ArrayLike<E> = []) {
        super(iterable, true)
    }

    // isUnsettable returns true for the list of an unsettable feature: it is set from its first
    // change until unset
    protected isUnsettable(): boolean {
        return false
    }

    // isSet returns true when the list is set (EUnsettableList): for an unsettable feature, when it
    // changed since it was created or unset, else when it is not empty.
    isSet(): boolean {
        return this.isUnsettable() ? this._isSet : !this.isEmpty()
    }

    // unset clears the list (EUnsettableList) and, for an unsettable feature, makes it unset and
    // notifies UNSET, from the old set state to false.
    unset(): void {
        this.clear()
        const oldIsSet = this._isSet
        this._isSet = false
        if (this.isUnsettable()) {
            this.createAndDispatchNotification(null, EventType.UNSET, oldIsSet, false)
        }
    }

    protected didChange(): void {
        this._isSet = true
    }

    abstract getNotifier(): ENotifier

    abstract getFeature(): EStructuralFeature

    abstract getFeatureID(): number

    isNotificationRequired(): boolean {
        return this.getNotifier() != null && this.getNotifier().eDeliver() && !this.getNotifier().eAdapters().isEmpty()
    }

    // addWithNotification adds e and returns notifications with its notification, without inverse:
    // it is the inverse of a change of e.
    addWithNotification(e: E, notifications: ENotificationChain): ENotificationChain {
        const index = this.size()
        this.performAdd(e)
        return this.createAndAddNotification(notifications, EventType.ADD, null, e, index)
    }

    // removeWithNotification removes e and returns notifications with its notification, without
    // inverse: it is the inverse of a change of e.
    removeWithNotification(e: E, notifications: ENotificationChain): ENotificationChain {
        const index = this.indexOf(e)
        if (index != -1) {
            const old = this.performRemove(index)
            return this.createAndAddNotification(notifications, EventType.REMOVE, old, null, index)
        }
        return notifications
    }

    // setWithNotification sets e at index and returns notifications with its notification,
    // without inverse.
    setWithNotification(index: number, e: E, notifications: ENotificationChain): ENotificationChain {
        const old = this.performSet(index, e)
        return this.createAndAddNotification(notifications, EventType.SET, old, e, index)
    }

    public removeAt(index: number): E {
        const oldObject = this.performRemove(index)
        let notifications: ENotificationChain = null
        notifications = this.inverseRemove(oldObject, notifications)
        this.createAndDispatchNotification(notifications, EventType.REMOVE, oldObject, null, index)
        return oldObject
    }

    protected inverseAdd(e: E, notifications: ENotificationChain): ENotificationChain {
        return notifications
    }

    protected inverseRemove(e: E, notifications: ENotificationChain): ENotificationChain {
        return notifications
    }

    protected doAdd(e: E): void {
        const index = this.size()
        this.performAdd(e)
        const notifications = this.inverseAdd(e, null)
        this.createAndDispatchNotification(notifications, EventType.ADD, null, e, index)
    }

    protected doAddAll(c: Collection<E>): boolean {
        return this.doInsertAll(this.size(), c)
    }

    protected doInsert(index: number, e: E) {
        this.performInsert(index, e)
        const notifications = this.inverseAdd(e, null)
        this.createAndDispatchNotification(notifications, EventType.ADD, null, e, index)
    }

    protected doInsertAll(index: number, c: Collection<E>): boolean {
        if (c.isEmpty()) {
            return false
        }

        const result = this.performInsertAll(index, c)
        let notifications: ENotificationChain = new NotificationChain()
        for (const e of c) {
            notifications = this.inverseAdd(e, notifications)
        }
        this.createAndDispatchNotificationFn(notifications, () => {
            if (c.size() == 1) {
                return this.createNotification(EventType.ADD, null, c[Symbol.iterator]().next().value, index)
            } else {
                return this.createNotification(EventType.ADD_MANY, null, c.toArray(), index)
            }
        })
        return result
    }

    protected doSet(index: number, newObject: E): E {
        const oldObject = this.performSet(index, newObject)
        if (newObject != oldObject) {
            let notifications: ENotificationChain = null
            notifications = this.inverseRemove(oldObject, notifications)
            notifications = this.inverseAdd(newObject, notifications)
            this.createAndDispatchNotification(notifications, EventType.SET, oldObject, newObject, index)
        }
        return oldObject
    }

    protected doClear(): E[] {
        const oldData = this.performClear()
        if (oldData.length == 0) {
            this.createAndDispatchNotification(null, EventType.REMOVE_MANY, [], null, -1)
        } else {
            let notifications: ENotificationChain = new NotificationChain()
            for (const e of oldData) {
                notifications = this.inverseRemove(e, notifications)
            }
            this.createAndDispatchNotificationFn(notifications, () => {
                if (oldData.length == 1) {
                    return this.createNotification(EventType.REMOVE, oldData[0], null, 0)
                } else {
                    return this.createNotification(EventType.REMOVE_MANY, oldData, null, -1)
                }
            })
        }
        return oldData
    }

    protected doMove(from: number, to: number): E {
        const size = this.size()
        if (from < 0 || from >= size || to < 0 || to >= size) {
            throw new RangeError("Index out of bounds: from=" + from + " to=" + to + " size=" + size)
        }
        const oldObject = this.performMove(from, to)
        if (from != to) {
            this.createAndDispatchNotification(null, EventType.MOVE, from, oldObject, to)
        }
        return oldObject
    }

    // perform* change the elements, without inverse and without notification

    protected performAdd(e: E): void {
        super.doAdd(e)
    }

    protected performInsert(index: number, e: E): void {
        super.doInsert(index, e)
    }

    protected performInsertAll(index: number, c: Collection<E>): boolean {
        return super.doInsertAll(index, c)
    }

    protected performRemove(index: number): E {
        return super.removeAt(index)
    }

    protected performSet(index: number, e: E): E {
        return super.doSet(index, e)
    }

    protected performClear(): E[] {
        return super.doClear()
    }

    protected performMove(from: number, to: number): E {
        return super.doMove(from, to)
    }

    protected createNotification(eventType: EventType, oldValue: any, newValue: any, position: number = -1): AbstractNotification {
        return new (class extends AbstractNotification {
            constructor(private list: AbstractNotifyingList<E>) {
                super(eventType, oldValue, newValue, position)
            }

            getFeature(): EStructuralFeature {
                return this.list.getFeature()
            }

            getFeatureID(): number {
                return this.list.getFeatureID()
            }

            getNotifier(): ENotifier {
                return this.list.getNotifier()
            }
        })(this)
    }

    protected createAndAddNotification(
        nc: ENotificationChain,
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number = -1
    ): ENotificationChain {
        let notifications = nc
        if (this.isNotificationRequired()) {
            const notification = this.createNotification(eventType, oldValue, newValue, position)
            if (notifications != null) {
                notifications.add(notification)
            } else {
                notifications = notification as ENotificationChain
            }
        }
        return notifications
    }

    protected createAndDispatchNotification(
        notifications: ENotificationChain,
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number = -1
    ): void {
        this.createAndDispatchNotificationFn(notifications, () => {
            return this.createNotification(eventType, oldValue, newValue, position)
        })
    }

    private createAndDispatchNotificationFn(notifications: ENotificationChain, createNotification: () => ENotification) {
        if (this.isNotificationRequired()) {
            const notification = createNotification()
            if (notifications != null) {
                notifications.add(notification)
                notifications.dispatch()
            } else {
                const notifier = this.getNotifier()
                if (notifier != null) {
                    notifier.eNotify(notification)
                }
            }
        } else {
            if (notifications != null) {
                notifications.dispatch()
            }
        }
    }
}
