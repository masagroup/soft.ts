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
    EventType,
    NotificationChain
} from "./internal.js"

export abstract class AbstractNotifyingList<E> extends BasicEList<E> implements ENotifyingList<E> {
    constructor(iterable: Iterable<E> | ArrayLike<E> = []) {
        super(iterable, true)
    }

    abstract getNotifier(): ENotifier

    abstract getFeature(): EStructuralFeature

    abstract getFeatureID(): number

    isNotificationRequired(): boolean {
        return this.getNotifier() != null && this.getNotifier().eDeliver() && !this.getNotifier().eAdapters().isEmpty()
    }

    addWithNotification(e: E, notifications: ENotificationChain): ENotificationChain {
        const index = this.size()
        this.doAdd(e)
        return this.createAndAddNotification(notifications, EventType.ADD, null, e, index)
    }

    removeWithNotification(e: E, notifications: ENotificationChain): ENotificationChain {
        const index = this.indexOf(e)
        if (index != -1) {
            const old = this.removeAt(index)
            return this.createAndAddNotification(notifications, EventType.REMOVE, old, null, index)
        }
        return notifications
    }

    setWithNotification(index: number, e: E, notifications: ENotificationChain): ENotificationChain {
        const old = this.doSet(index, e)
        return this.createAndAddNotification(notifications, EventType.SET, old, e, index)
    }

    public removeAt(index: number): E {
        const oldObject = super.removeAt(index)
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
        super.doAdd(e)
        const notifications = this.inverseAdd(e, null)
        this.createAndDispatchNotification(notifications, EventType.ADD, null, e, index)
    }

    protected doAddAll(c: Collection<E>): boolean {
        return this.doInsertAll(this.size(), c)
    }

    protected doInsert(index: number, e: E) {
        super.doInsert(index, e)
        const notifications = this.inverseAdd(e, null)
        this.createAndDispatchNotification(notifications, EventType.ADD, null, e, index)
    }

    protected doInsertAll(index: number, c: Collection<E>): boolean {
        if (c.isEmpty()) {
            return false
        }

        const result = super.doInsertAll(index, c)
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
        const oldObject = super.doSet(index, newObject)
        if (newObject != oldObject) {
            let notifications: ENotificationChain = null
            notifications = this.inverseRemove(oldObject, notifications)
            notifications = this.inverseAdd(newObject, notifications)
            this.createAndDispatchNotification(notifications, EventType.SET, oldObject, newObject, index)
        }
        return oldObject
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
