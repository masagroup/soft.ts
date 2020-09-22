// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

import * as fs from "fs";
import * as sax from "sax";
import { EResourceImpl } from "./EResourceImpl";

export class XMLNamespaces {
    private _namespaces: { prefix: string; uri: string }[] = [];
    private _namespacesSize: number = 0;
    private _currentContext: number = -1;
    private _contexts: number[] = [];

    pushContext(): void {
        this._currentContext++;
        if (this._currentContext >= this._contexts.length) {
            this._contexts.push(this._namespacesSize);
        } else {
            this._contexts[this._currentContext] = this._namespacesSize;
        }
    }

    popContext(): { prefix: string; uri: string }[] {
        let oldPrefixSize = this._namespacesSize;
        this._namespacesSize = this._contexts[this._currentContext];
        this._currentContext--;
        return this._namespaces.slice(this._namespacesSize, oldPrefixSize);
    }

    declarePrefix(prefix: string, uri: string): boolean {
        for (let i = this._namespacesSize; i > this._contexts[this._currentContext]; i--) {
            let p = this._namespaces[i - 1];
            if (p.prefix == prefix) {
                p.uri = uri;
                return true;
            }
        }
        this._namespacesSize++;
        if (this._namespacesSize > this._namespaces.length) {
            this._namespaces.push({ prefix: prefix, uri: uri });
        } else {
            this._namespaces[this._namespacesSize] = { prefix: prefix, uri: uri };
        }
        return false;
    }

    getPrefix(uri: string): string {
        for (let i = this._namespacesSize; i > 0; i--) {
            let p = this._namespaces[i - 1];
            if (p.uri == uri) {
                return p.prefix;
            }
        }
        return null;
    }

    getURI(prefix: string): string {
        for (let i = this._namespacesSize; i > 0; i--) {
            let p = this._namespaces[i - 1];
            if (p.prefix == prefix) {
                return p.uri;
            }
        }
        return null;
    }
}

export class XMLResource extends EResourceImpl {
    protected doLoad(rs: fs.ReadStream): void {
        let l = this.createLoad();
        l.load(rs);
    }

    protected doSave(ws: fs.WriteStream): void {
        let s = this.createSave();
        s.save(ws);
    }

    protected createLoad(): XMLLoad {
        return new XMLLoad(this);
    }

    protected createSave(): XMLSave {
        return new XMLSave(this);
    }
}

export class XMLLoad {
    private _resource: XMLResource;
    private _isResolvedDefered: boolean = false;
    private _elements: string[];

    constructor(resource: XMLResource) {
        this._resource = resource;
    }

    load(rs: fs.ReadStream): void {
        let saxStream = new sax.SAXStream(true, {
            trim: true,
            lowercase: true,
            xmlns: true,
            position: true,
        });
        saxStream.on("opentag", this.onStartTag);
        saxStream.on("closetag", this.onEndTag);
        saxStream.on("error", this.onError);
        rs.pipe(saxStream);
    }

    onStartTag(tag: sax.QualifiedTag) {}

    onEndTag(tagName: string) {}

    onError(err: Error) {}
}

export class XMLSave {
    private _resource: XMLResource;

    constructor(resource: XMLResource) {
        this._resource = resource;
    }

    save(rs: fs.WriteStream): void {}
}
