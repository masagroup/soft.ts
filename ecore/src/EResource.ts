// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    BufferLike,
    EDiagnostic,
    EList,
    ENotifier,
    EObject,
    EObjectIDManager,
    EResourceListener,
    EResourceSet,
    ReadableStreamLike,
    URI
} from "./internal.js"

export class EResourceConstants {
    public static readonly RESOURCE__RESOURCE_SET: number = 0

    public static readonly RESOURCE__URI: number = 1

    public static readonly RESOURCE__CONTENTS: number = 2

    public static readonly RESOURCE__IS_LOADED: number = 4
}

export interface EResource extends ENotifier, EResourceListener {
    getURI(): URI
    setURI(uri: URI): void

    getObjectIDManager(): EObjectIDManager
    setObjectIDManager(objectIDManager: EObjectIDManager): void

    eResourceSet(): EResourceSet
    eContents(): EList<EObject>
    eAllContents(): IterableIterator<EObject>

    load(options?: Map<string, any>): Promise<void>
    loadFromStream(stream: ReadableStreamLike<BufferLike>, options?: Map<string, any>): Promise<void>

    loadSync(options?: Map<string, any>): void
    loadFromString(s: string, options?: Map<string, any>): void
    loadFromBuffer(buffer: BufferLike, options?: Map<string, any>): void

    unload(): void
    isLoaded(): boolean
    isLoading(): boolean

    save(options?: Map<string, any>): Promise<void>
    saveToStream(stream: WritableStream, options?: Map<string, any>): Promise<void>

    saveSync(options?: Map<string, any>): void
    saveToString(options?: Map<string, any>): string
    saveToBuffer(options?: Map<string, any>): Uint8Array

    getEObject(uriFragment: string): EObject
    getURIFragment(object: EObject): string

    getErrors(): EList<EDiagnostic>
    getWarnings(): EList<EDiagnostic>

    getResourceListeners(): EList<EResourceListener>
}

export function isEResource(o: any): o is EResource {
    return o == undefined ? undefined : "eResourceSet" in o
}
