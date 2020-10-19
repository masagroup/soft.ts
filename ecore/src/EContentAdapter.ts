// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import {
    Adapter,
    EventType,
    ENotification,
    ENotifier,
    EResourceConstants,
    EResourceSetConstants,
    isEObject,
    isEObjectInternal,
    isEReference,
    isEResource,
    isEResourceSet,
} from "./internal";

export class EContentAdapter extends Adapter {
    notifyChanged(notification: ENotification): void {
        this.selfAdapt(notification);
    }

    get target(): ENotifier {
        return super.target;
    }

    set target(notifier: ENotifier) {
        if (notifier == null) {
            this.unsetTarget(this.target);
        } else {
            super.target = notifier;
            let l: Iterable<ENotifier> = null;
            if (isEObject(notifier)) {
                l = notifier.eContents();
            } else if (isEResource(notifier)) {
                l = notifier.eContents();
            } else if (isEResourceSet(notifier)) {
                l = notifier.getResources();
            }
            for (let n of l) {
                this.addAdapter(n);
            }
        }
    }

    unsetTarget(notifier: ENotifier) {
        super.unsetTarget(notifier);
        if (isEObject(notifier)) {
            for (let n of notifier.eContents()) {
                this.removeAdapterWithChecks(n, false, true);
            }
        } else if (isEResource(notifier)) {
            for (let n of notifier.eContents()) {
                this.removeAdapterWithChecks(n, true, false);
            }
        } else if (isEResourceSet(notifier)) {
            for (let n of notifier.getResources()) {
                this.removeAdapterWithChecks(n, false, false);
            }
        }
    }

    private selfAdapt(notification: ENotification) {
        let notifier = notification.notifier;
        if (isEObject(notifier)) {
            let feature = notification.feature;
            if (isEReference(feature) && feature.isContainment) {
                this.handleContainment(notification);
            }
        } else if (isEResource(notifier)) {
            if (notification.featureID == EResourceConstants.RESOURCE__CONTENTS) {
                this.handleContainment(notification);
            }
        } else if (isEResourceSet(notifier)) {
            if (notification.featureID == EResourceSetConstants.RESOURCE_SET__RESOURCES) {
                this.handleContainment(notification);
            }
        }
    }

    handleContainment(notification: ENotification) {
        switch (notification.eventType) {
            case EventType.RESOLVE: {
                // We need to be careful that the proxy may be resolved while we are attaching this adapter.
                // We need to avoid attaching the adapter during the resolve
                // and also attaching it again as we walk the eContents() later.
                // Checking here avoids having to check during addAdapter.
                //
                let oldNotifier = notification.oldValue as ENotifier;
                if (oldNotifier.eAdapters.contains(this)) {
                    this.removeAdapter(oldNotifier);
                    this.addAdapter(notification.newValue as ENotifier);
                }
                break;
            }
            case EventType.UNSET: {
                this.removeAdapterWithChecks(notification.oldValue as ENotifier, false, true);
                this.addAdapter(notification.newValue as ENotifier);
                break;
            }
            case EventType.SET: {
                this.removeAdapterWithChecks(notification.oldValue as ENotifier, false, true);
                this.addAdapter(notification.newValue as ENotifier);
                break;
            }
            case EventType.ADD: {
                this.addAdapter(notification.newValue() as ENotifier);
                break;
            }
            case EventType.ADD_MANY: {
                let newValues = notification.newValue as any[];
                for (let notifier of newValues) {
                    this.addAdapter(notifier);
                }
                break;
            }
            case EventType.REMOVE: {
                if (notification.oldValue) {
                    let checkContainer = isEResource(notification.notifier);
                    let checkResource = notification.feature != null;
                    this.removeAdapterWithChecks(
                        notification.oldValue as ENotifier,
                        checkContainer,
                        checkResource
                    );
                }
                break;
            }
            case EventType.REMOVE_MANY: {
                let checkContainer = isEResource(notification.notifier);
                let checkResource = notification.feature != null;
                let oldValues = notification.oldValue as any[];
                for (let notifier of oldValues) {
                    this.removeAdapterWithChecks(notifier, checkContainer, checkResource);
                }
                break;
            }
        }
    }

    private addAdapter(notifier: ENotifier): void {
        if (notifier) {
            if (!notifier.eAdapters.contains(this)) {
                notifier.eAdapters.add(this);
            }
        }
    }

    private removeAdapter(notifier: ENotifier): void {
        if (notifier) {
            notifier.eAdapters.remove(this);
        }
    }

    private removeAdapterWithChecks(
        notifier: ENotifier,
        checkContainer: boolean,
        checkResource: boolean
    ): void {
        if (notifier) {
            if (checkContainer || checkResource) {
                if (isEObjectInternal(notifier)) {
                    if (checkResource) {
                        if (
                            notifier.eInternalResource() &&
                            notifier.eInternalResource().eAdapters.contains(this)
                        ) {
                            return;
                        }
                    }
                    if (checkContainer) {
                        if (
                            notifier.eInternalContainer() &&
                            notifier.eInternalResource().eAdapters.contains(this)
                        ) {
                            return;
                        }
                    }
                }
            }
            this.removeAdapter(notifier);
        }
    }
}
