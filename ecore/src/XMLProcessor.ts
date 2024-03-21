// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs"
import {
    EPackage,
    EResource,
    EResourceSet,
    EResourceSetImpl,
    ExtendedMetaData,
    getEcorePackage,
    isEResourceSet,
    URI,
    XMLOptions,
} from "./internal"

export class XMLProcessor {
    private _extendMetaData: ExtendedMetaData = new ExtendedMetaData()
    private _packages: EPackage[] = []
    private _resourceSet: EResourceSet

    constructor(input: EPackage[] | EResourceSet) {
        if (isEResourceSet(input)) {
            this._resourceSet = input
        } else {
            this._packages = input
        }
    }

    getResourceSet(): EResourceSet {
        if (!this._resourceSet) {
            this._resourceSet = this.createResourceSet(this._packages)
        }
        return this._resourceSet
    }

    load(uri: URI, options?: Map<string, any>): Promise<EResource> {
        let rs = this.getResourceSet()
        let r = rs.createResource(uri)
        let o = new Map<string, any>([[XMLOptions.EXTENDED_META_DATA, this._extendMetaData]])
        if (options) o = new Map([...Array.from(o.entries()), ...Array.from(options.entries())])

        return new Promise<EResource>((resolve, reject) => {
            let p = r.load(o)
            p.then((_) => {
                resolve(r)
            })
            p.catch((reason) => {
                reject(reason)
            })
        })
    }

    loadFromStream(s: fs.ReadStream, options?: Map<string, any>): Promise<EResource> {
        let rs = this.getResourceSet()
        let r = rs.createResource(new URI("file:///*.xml"))
        let o = new Map<string, any>([[XMLOptions.EXTENDED_META_DATA, this._extendMetaData]])
        if (options) o = new Map([...Array.from(o.entries()), ...Array.from(options.entries())])

        return new Promise<EResource>((resolve, reject) => {
            let p = r.loadFromStream(s, o)
            p.then((_) => {
                resolve(r)
            })
            p.catch((reason) => {
                reject(reason)
            })
        })
    }

    loadSync(uri: URI, options?: Map<string, any>): EResource {
        let rs = this.getResourceSet()
        let r = rs.createResource(uri)
        let o = new Map<string, any>([[XMLOptions.EXTENDED_META_DATA, this._extendMetaData]])
        if (options) o = new Map([...Array.from(o.entries()), ...Array.from(options.entries())])
        r.loadSync(o)
        return r
    }

    save(resource: EResource, options?: Map<string, any>): Promise<void> {
        return resource.save(options)
    }

    saveToStream(resource: EResource, s: fs.WriteStream, options?: Map<string, any>): Promise<void> {
        return resource.saveToStream(s, options)
    }

    saveToString(resource: EResource, options?: Map<string, any>): string {
        return resource.saveToString(options)
    }

    private createResourceSet(packages: EPackage[]): EResourceSet {
        let rs = new EResourceSetImpl()
        let packageRegistry = rs.getPackageRegistry()
        packageRegistry.registerPackage(getEcorePackage())
        if (packages) {
            packages.forEach((p) => {
                packageRegistry.registerPackage(p)
            })
        }
        return rs
    }
}
