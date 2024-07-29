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
    NotificationChain
} from "./internal.js"

export abstract class AbstractNotification implements ENotification, ENotificationChain {
    private _eventType: EventType
    private _oldValue: any
    private _newValue: any
    private _position: number
    private _next: ENotificationChain

    constructor(eventType: EventType, oldValue: any, newValue: any, position: number) {
        this._eventType = eventType
        this._oldValue = oldValue
        this._newValue = newValue
        this._position = position
        this._next = null
    }

    getEventType(): EventType {
        return this._eventType
    }

    abstract getNotifier(): ENotifier

    abstract getFeature(): EStructuralFeature

    abstract getFeatureID(): number

    getOldValue() {
        return this._oldValue
    }

    getNewValue() {
        return this._newValue
    }

    getPosition(): number {
        return this._position
    }

    merge(notification: ENotification): boolean {
        switch (this._eventType) {
            case EventType.SET:
            case EventType.UNSET: {
                switch (notification.getEventType()) {
                    case EventType.SET:
                    case EventType.UNSET: {
                        if (
                            this.getNotifier() == notification.getNotifier() &&
                            this.getFeatureID() == notification.getFeatureID()
                        ) {
                            this._newValue = notification.getNewValue()
                            if (notification.getEventType() == EventType.SET) this._eventType = EventType.SET
                            return true
                        }
                        break
                    }
                }
                break
            }
            case EventType.REMOVE: {
                switch (notification.getEventType()) {
                    case EventType.REMOVE: {
                        if (
                            this.getNotifier() == notification.getNotifier() &&
                            this.getFeatureID() == notification.getFeatureID()
                        ) {
                            this._eventType = EventType.REMOVE_MANY
                            const originalPosition = this._position
                            const notificationPosition = notification.getPosition()
                            let removedValues: any[] = []
                            if (originalPosition <= notificationPosition) {
                                removedValues = [this.getOldValue(), notification.getOldValue()]
                                this._position = originalPosition
                                this._newValue = [originalPosition, notificationPosition + 1]
                            } else {
                                removedValues = [notification.getOldValue(), this.getOldValue()]
                                this._position = notificationPosition
                                this._newValue = [notificationPosition, originalPosition]
                            }
                            this._oldValue = removedValues
                            return true
                        }
                        break
                    }
                }
                break
            }
            case EventType.REMOVE_MANY: {
                switch (notification.getEventType()) {
                    case EventType.REMOVE: {
                        if (
                            this.getNotifier() == notification.getNotifier() &&
                            this.getFeatureID() == notification.getFeatureID()
                        ) {
                            let notificationPosition = notification.getPosition()
                            const positions: number[] = this._newValue || []
                            const newPositions: number[] = new Array(positions.length + 1)
                            let index = 0
                            for (const oldPosition of positions) {
                                if (oldPosition <= notificationPosition) {
                                    newPositions[index++] = oldPosition
                                    ++notificationPosition
                                } else break
                            }

                            const oldValue: any[] = this._oldValue || []
                            oldValue.splice(index, 0, notification.getOldValue())

                            newPositions[index] = notificationPosition
                            while (++index < positions.length + 1) newPositions[index] = positions[index - 1]

                            this._oldValue = oldValue
                            this._newValue = newPositions
                            return true
                        }
                        break
                    }
                }
                break
            }
        }
        return false
    }

    add(notification: ENotification): boolean {
        if (!notification) return false
        if (this.merge(notification)) return false
        if (!this._next) {
            if (notification instanceof AbstractNotification) {
                this._next = notification
                return true
            } else {
                this._next = new NotificationChain()
                return this._next.add(notification)
            }
        } else return this._next.add(notification)
    }

    dispatch(): void {
        if (this.getNotifier()) this.getNotifier().eNotify(this)
        if (this._next) this._next.dispatch()
    }
}
