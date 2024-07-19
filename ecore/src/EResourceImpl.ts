// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { getCodecRegistry } from "./ECodecRegistry.js"
import { EEncoder } from "./EEncoder.js"
import {
    AbstractNotification,
    AbstractNotifyingList,
    BasicEList,
    BufferLike,
    ECodecRegistry,
    EcoreUtils,
    EDecoder,
    EDiagnostic,
    EDiagnosticImpl,
    EList,
    ENotificationChain,
    ENotifier,
    ENotifierImpl,
    ENotifyingList,
    EObject,
    EObjectIDManager,
    EObjectInternal,
    EObjectList,
    EResource,
    EResourceConstants,
    EResourceInternal,
    EResourceSet,
    EStructuralFeature,
    ETreeIterator,
    EURIConverter,
    EURIConverterImpl,
    EventType,
    NotificationChain,
    ReadableStreamLike,
    URI
} from "./internal.js"
import { ensureAsyncIterable } from "./utils/Stream.js"
import { ensureUint8Array } from "./utils/TypedArray.js"
import { utf8Count, utf8Decode, utf8Encode } from "./utils/UTF8.js"

class ResourceNotification extends AbstractNotification {
    private _notifier: ENotifier
    private _featureID: number

    constructor(
        notifier: ENotifier,
        featureID: number,
        eventType: EventType,
        oldValue: any,
        newValue: any,
        position: number = -1
    ) {
        super(eventType, oldValue, newValue, position)
        this._notifier = notifier
        this._featureID = featureID
    }

    get notifier(): ENotifier {
        return this._notifier
    }

    get feature(): EStructuralFeature {
        return null
    }

    get featureID(): number {
        return this._featureID
    }
}

class ResourceContents extends AbstractNotifyingList<EObject> implements EObjectList<EObject> {
    private _resource: EResourceImpl

    constructor(resource: EResourceImpl) {
        super()
        this._resource = resource
    }

    get notifier(): ENotifier {
        return this._resource
    }

    get feature(): EStructuralFeature {
        return null
    }

    get featureID(): number {
        return EResourceConstants.RESOURCE__CONTENTS
    }

    getUnResolvedList(): EList<EObject> {
        return this
    }

    protected inverseAdd(eObject: EObject, notifications: ENotificationChain): ENotificationChain {
        let n = (eObject as EObjectInternal).eSetResource(this._resource, notifications)
        this._resource.attached(eObject)
        return n
    }

    protected inverseRemove(eObject: EObject, notifications: ENotificationChain): ENotificationChain {
        this._resource.detached(eObject)
        let n = (eObject as EObjectInternal).eSetResource(null, notifications)
        return n
    }

    protected didAdd(index: number, e: EObject): void {
        super.didAdd(index, e)
        if (index == this.size() - 1) {
            this.loaded()
        }
    }

    protected didRemove(index: number, e: EObject): void {
        super.didRemove(index, e)
        if (this.size() == 0) {
            this.unloaded()
        }
    }

    protected didClear(elements: EObject[]): void {
        super.didClear(elements)
        this.unloaded()
    }

    private loaded(): void {
        if (!this._resource.isLoaded) {
            let n = this._resource.basicSetLoaded(true, null)
            if (n) {
                n.dispatch()
            }
        }
    }

    private unloaded(): void {
        if (this._resource.isLoaded) {
            let n = this._resource.basicSetLoaded(false, null)
            if (n) {
                n.dispatch()
            }
        }
    }
}

export class EResourceImpl extends ENotifierImpl implements EResourceInternal {
    private _uri: URI = null
    private _objectIDManager: EObjectIDManager = null
    private _isLoaded: boolean = false
    private _isLoading: boolean = false
    private _resourceSet: EResourceSet = null
    private _contents: EList<EObject> = null
    private _errors: EList<EDiagnostic> = null
    private _warnings: EList<EDiagnostic> = null
    private static _defaultURIConverter = new EURIConverterImpl()

    get eURI(): URI {
        return this._uri
    }

    set eURI(uri: URI) {
        let oldURI = this._uri
        this._uri = uri
        if (this.eNotificationRequired) {
            this.eNotify(
                new ResourceNotification(this, EResourceConstants.RESOURCE__URI, EventType.SET, oldURI, uri, -1)
            )
        }
    }

    get eObjectIDManager() {
        return this._objectIDManager
    }

    set eObjectIDManager(eObjectIDManager: EObjectIDManager) {
        this._objectIDManager = eObjectIDManager
    }

    get isLoaded() {
        return this._isLoaded
    }

    get isLoading() {
        return this._isLoading
    }

    eResourceSet(): EResourceSet {
        return this._resourceSet
    }

