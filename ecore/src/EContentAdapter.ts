// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    AbstractEAdapter,
    ENotification,
    ENotifier,
    EResourceConstants,
    EResourceSetConstants,
    EventType,
    isEObject,
    isEObjectInternal,
    isEReference,
    isEResource,
    isEResourceSet
} from "./internal.js"

export class EContentAdapter extends AbstractEAdapter {
    notifyChanged(notification: ENotification): void {
        this.selfAdapt(notification)
    }

    setTarget(notifier: ENotifier) {
        if (notifier == null) {
            this.unsetTarget(this.getTarget())
        } else {
            super.setTarget(notifier)
            let l: Iterable<ENotifier> = null
            if (isEObject(notifier)) {
                l = notifier.eContents()
            } else if (isEResource(notifier)) {
                l = notifier.eContents()
            } else if (isEResourceSet(notifier)) {
                l = notifier.getResources()
            }
            for (const n of l) {
                this.addAdapter(n)
            }
        }
    }

    unsetTarget(notifier: ENotifier) {
        super.unsetTarget(notifier)
        if (isEObject(notifier)) {
            for (const n of notifier.eContents()) {
                this.removeAdapterWithChecks(n, false, true)
            }
        } else if (isEResource(notifier)) {
            for (const n of notifier.eContents()) {
                this.removeAdapterWithChecks(n, true, false)
            }
        } else if (isEResourceSet(notifier)) {
            for (const n of notifier.getResources()) {
                this.removeAdapterWithChecks(n, false, false)
            }
        }
    }

    private selfAdapt(notification: ENotification) {
        const notifier = notification.getNotifier()
        if (isEObject(notifier)) {
            const feature = notification.getFeature()
            if (isEReference(feature) && feature.isContainment()) {
                this.handleContainment(notification)
            }
        } else if (isEResource(notifier)) {
            if (notification.getFeatureID() == EResourceConstants.RESOURCE__CONTENTS) {
                this.handleContainment(notification)
            }
        } else if (isEResourceSet(notifier)) {
            if (notification.getFeatureID() == EResourceSetConstants.RESOURCE_SET__RESOURCES) {
                this.handleContainment(notification)
            }
        }
    }

    handleContainment(notification: ENotification) {
        switch (notification.getEventType()) {
            case EventType.RESOLVE: {
                // We need to be careful that the proxy may be resolved while we are attaching this adapter.
                // We need to avoid attaching the adapter during the resolve
                // and also attaching it again as we walk the eContents() later.
                // Checking here avoids having to check during addAdapter.
                //
                const oldNotifier = notification.getOldValue() as ENotifier
                if (oldNotifier.eAdapters().contains(this)) {
                    this.removeAdapter(oldNotifier)
                    this.addAdapter(notification.getNewValue() as ENotifier)
                }
                break
            }
            case EventType.UNSET: {
                this.removeAdapterWithChecks(notification.getOldValue() as ENotifier, false, true)
                this.addAdapter(notification.getNewValue() as ENotifier)
                break
            }
            case EventType.SET: {
                this.removeAdapterWithChecks(notification.getOldValue() as ENotifier, false, true)
                this.addAdapter(notification.getNewValue() as ENotifier)
                break
            }
            case EventType.ADD: {
                this.addAdapter(notification.getNewValue() as ENotifier)
                break
            }
            case EventType.ADD_MANY: {
                const newValues = notification.getNewValue() as any[]
                for (const notifier of newValues) {
                    this.addAdapter(notifier)
                }
                break
            }
            case EventType.REMOVE: {
                if (notification.getOldValue()) {
                    const checkContainer = isEResource(notification.getNotifier())
                    const checkResource = notification.getFeature() != null
                    this.removeAdapterWithChecks(notification.getOldValue() as ENotifier, checkContainer, checkResource)
                }
                break
            }
            case EventType.REMOVE_MANY: {
                const checkContainer = isEResource(notification.getNotifier())
                const checkResource = notification.getFeature() != null
                const oldValues = notification.getOldValue() as any[]
                for (const notifier of oldValues) {
                    this.removeAdapterWithChecks(notifier, checkContainer, checkResource)
                }
                break
            }
        }
    }

    private addAdapter(notifier: ENotifier): void {
        if (notifier) {
            if (!notifier.eAdapters().contains(this)) {
                notifier.eAdapters().add(this)
            }
        }
    }

    private removeAdapter(notifier: ENotifier): void {
        if (notifier) {
            notifier.eAdapters().remove(this)
        }
    }

    private removeAdapterWithChecks(notifier: ENotifier, checkContainer: boolean, checkResource: boolean): void {
        if (notifier) {
            if (checkContainer || checkResource) {
                if (isEObjectInternal(notifier)) {
                    if (checkResource) {
                        if (notifier.eInternalResource() && notifier.eInternalResource().eAdapters().contains(this)) {
                            return
                        }
                    }
                    if (checkContainer) {
                        if (notifier.eInternalContainer() && notifier.eInternalResource().eAdapters().contains(this)) {
                            return
                        }
                    }
                }
            }
            this.removeAdapter(notifier)
        }
    }
}
