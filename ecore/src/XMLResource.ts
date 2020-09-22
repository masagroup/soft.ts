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
import { EFactory } from "./EFactory";
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

class XMLConstants {
    static href = "href";
	static typeAttrib = "type"
	static schemaLocationAttrib            = "schemaLocation"
	static noNamespaceSchemaLocationAttrib = "noNamespaceSchemaLocation"
	static xsiURI                          = "http://www.w3.org/2001/XMLSchema-instance"
	static xsiNS                           = "xsi"
	static xmlNS                           = "xmlns"
}

export class XMLLoad {
    private _resource: XMLResource;
    private _isResolvedDefered: boolean = false;
    private _elements: string[] = [];
    private _attributes: { [key: string]: sax.QualifiedAttribute } = null;
    private _namespaces : XMLNamespaces = new XMLNamespaces();
    private _spacesToFactories : Map<string,EFactory> = new Map<string,EFactory>();
    
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
        saxStream.on("opentag", (t: sax.QualifiedTag) => this.onStartTag(t));
        saxStream.on("closetag", (t) => this.onEndTag(t));
        saxStream.on("error", (e) => this.onError(e));
        rs.pipe(saxStream);
    }

    onStartTag(tag: sax.QualifiedTag) {
        this.setAttributes(tag.attributes);
        this._namespaces.pushContext();
        this.handlePrefixMapping();

    }

    onEndTag(tagName: string) {}

    onError(err: Error) {}

    private setAttributes(attributes: {
        [key: string]: sax.QualifiedAttribute;
    }): { [key: string]: sax.QualifiedAttribute } {
        let oldAttributes = this._attributes;
        this._attributes = attributes;
        return oldAttributes;
    }

    private handlePrefixMapping() : void {
        if ( this._attributes ) {
            for ( let i in this._attributes ) {
                let attr = this._attributes[i];
                if ( attr.prefix == XMLConstants.xmlNS ) {
                    this.startPrefixMapping(attr.local,attr.value);
                }
            }            
        }
    }

    private  startPrefixMapping(prefix : string, uri : string) {
        this._namespaces.declarePrefix(prefix, uri);
        this._spacesToFactories.delete(uri);
    }
    
}


export class XMLSave {
    private _resource: XMLResource;

    constructor(resource: XMLResource) {
        this._resource = resource;
    }

    save(rs: fs.WriteStream): void {}
}
