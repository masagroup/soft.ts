// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import {
    ENotifier,
    EObject,
    EList,
    EResourceSet,
    EDiagnostic,
    EResourceIDManager,
} from "./internal";
import * as fs from "fs";

export class EResourceConstants {
    public static readonly RESOURCE__RESOURCE_SET: number = 0;

    public static readonly RESOURCE__URI: number = 1;

    public static readonly RESOURCE__CONTENTS: number = 2;

    public static readonly RESOURCE__IS_LOADED: number = 4;
}

export interface EResource extends ENotifier {
    eURI: URL;
    eResourceIDManager: EResourceIDManager;

    eResourceSet(): EResourceSet;
    eContents(): EList<EObject>;
    eAllContents(): IterableIterator<EObject>;

    load(): Promise<void>;
    loadFromStream(s: fs.ReadStream): Promise<void>;
    loadSync();
    loadFromString(s: string): void;

    unload(): void;
    readonly isLoaded: boolean;

    save(): Promise<void>;
    saveToStream(s: fs.WriteStream): Promise<void>;
    saveSync();
    saveToString(): string;

    attached(object: EObject): void;
    detached(object: EObject): void;

    getEObject(uriFragment: string): EObject;
    getURIFragment(object: EObject): string;

    getErrors(): EList<EDiagnostic>;
    getWarnings(): EList<EDiagnostic>;
}

export function isEResource(o: any): o is EResource {
    return o == undefined ? undefined : typeof o["eResourceSet"] === "function";
}