    eContents(): EList<EObject> {
        if (!this._contents) this._contents = new ResourceContents(this)
        return this._contents
    }

    eAllContents(): IterableIterator<EObject> {
        return this.eAllContentsResolve(this, true)
    }

    getEObject(uriFragment: string): EObject {
        let id = uriFragment
        if (uriFragment.length > 0) {
            if (uriFragment.charAt(0) == "/") {
                let path = uriFragment.split("/")
                path = path.splice(1)
                return this.getObjectByPath(path)
            } else if (uriFragment.charAt(uriFragment.length - 1) == "?") {
                let index = uriFragment.slice(0, -2).lastIndexOf("?")
                if (index != -1) id = uriFragment.slice(0, index)
            }
        }
        return this.getObjectByID(id)
    }

    getURIFragment(eObject: EObject): string {
        let id = EcoreUtils.getEObjectID(eObject)
        if (id.length > 0) {
            return id
        } else {
            let internalEObject = eObject as EObjectInternal
            if (internalEObject.eInternalResource() == this) {
                id = this.getIDForObject(eObject)
                return id.length > 0 ? id : "/" + this.getURIFragmentRootSegment(eObject)
            } else {
                let fragmentPath: string[] = []
                let isContained = false
                for (
                    let eContainer = internalEObject.eInternalContainer() as EObjectInternal;
                    eContainer != null;
                    eContainer = internalEObject.eInternalContainer() as EObjectInternal
                ) {
                    id = this.getIDForObject(eObject)
                    if (id.length == 0) {
                        fragmentPath.unshift(
                            eContainer.eURIFragmentSegment(internalEObject.eContainingFeature(), internalEObject)
                        )
                    }
                    internalEObject = eContainer
                    if (eContainer.eInternalResource() == this) {
                        isContained = true
                        break
                    }
                }
                if (!isContained) {
                    return "/-1"
                }
                if (id.length == 0) {
                    fragmentPath.unshift(this.getURIFragmentRootSegment(internalEObject))
                } else {
                    fragmentPath.unshift("?" + id)
                }
                fragmentPath.unshift("")
                return fragmentPath.join("/")
            }
        }
    }

    getErrors(): EList<EDiagnostic> {
        if (!this._errors) {
            this._errors = new BasicEList<EDiagnostic>()
        }
        return this._errors
    }

    getWarnings(): EList<EDiagnostic> {
        if (!this._warnings) {
            this._warnings = new BasicEList<EDiagnostic>()
        }
        return this._warnings
    }

    async load(options?: Map<string, any>): Promise<void> {
        if (!this._isLoaded) {
            let uriConverter = this.getURIConverter()
            if (uriConverter) {
                let s = uriConverter.createReadStream(this._uri)
                if (s) {
                    return this.loadFromStream(s, options)
                }
            }
        }
    }

    async loadFromStream(stream: ReadableStreamLike<BufferLike>, options?: Map<string, any>): Promise<void> {
        if (!this._isLoaded) {
            let codecs = this.getCodecRegistry()
            let codec = codecs.getCodec(this._uri)
            if (codec) {
                let decoder = codec.newDecoder(this, options)
                if (decoder) {
                    this._isLoading = true
                    let n = this.basicSetLoaded(true, null)
                    let iterable = ensureAsyncIterable(stream)
                    await this.doLoadFromStream(decoder, iterable)
                    if (n) {
                        n.dispatch()
                    }
                    this._isLoading = false
                } else {
                    let errors = this.getErrors()
                    errors.clear()
                    errors.add(
                        new EDiagnosticImpl(
                            "Unable to create decoder for '" + this._uri.toString() + "'",
                            this._uri.toString(),
                            0,
                            0
                        )
                    )
                }
            } else {
                let errors = this.getErrors()
                errors.clear()
                errors.add(
                    new EDiagnosticImpl(
                        "Unable to find codec for '" + this._uri.toString() + "'",
                        this._uri.toString(),
                        0,
                        0
                    )
                )
            }
        }
    }

