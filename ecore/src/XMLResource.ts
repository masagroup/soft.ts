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

    onStartTag(tag: sax.Tag | sax.QualifiedTag) {
        console.log("onStartTag:" + tag);
    }

    onEndTag(tagName: string) {
        console.log("onEndTag:" + tagName);
    }

    onError(err: Error) {
        console.log("error:" + err);
    }
}

export class XMLSave {
    private _resource: XMLResource;

    constructor(resource: XMLResource) {
        this._resource = resource;
    }

    save(rs: fs.WriteStream): void {}
}
