// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    ENotification,
    ENotificationChain,
    ENotifier,
    EStructuralFeature,
    EventType,
    NotificationChain,
} from "./internal";

export abstract class AbstractNotification implements ENotification, ENotificationChain {
    abstract readonly feature: EStructuralFeature;
    abstract readonly featureID: number;
    abstract readonly notifier: ENotifier;
    eventType: EventType;
    oldValue: any;
    newValue: any;
    position: number;
    private _next: ENotificationChain;

    constructor(eventType: EventType, oldValue: any, newValue: any, position: number) {
        this.eventType = eventType;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.position = position;
        this._next = null;
    }

    merge(notification: ENotification): boolean {
        switch (this.eventType) {
            case EventType.SET:
            case EventType.UNSET: {
                switch (notification.eventType) {
                    case EventType.SET:
                    case EventType.UNSET: {
                        if (
                            this.notifier == notification.notifier &&
                            this.featureID == notification.featureID
                        ) {
                            this.newValue = notification.newValue;
                            if (notification.eventType == EventType.SET)
                                this.eventType = EventType.SET;
                            return true;
                        }
                        break;
                    }
                }
                break;
            }
            case EventType.REMOVE: {
                switch (notification.eventType) {
                    case EventType.REMOVE: {
                        if (
                            this.notifier == notification.notifier &&
                            this.featureID == notification.featureID
                        ) {
                            this.eventType = EventType.REMOVE_MANY;
                            let originalPosition = this.position;
                            let notificationPosition = notification.position;
                            let removedValues: any[] = [];
                            if (originalPosition <= notificationPosition) {
                                removedValues = [this.oldValue, notification.oldValue];
                                this.position = originalPosition;
                                this.newValue = [originalPosition, notificationPosition + 1];
                            } else {
                                removedValues = [notification.oldValue, this.oldValue];
                                this.position = notificationPosition;
                                this.newValue = [notificationPosition, originalPosition];
                            }
                            this.oldValue = removedValues;
                            return true;
                        }
                        break;
                    }
                }
                break;
            }
            case EventType.REMOVE_MANY: {
                switch (notification.eventType) {
                    case EventType.REMOVE: {
                        if (
                            this.notifier == notification.notifier &&
                            this.featureID == notification.featureID
                        ) {
                            let notificationPosition = notification.position;
                            let positions: number[] = this.newValue || [];
                            let newPositions: number[] = new Array(positions.length + 1);

                            let index = 0;
                            for (const oldPosition of positions) {
                                if (oldPosition <= notificationPosition) {
                                    newPositions[index++] = oldPosition;
                                    ++notificationPosition;
                                } else break;
                            }

                            let oldValue: any[] = this.oldValue || [];
                            oldValue.splice(index, 0, notification.oldValue);

                            newPositions[index] = notificationPosition;
                            while (++index < positions.length + 1)
                                newPositions[index] = positions[index - 1];

                            this.oldValue = oldValue;
                            this.newValue = newPositions;
                            return true;
                        }
                        break;
                    }
                }
                break;
            }
        }
        return false;
    }

    add(notification: ENotification): boolean {
        if (!notification) return false;
        if (this.merge(notification)) return false;
        if (!this._next) {
            if (notification instanceof AbstractNotification) {
                this._next = notification;
                return true;
            } else {
                this._next = new NotificationChain();
                return this._next.add(notification);
            }
        } else return this._next.add(notification);
    }

    dispatch(): void {
        if (this.notifier) this.notifier.eNotify(this);
        if (this._next) this._next.dispatch();
    }
}
