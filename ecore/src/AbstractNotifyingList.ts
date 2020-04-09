// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotifyingList } from "./ENotifyingList";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { ArrayEList } from "./ArrayEList";
import { AbstractNotification } from "./AbstractNotification";
import { EventType, ENotification } from "./ENotification";
import { ENotificationChain } from "./ENotificationChain";
import { Collection } from ".";
import { NotificationChain } from "./NotificationChain";

export abstract class AbstractNotifyingList<E> extends ArrayEList<E> implements ENotifyingList<E> {
    abstract readonly notifier: ENotifier;
    abstract readonly feature: EStructuralFeature;
    abstract readonly featureID: number;

    constructor(v: [] = []) {
        super(v, true);
    }

    get isNotificationRequired(): boolean {
        return (
            this.notifier != null && this.notifier.eDeliver && !this.notifier.eAdapters.isEmpty()
        );
    }

    addWithNotification(e: E, notifications: ENotificationChain): ENotificationChain {
        var index = this.size();
        this.doAdd(e);
        return this.createAndAddNotification(notifications, EventType.ADD, null, e, index);
    }

    removeWithNotification(e: E, notifications: ENotificationChain): ENotificationChain {
        var index = this.indexOf(e);
        if (index != -1) {
            var old = this.removeAt(index);
            return this.createAndAddNotification(notifications, EventType.REMOVE, old, null, index);
        }
        return notifications;
    }

    setWithNotification(
        index: number,
        e: E,
        notifications: ENotificationChain
    ): ENotificationChain {
        var old = this.doSet(index, e);
        return this.createAndAddNotification(notifications, EventType.SET, old, e, index);
    }

    public removeAt(index: number): E {
        var oldObject = super.removeAt(index);
        var notifications: ENotificationChain = null;
        notifications = this.inverseRemove(oldObject, notifications);
        this.createAndDispatchNotification(notifications, EventType.REMOVE, oldObject, null, index);
        return oldObject;
    }

    protected inverseAdd(e: E, notifications: ENotificationChain): ENotificationChain {
        return notifications;
    }

    protected inverseRemove(e: E, notifications: ENotificationChain): ENotificationChain {
        return notifications;
    }

    protected doAdd(e: E): void {
        var index = this.size();
        super.doAdd(e);
        var notifications = this.inverseAdd(e, null);
        this.createAndDispatchNotification(notifications, EventType.ADD, null, e, index);
    }

    protected doAddAll(c: Collection<E>): boolean {
        return this.doInsertAll(this.size(), c);
    }

    protected doInsert(index: number, e: E) {
        super.doInsert(index, e);
        var notifications = this.inverseAdd(e, null);
        this.createAndDispatchNotification(notifications, EventType.ADD, null, e, index);
    }

    protected doInsertAll(index: number, c: Collection<E>): boolean {
        if (this.isEmpty()) {
            return false;
        }

        var result = super.doInsertAll(index, c);
        var notifications: ENotificationChain = new NotificationChain();
        for (const e of c) {
            notifications = this.inverseAdd(e, notifications);
        }
        this.createAndDispatchNotificationFn(notifications, () => {
            if (c.size() == 1) {
                return this.createNotification(
                    EventType.ADD,
                    null,
                    c[Symbol.iterator]().next().value,
                    index
                );
            } else {
                return this.createNotification(EventType.ADD_MANY, null, c.toArray(), index);
            }
        });
        return result;
    }

    protected doSet(index: number, newObject: E): E {
        var oldObject = super.doSet(index, newObject);
        if (newObject != oldObject) {
            var notifications: ENotificationChain = null;
            notifications = this.inverseRemove(oldObject, notifications);
            notifications = this.inverseAdd(newObject, notifications);
            this.createAndDispatchNotification(
                notifications,
                EventType.SET,
                oldObject,
                newObject,
                index
            );
        }
        return oldObject;
    }

    private createNotification(
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number = -1
    ): AbstractNotification {
        return new (class extends AbstractNotification {
            constructor(private list: AbstractNotifyingList<E>) {
                super(eventType, oldValue, newValue, position);
            }

            get feature(): EStructuralFeature {
                return this.list.feature;
            }

            get featureID(): number {
                return this.list.featureID;
            }

            get notifier(): ENotifier {
                return this.list.notifier;
            }
        })(this);
    }

    private createAndAddNotification(
        nc: ENotificationChain,
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number = -1
    ): ENotificationChain {
        var notifications = nc;
        if (this.isNotificationRequired) {
            var notification = this.createNotification(eventType, oldValue, newValue, position);
            if (notifications != null) {
                notifications.add(notification);
            } else {
                notifications = <ENotificationChain>notification;
            }
        }
        return notifications;
    }

    private createAndDispatchNotification(
        notifications: ENotificationChain,
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number = -1
    ): void {
        this.createAndDispatchNotificationFn(notifications, () => {
            return this.createNotification(eventType, oldValue, newValue, position);
        });
    }

    private createAndDispatchNotificationFn(
        notifications: ENotificationChain,
        createNotification: () => ENotification
    ) {
        if (this.isNotificationRequired) {
            var notification = createNotification();
            if (notifications != null) {
                notifications.add(notification);
                notifications.dispatch();
            }
            var notifier = this.notifier;
            if (notifier != null) {
                notifier.eNotify(notification);
            }
        } else {
            if (notifications != null) {
                notifications.dispatch();
            }
        }
    }
}
