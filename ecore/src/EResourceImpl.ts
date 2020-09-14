// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import { AbstractNotification } from "./AbstractNotification";
import { AbstractNotifyingList } from "./AbstractNotifyingList";
import { BasicEList } from "./BasicEList";
import { BasicNotifier } from "./BasicNotifier";
import { EcoreUtils } from "./EcoreUtils";
import { EDiagnostic } from "./EDiagnostic";
import { EList } from "./EList";
import { EventType } from "./ENotification";
import { ENotificationChain } from "./ENOtificationChain";
import { ENotifier } from "./ENotifier";
import { ENotifyingList } from "./ENotifyingList";
import { EObject } from "./EObject";
import { EObjectInternal } from "./EObjectInternal";
import { EObjectList } from "./EObjectList";
import { EResource, EResourceConstants } from "./EResource";
import { EResourceIDManager } from "./EResourceIDManager";
import { EResourceSet } from "./EResourceSet";
import { EStructuralFeature } from "./EStructuralFeature";
import { ETreeIterator } from "./ETreeIterator";
import { EURIConverter } from "./EURIConverter";
import { NotificationChain } from "./NotificationChain";

class ResourceNotification extends AbstractNotification {
    private _notifier: ENotifier;
    private _featureID: number;

    constructor(
        notifier: ENotifier,
        featureID: number,
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number = -1
    ) {
        super(eventType, oldValue, newValue, position);
        this._notifier = notifier;
        this._featureID = featureID;
    }

    get notifier(): ENotifier {
        return this._notifier;
    }

    get feature(): EStructuralFeature {
        return null;
    }

    get featureID(): number {
        return this._featureID;
    }
}

class ResourceContents extends AbstractNotifyingList<EObject> implements EObjectList<EObject> {
    private _resource: EResource;

    constructor(resource: EResource) {
        super();
        this._resource = resource;
    }

    get notifier(): ENotifier {
        return this._resource;
    }

    get feature(): EStructuralFeature {
        return null;
    }

    get featureID(): number {
        return EResourceConstants.RESOURCE__CONTENTS;
    }

    getUnResolvedList(): EList<EObject> {
        return this;
    }

    protected inverseAdd(eObject: EObject, notifications: ENotificationChain): ENotificationChain {
        let n = (eObject as EObjectInternal).eSetResource(this._resource, notifications);
        this._resource.attached(eObject);
        return n;
    }

    protected inverseRemove(
        eObject: EObject,
        notifications: ENotificationChain
    ): ENotificationChain {
        this._resource.detached(eObject);
        let n = (eObject as EObjectInternal).eSetResource(null, notifications);
        return n;
    }
}

export class EResourceImpl extends BasicNotifier implements EResource {
    private _uri: URL;
    private _resourceIDManager: EResourceIDManager;
    private _isLoaded: boolean;
    private _resourceSet: EResourceSet;
    private _contents: EList<EObject>;
    private _errors: EList<EDiagnostic>;
    private _warnings: EList<EDiagnostic>;
    private static _defaultURIConverter = null;

    constructor() {
        super();
        this._isLoaded = false;
    }

    get eURI(): URL {
        return this._uri;
    }

    set eURI(uri: URL) {
        let oldURI = this._uri;
        this._uri = uri;
        if (this.eNotificationRequired) {
            this.eNotify(
                new ResourceNotification(
                    this,
                    EResourceConstants.RESOURCE__URI,
                    EventType.SET,
                    oldURI,
                    uri,
                    -1
                )
            );
        }
    }

    get eResourceIDManager() {
        return this._resourceIDManager;
    }

    set eResourceIDManager(eResourceIDManager: EResourceIDManager) {
        this._resourceIDManager = eResourceIDManager;
    }

    get isLoaded() {
        return this._isLoaded;
    }

    eResourceSet(): EResourceSet {
        return this._resourceSet;
    }

    eContents(): EList<EObject> {
        if (this._contents == null) this._contents = new ResourceContents(this);
        return this._contents;
    }

    eAllContents(): IterableIterator<EObject> {
        return this.eAllContentsResolve(true);
    }

    getEObject(uriFragment: string): EObject {
        let id = uriFragment;
        if (uriFragment.length > 0) {
            if (uriFragment.charAt(0) == "/") {
                let path = uriFragment.split("/");
                path = path.splice(1);
                return this.getObjectByPath(path);
            } else if (uriFragment.charAt(uriFragment.length - 1) == "?") {
                let index = uriFragment.slice(0, -2).lastIndexOf("?");
                if (index != -1) id = uriFragment.slice(0, index);
            }
        }
        return this.getObjectByID(id);
    }

    getURIFragment(eObject: EObject): string {
        let id = EcoreUtils.getEObjectID(eObject);
        if (id.length > 0) {
            return id;
        } else {
            let internalEObject = eObject as EObjectInternal;
            if (internalEObject.eInternalResource() == this) {
                return "/" + this.getURIFragmentRootSegment(eObject);
            } else {
                let fragmentPath: string[] = [];
                let isContained = false;
                for (
                    let eContainer = internalEObject.eInternalContainer() as EObjectInternal;
                    eContainer != null;
                    eContainer = internalEObject.eInternalContainer() as EObjectInternal
                ) {
                    if (id.length == 0) {
                        fragmentPath.push(
                            eContainer.eURIFragmentSegment(
                                internalEObject.eContainingFeature(),
                                internalEObject
                            )
                        );
                    }
                    internalEObject = eContainer;
                    if (eContainer.eInternalResource() == this) {
                        isContained = true;
                        break;
                    }
                }
                if (!isContained) {
                    return "/-1";
                }
                if (id.length == 0) {
                    fragmentPath.push(this.getURIFragmentRootSegment(internalEObject));
                } else {
                    fragmentPath.push("?" + id);
                }
                fragmentPath.push("");
                return fragmentPath.join("/");
            }
        }
    }

