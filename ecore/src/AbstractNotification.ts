// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import { ENotification, EventType } from "./ENotification";
import { ENotifier } from "./ENotifier";
import { EStructuralFeature } from "./EStructuralFeature";
import { ENotificationChain } from "./ENOtificationChain";
import { NotificationChain } from "./NotificationChain";

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
                            var originalPosition = this.position;
                            var notificationPosition = notification.position;
                            var removedValues: any[] = [];
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
                            var notificationPosition = notification.position;
                            var positions: number[] = this.newValue || [];
                            var newPositions: number[] = new Array(positions.length + 1);

                            var index = 0;
                            for (const oldPosition of positions) {
                                if (oldPosition <= notificationPosition) {
                                    newPositions[index++] = oldPosition;
                                    ++notificationPosition;
                                } else break;
                            }

                            var oldValue: any[] = this.oldValue || [];
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
        if (notification == null) return false;
        if (this.merge(notification)) return false;
        if (this._next == null) {
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
        if (this.notifier != null && this.eventType != -1) this.notifier.eNotify(this);
        if (this._next != null) this._next.dispatch();
    }
}
