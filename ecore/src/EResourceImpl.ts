// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs";
import {
    AbstractNotification,
    AbstractNotifyingList,
    BasicEList,
    EcoreUtils,
    EDiagnostic,
    EList,
    ENotificationChain,
    ENotifier,
    ENotifierImpl,
    ENotifyingList,
    EObject,
    EObjectInternal,
    EObjectList,
    EResource,
    EResourceConstants,
    EResourceIDManager,
    EResourceInternal,
    EResourceSet,
    EStructuralFeature,
    ETreeIterator,
    EURIConverter,
    EURIConverterImpl,
    EventType,
    NotificationChain,
} from "./internal";

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

export class EResourceImpl extends ENotifierImpl implements EResourceInternal {
    private _uri: URL = null;
    private _resourceIDManager: EResourceIDManager = null;
    private _isLoaded: boolean = false;
    private _resourceSet: EResourceSet = null;
    private _contents: EList<EObject> = null;
    private _errors: EList<EDiagnostic> = null;
    private _warnings: EList<EDiagnostic> = null;
    private static _defaultURIConverter = new EURIConverterImpl();

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
        if (!this._contents) this._contents = new ResourceContents(this);
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
                        fragmentPath.unshift(
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
                    fragmentPath.unshift(this.getURIFragmentRootSegment(internalEObject));
                } else {
                    fragmentPath.unshift("?" + id);
                }
                fragmentPath.unshift("");
                return fragmentPath.join("/");
            }
        }
    }

    getErrors(): EList<EDiagnostic> {
        if (!this._errors) {
            this._errors = new BasicEList<EDiagnostic>();
        }
        return this._errors;
    }

    getWarnings(): EList<EDiagnostic> {
        if (!this._warnings) {
            this._warnings = new BasicEList<EDiagnostic>();
        }
        return this._warnings;
    }

    load(options?: Map<string, any>): Promise<void> {
        if (!this._isLoaded) {
            let uriConverter = this.getURIConverter();
            if (uriConverter) {
                let s = uriConverter.createReadStream(this._uri);
                if (s) {
                    return this.loadFromStream(s, options);
                }
            }
        }
        return Promise.resolve();
    }

    loadFromStream(s: fs.ReadStream, options?: Map<string, any>): Promise<void> {
        if (!this._isLoaded) {
            return this.doLoadFromStream(s, options).then(() => {
                let n = this.basicSetLoaded(true, null);
                if (n) {
                    n.dispatch();
                }
            });
        }
        return Promise.resolve();
    }

    loadSync(options?: Map<string, any>) {
        if (!this._isLoaded) {
            let uriConverter = this.getURIConverter();
            if (uriConverter) {
                let s = uriConverter.readSync(this._uri);
                if (s) {
                    return this.loadFromString(s, options);
                }
            }
        }
    }

    loadFromString(s: string, options?: Map<string, any>) {
        this.doLoadFromString(s, options);
        let n = this.basicSetLoaded(true, null);
        if (n) {
            n.dispatch();
        }
    }

    protected doLoadFromStream(s: fs.ReadStream, options: Map<string, any>): Promise<void> {
        return null;
    }

    protected doLoadFromString(s: string, options: Map<string, any>): void {
        return null;
    }

    unload(): void {
        if (this._isLoaded) {
            let n = this.basicSetLoaded(false, null);
            this.doUnload();
            if (n) {
                n.dispatch();
            }
        }
    }

    protected doUnload(): void {
        this._contents = null;
        this._errors = null;
        this._warnings = null;
        this._resourceIDManager?.clear();
    }

    save(options?: Map<string, any>): Promise<void> {
        let uriConverter = this.getURIConverter();
        if (uriConverter) {
            let s = uriConverter.createWriteStream(this._uri);
            if (s) {
                return new Promise<void>((resolve,reject) => {
                    this.saveToStream(s,options).then( () => resolve() ).catch( reason => reject(reason) ).finally( () => s.end() );
                })
            }
        }
        return Promise.reject();
    }

    saveToStream(s: fs.WriteStream, options?: Map<string, any>): Promise<void> {
        return this.doSaveToStream(s, options);
    }

    saveSync(options?: Map<string, any>) {
        let uriConverter = this.getURIConverter();
        if (uriConverter) {
            uriConverter.writeSync(this._uri, this.saveToString(options));
        }
    }

    saveToString(options?: Map<string, any>): string {
        return this.doSaveToString(options);
    }

    protected doSaveToStream(s: fs.WriteStream, options: Map<string, any>): Promise<void> {
        return null;
    }

    protected doSaveToString(options: Map<string, any>): string {
        return "";
    }

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
            if (!notifications) {
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
            if (!notifications) {
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
        if (!uriFragmentPath || uriFragmentPath.length == 0)
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