    getErrors(): EList<EDiagnostic> {
        if (this._errors == null) {
            this._errors = new BasicEList<EDiagnostic>();
        }
        return this._errors;
    }

    getWarnings(): EList<EDiagnostic> {
        if (this._warnings == null) {
            this._warnings = new BasicEList<EDiagnostic>();
        }
        return this._warnings;
    }

    load(): void {
        if (!this._isLoaded) {
            let uriConverter = this.getURIConverter();
            if (uriConverter) {
                let s = uriConverter.createReadStream(this._uri);
                if (s) {
                    this.loadFromStream(s);
                    s.close();
                }
            }
        }
    }

    loadFromStream(s: fs.ReadStream): void {
        if (!this._isLoaded) {
            let n = this.basicSetLoaded(true, null);
            this.doLoad(s);
            if (n) n.dispatch();
        }
    }

    protected doLoad(s: fs.ReadStream): void {}

    unload(): void {}

    save(): void {
        let uriConverter = this.getURIConverter();
        if (uriConverter) {
            let s = uriConverter.createWriteStream(this._uri);
            if (s) {
                this.saveToStream(s);
                s.close();
            }
        }
    }

    saveToStream(s: fs.WriteStream): void {
        this.doSave(s);
    }

    protected doSave(s: fs.WriteStream): void {}

    attached(object: EObject): void {
        if (this._resourceIDManager) this._resourceIDManager.register(object);
    }

    detached(object: EObject): void {
        if (this._resourceIDManager) this._resourceIDManager.unRegister(object);
    }

    basicSetLoaded(isLoaded: boolean, msgs: ENotificationChain): ENotificationChain {
        let notifications = msgs;
        let oldLoaded = this._isLoaded;
        this._isLoaded = isLoaded;
        if (this.eNotificationRequired) {
            if (notifications == null) {
                notifications = new NotificationChain();
            }
            notifications.add(
                new ResourceNotification(
                    this,
                    EResourceConstants.RESOURCE__IS_LOADED,
                    EventType.SET,
                    oldLoaded,
                    this._isLoaded
                )
            );
        }
        return notifications;
    }

    basicSetResourceSet(resourceSet: EResourceSet, msgs: ENotificationChain): ENotificationChain {
        let notifications = msgs;
        let oldResourseSet = this._resourceSet;
        if (oldResourseSet) {
            let list = oldResourseSet.getResources() as ENotifyingList<EResource>;
            notifications = list.removeWithNotification(this, notifications);
        }
        this._resourceSet = resourceSet;
        if (this.eNotificationRequired) {
            if (notifications == null) {
                notifications = new NotificationChain();
            }
            notifications.add(
                new ResourceNotification(
                    this,
                    EResourceConstants.RESOURCE__RESOURCE_SET,
                    EventType.SET,
                    oldResourseSet,
                    this._resourceSet
                )
            );
        }
        return notifications;
    }

    private eAllContentsResolve(resolve: boolean): IterableIterator<EObject> {
        return new ETreeIterator<any, EObject>(this, false, function (o: any): Iterator<EObject> {
            let contents: EList<EObject> = o.eContents();
            if (!resolve) contents = (contents as EObjectList<EObject>).getUnResolvedList();
            return contents[Symbol.iterator]();
        });
    }

    private getObjectByID(id: string): EObject {
        if (this._resourceIDManager) return this._resourceIDManager.getEObject(id);

        for (const eObject of this.eAllContentsResolve(false)) {
            let objectID = EcoreUtils.getEObjectID(eObject);
            if (id == objectID) return eObject;
        }

        return null;
    }

    private getObjectByPath(uriFragmentPath: string[]): EObject {
        let eObject: EObject = null;
        if (uriFragmentPath == null || uriFragmentPath.length == 0)
            eObject = this.getObjectForRootSegment("");
        else eObject = this.getObjectForRootSegment(uriFragmentPath[0]);

        for (let i = 1; i < uriFragmentPath.length && eObject != null; i++)
            eObject = (eObject as EObjectInternal).eObjectForFragmentSegment(uriFragmentPath[i]);

        return eObject;
    }

    private getObjectForRootSegment(rootSegment: string): EObject {
        let pos = 0;
        if (rootSegment.length > 0) {
            if (rootSegment.charAt(0) == "?") return this.getObjectByID(rootSegment.slice(1));
            else pos = parseInt(rootSegment);
        }

        if (pos >= 0 && pos < this.eContents().size()) return this.eContents().get(pos);

        return null;
    }

    private getURIFragmentRootSegment(eObject: EObject): string {
        let contents = this.eContents();
        if (contents.size() > 1) {
            return contents.indexOf(eObject).toString();
        } else {
            return "";
        }
    }

    private getURIConverter(): EURIConverter {
        return this._resourceSet
            ? this._resourceSet.getURIConverter()
            : EResourceImpl._defaultURIConverter;
    }
}