    protected async doLoadFromStream(decoder: EDecoder, stream: ReadableStreamLike<BufferLike>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            decoder
                .decodeAsync(stream)
                .then(() => resolve())
                .catch((reason) => reject(reason))
        })
    }

    loadSync(options?: Map<string, any>) {
        if (!this._isLoaded) {
            let uriConverter = this.getURIConverter()
            if (uriConverter) {
                let buffer = uriConverter.readSync(this._uri)
                if (buffer) {
                    this.loadFromBuffer(buffer, options)
                }
            }
        }
    }

    loadFromBuffer(buffer: BufferLike, options?: Map<string, any>) {
        if (!this._isLoaded) {
            let codecs = this.getCodecRegistry()
            let codec = codecs.getCodec(this._uri)
            if (codec) {
                let decoder = codec.newDecoder(this, options)
                if (decoder) {
                    this._isLoading = true
                    let n = this.basicSetLoaded(true, null)
                    let array = ensureUint8Array(buffer)
                    this.doLoadFromBytes(decoder, array)
                    if (n) {
                        n.dispatch()
                    }
                    this._isLoading = false
                } else {
                    let errors = this.getErrors()
                    errors.clear()
                    errors.add(
                        new EDiagnosticImpl(
                            "Unable to create decoder for '" + this._uri.toString() + "'",
                            this._uri.toString(),
                            0,
                            0
                        )
                    )
                }
            } else {
                let errors = this.getErrors()
                errors.clear()
                errors.add(
                    new EDiagnosticImpl(
                        "Unable to find codec for '" + this._uri.toString() + "'",
                        this._uri.toString(),
                        0,
                        0
                    )
                )
            }
        }
    }

    loadFromString(s: string, options?: Map<string, any>) {
        const byteLength = utf8Count(s)
        const bytes = new Uint8Array(byteLength)
        const buffer = utf8Encode(s, bytes, 0)
        this.loadFromBuffer(bytes, options)
    }

    protected doLoadFromBytes(decoder: EDecoder, buffer: BufferLike): void {
        decoder.decode(buffer)
    }

    unload(): void {
        if (this._isLoaded) {
            let n = this.basicSetLoaded(false, null)
            this.doUnload()
            if (n) {
                n.dispatch()
            }
        }
    }

    protected doUnload(): void {
        this._contents = null
        this._errors = null
        this._warnings = null
        this._objectIDManager?.clear()
    }

    save(options?: Map<string, any>): Promise<void> {
        let uriConverter = this.getURIConverter()
        if (uriConverter) {
            let s = uriConverter.createWriteStream(this._uri)
            if (s) {
                return new Promise<void>((resolve, reject) => {
                    this.saveToStream(s, options)
                        .then(() => resolve())
                        .catch((reason) => reject(reason))
                        .finally(() => s.close())
                })
            }
        }
        return Promise.reject()
    }

    async saveToStream(stream: WritableStream, options?: Map<string, any>): Promise<void> {
        let codecs = this.getCodecRegistry()
        let codec = codecs.getCodec(this._uri)
        if (codec) {
            let encoder = codec.newEncoder(this, options)
            if (encoder) {
                return this.doSaveToStream(encoder, stream)
            } else {
                let errors = this.getErrors()
                errors.clear()
                errors.add(
                    new EDiagnosticImpl(
                        "Unable to create decoder for '" + this._uri.toString() + "'",
                        this._uri.toString(),
                        0,
                        0
                    )
                )
            }
        } else {
            let errors = this.getErrors()
            errors.clear()
            errors.add(
                new EDiagnosticImpl(
                    "Unable to find codec for '" + this._uri.toString() + "'",
                    this._uri.toString(),
                    0,
                    0
                )
            )
        }
        return Promise.reject()
    }

    saveSync(options?: Map<string, any>) {
        let uriConverter = this.getURIConverter()
        if (uriConverter) {
            uriConverter.writeSync(this._uri, this.saveToBuffer(options))
        }
    }

    saveToString(options?: Map<string, any>): string {
        let buffer = this.saveToBuffer()
        return buffer ? utf8Decode(buffer, 0, buffer.length) : ""
    }

    saveToBuffer(options?: Map<string, any>): Uint8Array {
        let codecs = this.getCodecRegistry()
        let codec = codecs.getCodec(this._uri)
        if (codec) {
            let encoder = codec.newEncoder(this, options)
            if (encoder) {
                return this.doSaveToBytes(encoder)
            } else {
                let errors = this.getErrors()
                errors.clear()
                errors.add(
                    new EDiagnosticImpl(
                        "Unable to create decoder for '" + this._uri.toString() + "'",
                        this._uri.toString(),
                        0,
                        0
                    )
                )
            }
        } else {
            let errors = this.getErrors()
            errors.clear()
            errors.add(
                new EDiagnosticImpl(
                    "Unable to find codec for '" + this._uri.toString() + "'",
                    this._uri.toString(),
                    0,
                    0
                )
            )
        }
        return null
    }

    protected doSaveToBytes(encoder: EEncoder): Uint8Array {
        let r = encoder.encode(this)
        if (r.isOk()) {
            return r.value
        }
        return null
    }

    protected doSaveToStream(encoder: EEncoder, stream: WritableStream): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            encoder
                .encodeAsync(this, stream)
                .then((r) => {
                    resolve()
                })
                .catch((reason) => reject(reason))
                .finally(() => stream.close())
        })
    }

    protected isAttachedDetachedRequired(): boolean {
        return this._objectIDManager != null
    }

    attached(object: EObject): void {
        if (this.isAttachedDetachedRequired()) {
            this.doAttached(object)
            for (const eChild of this.eAllContentsResolve(object, false)) {
                this.doAttached(eChild)
            }
        }
    }

    protected doAttached(object: EObject): void {
        if (this._objectIDManager) this._objectIDManager.register(object)
    }

    detached(object: EObject): void {
        if (this.isAttachedDetachedRequired()) {
            this.doDetached(object)
            for (const eChild of this.eAllContentsResolve(object, false)) {
                this.doDetached(eChild)
            }
        }
    }

    protected doDetached(object: EObject): void {
        if (this._objectIDManager) this._objectIDManager.unRegister(object)
    }

    basicSetLoaded(isLoaded: boolean, msgs: ENotificationChain): ENotificationChain {
        let notifications = msgs
        let oldLoaded = this._isLoaded
        this._isLoaded = isLoaded
        if (this.eNotificationRequired) {
            if (!notifications) {
                notifications = new NotificationChain()
            }
            notifications.add(
                new ResourceNotification(
                    this,
                    EResourceConstants.RESOURCE__IS_LOADED,
                    EventType.SET,
                    oldLoaded,
                    this._isLoaded
                )
            )
        }
        return notifications
    }

    basicSetResourceSet(resourceSet: EResourceSet, msgs: ENotificationChain): ENotificationChain {
        let notifications = msgs
        let oldResourseSet = this._resourceSet
        if (oldResourseSet) {
            let list = oldResourseSet.getResources() as ENotifyingList<EResource>
            notifications = list.removeWithNotification(this, notifications)
        }
        this._resourceSet = resourceSet
        if (this.eNotificationRequired) {
            if (!notifications) {
                notifications = new NotificationChain()
            }
            notifications.add(
                new ResourceNotification(
                    this,
                    EResourceConstants.RESOURCE__RESOURCE_SET,
                    EventType.SET,
                    oldResourseSet,
                    this._resourceSet
                )
            )
        }
        return notifications
    }

    private eAllContentsResolve(root: any, resolve: boolean): IterableIterator<EObject> {
        return new ETreeIterator<any, EObject>(root, false, function (o: any): Iterator<EObject> {
            let contents: EList<EObject> = o.eContents()
            if (!resolve) contents = (contents as EObjectList<EObject>).getUnResolvedList()
            return contents[Symbol.iterator]()
        })
    }

    private getObjectByID(id: string): EObject {
        if (this._objectIDManager) return this._objectIDManager.getEObject(id)

        for (const eObject of this.eAllContentsResolve(this, false)) {
            let objectID = EcoreUtils.getEObjectID(eObject)
            if (id == objectID) return eObject
        }

        return null
    }

    private getIDForObject(eObject: EObject): string {
        let id = this._objectIDManager?.getID(eObject)
        return id !== undefined && id !== null ? String(id) : EcoreUtils.getEObjectID(eObject)
    }

    private getObjectByPath(uriFragmentPath: string[]): EObject {
        let eObject: EObject = null
        if (!uriFragmentPath || uriFragmentPath.length == 0) eObject = this.getObjectForRootSegment("")
        else eObject = this.getObjectForRootSegment(uriFragmentPath[0])

        for (let i = 1; i < uriFragmentPath.length && eObject != null; i++)
            eObject = (eObject as EObjectInternal).eObjectForFragmentSegment(uriFragmentPath[i])

        return eObject
    }

    private getObjectForRootSegment(rootSegment: string): EObject {
        let pos = 0
        if (rootSegment.length > 0) {
            if (rootSegment.charAt(0) == "?") return this.getObjectByID(rootSegment.slice(1))
            else pos = parseInt(rootSegment)
        }

        if (pos >= 0 && pos < this.eContents().size()) return this.eContents().get(pos)

        return null
    }

    private getURIFragmentRootSegment(eObject: EObject): string {
        let contents = this.eContents()
        if (contents.size() > 1) {
            return contents.indexOf(eObject).toString()
        } else {
            return ""
        }
    }

    private getURIConverter(): EURIConverter {
        return this._resourceSet ? this._resourceSet.getURIConverter() : EResourceImpl._defaultURIConverter
    }

    private getCodecRegistry(): ECodecRegistry {
        return this._resourceSet ? this._resourceSet.getCodecRegistry() : getCodecRegistry()
    }
}
