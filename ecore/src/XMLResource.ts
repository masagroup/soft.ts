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
import * as stream from "stream";
import {
    EStructuralFeature,
    EReference,
    EPackageRegistry,
    getEcorePackage,
    getPackageRegistry,
    EList,
    EObject,
    EObjectInternal,
    EFactory,
    EClass,
    EClassifier,
    EDataType,
    EDiagnostic,
    EDiagnosticImpl,
    EResourceImpl,
    EPackage,
    isEReference,
    isEObjectInternal,
    EResource,
} from "./internal";

function isEObject(e: any): e is EObject {
    return "eClass" in e;
}

function isEClass(e: EClassifier): e is EClass {
    return "isAbstract" in e;
}

function isEDataType(e: EClassifier): e is EDataType {
    return "isSerializable" in e;
}

enum LoadFeatureKind {
    Single,
    Many,
    ManyAdd,
    ManyMove,
    Other,
}

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
    protected doLoadFromStream(rs: fs.ReadStream): Promise<void> {
        let l = this.createLoad();
        return l.loadFromStream(rs);
    }

    protected doLoadFromString(s: string) {
        let l = this.createLoad();
        return l.loadFromString(s);
    }

    protected doSaveToStream(ws: fs.WriteStream): Promise<void> {
        let s = this.createSave();
        return s.saveToStream(ws);
    }

    protected doSaveToString() : string {
        let s = this.createSave();
        return s.saveToString();
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
    static typeAttrib = "type";
    static schemaLocationAttrib = "schemaLocation";
    static noNamespaceSchemaLocationAttrib = "noNamespaceSchemaLocation";
    static xsiURI = "http://www.w3.org/2001/XMLSchema-instance";
    static xsiNS = "xsi";
    static xmlNS = "xmlns";
}

type XMLReference = {
    object: EObject;
    feature: EStructuralFeature;
    id: string;
    pos: number;
};

export class XMLLoad {
    protected _resource: XMLResource;
    protected _parser: sax.SAXParser;
    protected _elements: string[] = [];
    protected _attributes: { [key: string]: sax.QualifiedAttribute } = null;
    protected _namespaces: XMLNamespaces = new XMLNamespaces();
    protected _uriToFactories: Map<string, EFactory> = new Map<string, EFactory>();
    protected _objects: EObject[] = [];
    protected _sameDocumentProxies: EObject[] = [];
    protected _notFeatures: { uri: string; local: string }[] = [
        { uri: XMLConstants.xsiURI, local: XMLConstants.typeAttrib },
        { uri: XMLConstants.xsiURI, local: XMLConstants.schemaLocationAttrib },
        { uri: XMLConstants.xsiURI, local: XMLConstants.noNamespaceSchemaLocationAttrib },
    ];
    protected _isResolveDeferred: boolean = false;
    protected _references: XMLReference[] = [];
    protected _packageRegistry: EPackageRegistry;

    constructor(resource: XMLResource) {
        this._resource = resource;
        this._packageRegistry = this._resource.eResourceSet()
            ? this._resource.eResourceSet().getPackageRegistry()
            : getPackageRegistry();
    }

    loadFromStream(rs: fs.ReadStream): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let saxStream = new sax.SAXStream(true, {
                trim: true,
                lowercase: true,
                xmlns: true,
                position: true,
            });
            saxStream.on("opentag", (t: sax.QualifiedTag) => this.onStartTag(t));
            saxStream.on("closetag", (t) => this.onEndTag(t));
            saxStream.on("error", (e) => this.onError(e));
            saxStream.on("end", () => {
                resolve();
            });
            rs.pipe(saxStream);
            this._parser = (saxStream as any)["_parser"];
        });
    }

    loadFromString(s: string): void {
        let saxParser = new sax.SAXParser(true, {
            trim: true,
            lowercase: true,
            xmlns: true,
            position: true,
        });
        saxParser.onopentag = (t: sax.QualifiedTag) => this.onStartTag(t);
        saxParser.onclosetag = (t: string) => this.onEndTag(t);
        saxParser.onerror = (e) => this.onError(e);
        this._parser = saxParser;
        this._parser.write(s).close();
    }

    onStartTag(tag: sax.QualifiedTag) {
        this.setAttributes(tag.attributes);
        this._namespaces.pushContext();
        this.handlePrefixMapping();
        if (this._objects.length == 0) {
            this.handleSchemaLocation();
        }
        this.processElement(tag.uri, tag.local);
    }

    onEndTag(tagName: string) {
        this._objects.pop();
        if (this._objects.length == 0) {
            this.handleReferences();
        }

        let context = this._namespaces.popContext();
        context.forEach((element) => {
            this._uriToFactories.delete(element.uri);
        });
    }

    onError(err: Error) {
        this.error(
            new EDiagnosticImpl(
                err.message,
                this._resource.eURI.toString(),
                this._parser.line,
                this._parser.column
            )
        );
    }

    private setAttributes(attributes: {
        [key: string]: sax.QualifiedAttribute;
    }): { [key: string]: sax.QualifiedAttribute } {
        let oldAttributes = this._attributes;
        this._attributes = attributes;
        return oldAttributes;
    }

    protected getAttributeValue(uri: string, local: string): string {
        if (this._attributes) {
            for (let i in this._attributes) {
                let attr = this._attributes[i];
                if (attr.uri == uri && attr.local == local) {
                    return attr.value;
                }
            }
        }
        return null;
    }

    private handlePrefixMapping(): void {
        if (this._attributes) {
            for (let i in this._attributes) {
                let attr = this._attributes[i];
                if (attr.prefix == XMLConstants.xmlNS) {
                    this.startPrefixMapping(attr.local, attr.value);
                }
            }
        }
    }

    private startPrefixMapping(prefix: string, uri: string) {
        this._namespaces.declarePrefix(prefix, uri);
        this._uriToFactories.delete(uri);
    }

    private handleSchemaLocation(): void {
        let xsiSchemaLocation = this.getAttributeValue(
            XMLConstants.xsiURI,
            XMLConstants.schemaLocationAttrib
        );
        if (xsiSchemaLocation) {
            this.handleXSISchemaLocation(xsiSchemaLocation);
        }

        let xsiNoNamespaceSchemaLocation = this.getAttributeValue(
            XMLConstants.xsiURI,
            XMLConstants.noNamespaceSchemaLocationAttrib
        );
        if (xsiNoNamespaceSchemaLocation) {
            this.handleXSINoNamespaceSchemaLocation(xsiSchemaLocation);
        }
    }

    protected handleXSISchemaLocation(loc: string): void {}

    protected handleXSINoNamespaceSchemaLocation(loc: string): void {}

    private processElement(uri: string, local: string) {
        if (this._objects.length == 0) {
            let eObject = this.createObject(uri, local);
            if (eObject) {
                this._objects.push(eObject);
                this._resource.eContents().add(eObject);
            }
        } else {
            this.handleFeature(uri, local);
        }
    }

    private handleFeature(space: string, local: string) {
        let eObject: EObject = null;
        if (this._objects.length > 0) {
            eObject = this._objects[this._objects.length - 1];
        }

        if (eObject) {
            let eFeature = this.getFeature(eObject, local);
            if (eFeature) {
                let xsiType = this.getXSIType();
                if (xsiType) {
                    this.createObjectFromTypeName(eObject, xsiType, eFeature);
                } else {
                    this.createObjectFromFeatureType(eObject, eFeature);
                }
            } else {
                this.handleUnknownFeature(local);
            }
        } else {
            this.handleUnknownFeature(local);
        }
    }

    private handleReferences() {
        for (const eProxy of this._sameDocumentProxies) {
            for (const eReference of eProxy.eClass().eAllReferences) {
                let eOpposite = eReference.eOpposite;
                if (eOpposite && eOpposite.isChangeable && eProxy.eIsSet(eReference)) {
                    let resolvedObject = this._resource.getEObject(
                        (eProxy as EObjectInternal).eProxyURI().href.slice(1)
                    );
                    if (resolvedObject) {
                        let proxyHolder: EObject = null;
                        if (eReference.isMany) {
                            let value = eProxy.eGet(eReference);
                            let list = value as EList<EObject>;
                            proxyHolder = list.get(0);
                        } else {
                            let value = eProxy.eGet(eReference);
                            proxyHolder = value as EObject;
                        }

                        if (eOpposite.isMany) {
                            let value = proxyHolder.eGetResolve(eOpposite, false);
                            let holderContents = value as EList<EObject>;
                            let resolvedIndex = holderContents.indexOf(resolvedObject);
                            if (resolvedIndex != -1) {
                                let proxyIndex = holderContents.indexOf(eProxy);
                                holderContents.moveTo(proxyIndex, resolvedIndex);
                                if (proxyIndex > resolvedIndex) {
                                    holderContents.removeAt(proxyIndex - 1);
                                } else {
                                    holderContents.removeAt(proxyIndex + 1);
                                }
                                break;
                            }
                        }

                        let replace = false;
                        if (eReference.isMany) {
                            let value = resolvedObject.eGet(eReference);
                            let list = value as EList<EObject>;
                            replace = !list.contains(proxyHolder);
                        } else {
                            let value = resolvedObject.eGet(eReference);
                            let object = value as EObject;
                            replace = object != proxyHolder;
                        }

                        if (replace) {
                            if (eOpposite.isMany) {
                                let value = proxyHolder.eGetResolve(eOpposite, false);
                                let list = value as EList<EObject>;
                                let ndx = list.indexOf(eProxy);
                                list.set(ndx, resolvedObject);
                            } else {
                                proxyHolder.eSet(eOpposite, resolvedObject);
                            }
                        }
                        break;
                    }
                }
            }
        }

        for (const reference of this._references) {
            let eObject = this._resource.getEObject(reference.id);
            if (eObject) {
                this.setFeatureValue(reference.object, reference.feature, eObject, reference.pos);
            } else {
                this.error(
                    new EDiagnosticImpl(
                        "Unresolved reference '" + reference.id + "'",
                        this._resource.eURI.toString(),
                        this._parser.line,
                        this._parser.column
                    )
                );
            }
        }
    }

    protected getXSIType(): string {
        return this.getAttributeValue(XMLConstants.xsiURI, XMLConstants.typeAttrib);
    }

    private createObject(uri: string, local: string): EObject {
        let eFactory = this.getFactoryForURI(uri);
        if (eFactory) {
            let ePackage = eFactory.ePackage;
            let eType = ePackage.getEClassifier(local);
            return this.createObjectWithFactory(eFactory, eType);
        } else {
            let prefix = this._namespaces.getPrefix(uri);
            if (prefix) this.handleUnknownPackage(prefix);
            else this.handleUnknownURI(uri);
            return null;
        }
    }

    private createObjectWithFactory(eFactory: EFactory, eType: EClassifier): EObject {
        if (eFactory) {
            if (isEClass(eType) && !eType.isAbstract) {
                let eObject = eFactory.create(eType);
                if (eObject) {
                    this.handleAttributes(eObject);
                }
                return eObject;
            }
        }
        return null;
    }

    private createObjectFromFeatureType(eObject: EObject, eFeature: EStructuralFeature): EObject {
        let eResult: EObject = null;
        if (eFeature && eFeature.eType) {
            let eType = eFeature.eType;
            let eFactory = eType.ePackage.eFactoryInstance;
            eResult = this.createObjectWithFactory(eFactory, eType);
        }
        if (eResult) {
            this.setFeatureValue(eObject, eFeature, eResult, -1);
            this._objects.push(eResult);
        }
        return eResult;
    }

    private createObjectFromTypeName(
        eObject: EObject,
        qname: string,
        eFeature: EStructuralFeature
    ): EObject {
        let prefix = "";
        let local = qname;
        let index = qname.indexOf(":");
        if (index != -1) {
            prefix = qname.slice(0, index);
            local = qname.slice(index + 1);
        }

        let uri = this._namespaces.getURI(prefix);
        let eFactory = this.getFactoryForURI(uri);
        if (!eFactory) {
            this.handleUnknownPackage(prefix);
            return null;
        }

        let eType = eFactory.ePackage.getEClassifier(local);
        let eResult = this.createObjectWithFactory(eFactory, eType);
        if (eResult) {
            this.setFeatureValue(eObject, eFeature, eResult, -1);
            this._objects.push(eResult);
        }
        return eResult;
    }

    private getFactoryForURI(uri: string): EFactory {
        let factory = this._uriToFactories.get(uri);
        if (factory == undefined) {
            factory = this._packageRegistry.getFactory(uri);
            if (factory) {
                this._uriToFactories.set(uri, factory);
            }
        }
        return factory;
    }

    protected handleAttributes(eObject: EObject) {
        if (this._attributes) {
            for (let i in this._attributes) {
                let attr = this._attributes[i];
                if (attr.local == XMLConstants.href) {
                    this.handleProxy(eObject, attr.value);
                } else if (attr.prefix != XMLConstants.xmlNS && this.isUserAttribute(attr)) {
                    this.setAttributeValue(eObject, attr);
                }
            }
        }
    }

    private handleProxy(eProxy: EObject, id: string): void {
        let uri: URL = null;
        try {
            uri = new URL(id);
        } catch {
            return;
        }
        (eProxy as EObjectInternal).eSetProxyURI(uri);

        let ndx = id.indexOf("#");
        let trimmedURI: string = ndx != -1 ? (ndx > 0 ? id.slice(0, ndx - 1) : "") : id;
        if (this._resource.eURI?.toString() == trimmedURI) {
            this._sameDocumentProxies.push(eProxy);
        }
    }

    private setAttributeValue(eObject: EObject, attr: sax.QualifiedAttribute) {
        let eFeature = this.getFeature(eObject, attr.local);
        if (eFeature) {
            let kind = this.getLoadFeatureKind(eFeature);
            if (kind == LoadFeatureKind.Single || kind == LoadFeatureKind.Many) {
                this.setFeatureValue(eObject, eFeature, attr.value, -2);
            } else {
                this.setValueFromId(eObject, eFeature as EReference, attr.value);
            }
        } else {
            this.handleUnknownFeature(attr.local);
        }
    }

    private setFeatureValue(
        eObject: EObject,
        eFeature: EStructuralFeature,
        value: any,
        position: number
    ) {
        let kind = this.getLoadFeatureKind(eFeature);
        switch (kind) {
            case LoadFeatureKind.Single: {
                let eClassifier = eFeature.eType;
                let eDataType = eClassifier as EDataType;
                let eFactory = eDataType.ePackage.eFactoryInstance;
                if (!value) {
                    eObject.eSet(eFeature, null);
                } else {
                    eObject.eSet(eFeature, eFactory.createFromString(eDataType, value as string));
                }
                break;
            }
            case LoadFeatureKind.Many: {
                let eClassifier = eFeature.eType;
                let eDataType = eClassifier as EDataType;
                let eFactory = eDataType.ePackage.eFactoryInstance;
                let eList = eObject.eGetResolve(eFeature, false) as EList<EObject>;
                if (position == -2) {
                } else if (!value) {
                    eList.add(null);
                } else {
                    eList.add(eFactory.createFromString(eDataType, value as string));
                }
                break;
            }
            case LoadFeatureKind.ManyAdd:
            case LoadFeatureKind.ManyMove:
                let eList = eObject.eGetResolve(eFeature, false) as EList<EObject>;
                if (position == -1) {
                    eList.add(value);
                } else if (position == -2) {
                    eList.clear();
                } else if (eObject == value) {
                    let index = eList.indexOf(value);
                    if (index == -1) {
                        eList.insert(position, value);
                    } else {
                        eList.moveTo(position, index);
                    }
                } else if (kind == LoadFeatureKind.ManyAdd) {
                    eList.add(value);
                } else {
                    eList.move(position, value);
                }
                break;
            default:
                eObject.eSet(eFeature, value);
        }
    }

    private setValueFromId(eObject: EObject, eReference: EReference, ids: string) {
        let mustAdd = this._isResolveDeferred;
        let mustAddOrNotOppositeIsMany = false;
        let isFirstID = true;
        let position = 0;
        let references: XMLReference[] = [];
        let tokens = ids.split(" ");
        let qName = "";
        for (let id of tokens) {
            let index = id.indexOf("#");
            if (index != -1) {
                if (index == 0) {
                    id = id.slice(1);
                } else {
                    let oldAttributes = this.setAttributes(null);
                    let eProxy: EObject;
                    if (qName.length == 0) {
                        eProxy = this.createObjectFromFeatureType(eObject, eReference);
                    } else {
                        eProxy = this.createObjectFromTypeName(eObject, qName, eReference);
                    }
                    this.setAttributes(oldAttributes);
                    if (eProxy) {
                        this.handleProxy(eProxy, id);
                    }
                    this._objects.pop();
                    qName = "";
                    position++;
                    continue;
                }
            } else {
                let index = id.indexOf(":");
                if (index != -1) {
                    qName = id;
                    continue;
                }
            }

            if (!this._isResolveDeferred) {
                if (isFirstID) {
                    let eOpposite = eReference.eOpposite;
                    if (eOpposite) {
                        mustAdd = eOpposite.isTransient || eReference.isMany;
                        mustAddOrNotOppositeIsMany = mustAdd || !eOpposite.isMany;
                    } else {
                        mustAdd = true;
                        mustAddOrNotOppositeIsMany = true;
                    }
                    isFirstID = false;
                }

                if (mustAddOrNotOppositeIsMany) {
                    let resolved = this._resource.getEObject(id);
                    if (resolved) {
                        this.setFeatureValue(eObject, eReference, resolved, -1);
                        qName = "";
                        position++;
                        continue;
                    }
                }
            }

            if (mustAdd) {
                references.push({
                    object: eObject,
                    feature: eReference,
                    id: id,
                    pos: position,
                } as XMLReference);
            }

            qName = "";
            position++;
        }

        if (position == 0) {
            this.setFeatureValue(eObject, eReference, null, -2);
        } else {
            this._references.push(...references);
        }
    }

    private getFeature(eObject: EObject, name: string): EStructuralFeature {
        let eClass = eObject.eClass();
        let eFeature = eClass.getEStructuralFeatureFromName(name);
        return eFeature;
    }

    private getLoadFeatureKind(eFeature: EStructuralFeature): LoadFeatureKind {
        let eClassifier = eFeature.eType;
        if (eClassifier && isEDataType(eClassifier)) {
            return eFeature.isMany ? LoadFeatureKind.Many : LoadFeatureKind.Single;
        } else if (eFeature.isMany) {
            let eReference = eFeature as EReference;
            let eOpposite = eReference.eOpposite;
            if (!eOpposite || eOpposite.isTransient || !eOpposite.isMany) {
                return LoadFeatureKind.ManyAdd;
            }
            return LoadFeatureKind.ManyMove;
        }
        return LoadFeatureKind.Other;
    }

    private isUserAttribute(attr: sax.QualifiedAttribute): boolean {
        for (const i in this._notFeatures) {
            let feature = this._notFeatures[i];
            if (feature.uri == attr.uri && feature.local == attr.local) {
                return false;
            }
        }
        return true;
    }
    private handleUnknownFeature(name: string) {
        this.error(
            new EDiagnosticImpl(
                "Feature " + name + " not found",
                this._resource.eURI?.toString(),
                this._parser.column,
                this._parser.line
            )
        );
    }

    private handleUnknownPackage(name: string) {
        this.error(
            new EDiagnosticImpl(
                "Package " + name + " not found",
                this._resource.eURI?.toString(),
                this._parser.column,
                this._parser.line
            )
        );
    }

    private handleUnknownURI(name: string) {
        this.error(
            new EDiagnosticImpl(
                "URI " + name + " not found",
                this._resource.eURI?.toString(),
                this._parser.column,
                this._parser.line
            )
        );
    }

    private error(diagnostic: EDiagnostic) {
        this._resource.getErrors().add(diagnostic);
    }

    private warning(diagnostic: EDiagnostic) {
        this._resource.getWarnings().add(diagnostic);
    }
}

class XMLStringSegment {
    buffer: string = "";
    lineWidth: number = 0;
}

class XMLString {
    segments: XMLStringSegment[];
    currentSegment: XMLStringSegment;
    lineWidth: number = Number.MAX_SAFE_INTEGER;
    depth: number = 0;
    indentation: string = "    ";
    indents: string[] = [""];
    lastElementIsStart: boolean = false;
    elementNames: string[] = [];

    constructor() {
        this.currentSegment = new XMLStringSegment();
        this.segments = [this.currentSegment];
    }

    toString() : string {
        let result = "";
        for (const segment of this.segments) {
            result += segment.buffer;
        }
        return result;
    }

    write(w: stream.Writable) {
        for (const segment of this.segments) {
            w.write(segment.buffer);
        }
    }

    add(s: string) {
        if (this.lineWidth != Number.MAX_SAFE_INTEGER) {
            this.currentSegment.lineWidth += s.length;
        }
        this.currentSegment.buffer += s;
    }

    addLine() {
        this.add("\n");
        this.currentSegment.lineWidth = 0;
    }

    startElement(name: string) {
        if (this.lastElementIsStart) {
            this.closeStartElement();
        }
        this.elementNames.push(name);
        if (name.length > 0) {
            this.depth++;
            this.add(this.getElementIndent());
            this.add("<");
            this.add(name);
            this.lastElementIsStart = true;
        } else {
            this.add(this.getElementIndentWithExtra(1));
        }
    }

    closeStartElement() {
        this.add(">");
        this.addLine();
        this.lastElementIsStart = false;
    }

    endElement() {
        if (this.lastElementIsStart) {
            this.endEmptyElement();
        } else {
            let name = this.removeLast();
            if (name != "") {
                this.add(this.getElementIndentWithExtra(1));
                this.add("</");
                this.add(name);
                this.add(">");
                this.addLine();
            }
        }
    }

    endEmptyElement() {
        this.removeLast();
        this.add("/>");
        this.addLine();
        this.lastElementIsStart = false;
    }

    removeLast(): string {
        let result = this.elementNames.pop();
        if (result != "") {
            this.depth--;
        }
        return result;
    }

    addAttribute(name: string, value: string) {
        this.startAttribute(name);
        this.addAttributeContent(value);
        this.endAttribute();
    }

    startAttribute(name: string) {
        if (this.currentSegment.lineWidth > this.lineWidth) {
            this.addLine();
            this.add(this.getAttributeIndent());
        } else {
            this.add(" ");
        }
        this.add(name);
        this.add('="');
    }

    addAttributeContent(content: string) {
        this.add(content);
    }

    endAttribute() {
        this.add('"');
    }

    addNil(name: string) {
        if (this.lastElementIsStart) {
            this.closeStartElement();
        }

        this.depth++;
        this.add(this.getElementIndent());
        this.add("<");
        this.add(name);
        if (this.currentSegment.lineWidth > this.lineWidth) {
            this.addLine();
            this.add(this.getAttributeIndent());
        } else {
            this.add(" ");
        }
        this.add('xsi:nil="true"/>');
        this.depth--;
        this.addLine();
        this.lastElementIsStart = false;
    }

    addContent(name: string, content: string) {
        if (this.lastElementIsStart) {
            this.closeStartElement();
        }
        this.depth++;
        this.add(this.getElementIndent());
        this.add("<");
        this.add(name);
        this.add(">");
        this.add(content);
        this.add("</");
        this.depth--;
        this.add(name);
        this.add(">");
        this.addLine();
        this.lastElementIsStart = false;
    }

    getElementIndent(): string {
        return this.getElementIndentWithExtra(0);
    }

    getElementIndentWithExtra(extra: number): string {
        let nesting = this.depth + extra - 1;
        for (let i = this.indents.length - 1; i < nesting; i++) {
            this.indents.push(this.indents[i] + "  ");
        }
        return this.indents[nesting];
    }

    getAttributeIndent(): string {
        let nesting = this.depth + 1;
        for (let i = this.indents.length - 1; i < nesting; i++) {
            this.indents.push(this.indents[i] + "  ");
        }
        return this.indents[nesting];
    }

    mark(): XMLStringSegment {
        let r = this.currentSegment;
        this.currentSegment = new XMLStringSegment();
        this.segments.push(this.currentSegment);
        return r;
    }

    resetToMark(segment: XMLStringSegment) {
        if (segment) {
            this.currentSegment = segment;
        }
    }
}

enum SaveFeatureKind {
    Transient,
    DataTypeSingle,
    DataTypeElementSingle,
    DataTypeContentSingle,
    DataTypeSingleNillable,
    DataTypeMany,
    ObjectContainSingle,
    ObjectContainMany,
    ObjectHREFSingle,
    ObjectHREFMany,
    ObjectContainSingleUnsettable,
    ObjectContainManyUnsettable,
    ObjectHREFSingleUnsettable,
    ObjectHREFManyUnsettable,
    ObjectElementSingle,
    ObjectElementSingleUnsettable,
    ObjectElementMany,
    ObjectElementIDRefSingle,
    ObjectElementIDRefSingleUnsettable,
    ObjectElementIDRefMany,
    AttributeFeatureMap,
    ElementFeatureMap,
    ObjectAttributeSingle,
    ObjectAttributeMany,
    ObjectAttributeIDRefSingle,
    ObjectAttributeIDRefMany,
    DataTypeAttributeMany,
}

enum SaveResourceKind {
    Skip,
    Same,
    Cross,
}

export class XMLSave {
    protected _resource: XMLResource;
    protected _str: XMLString = new XMLString();
    private _packages: Map<string, string> = new Map<string, string>();
    private _uriToPrefixes: Map<string, string[]> = new Map<string, string[]>();
    private _prefixesToURI: Map<string, string> = new Map<string, string>();
    private _featureKinds: Map<EStructuralFeature, number> = new Map<EStructuralFeature, number>();
    private _namespaces: XMLNamespaces = new XMLNamespaces();
    private _keepDefaults = false;

    constructor(resource: XMLResource) {
        this._resource = resource;
    }

    saveToStream(rs: fs.WriteStream): Promise<void> {
        return new Promise((resolve, reject) => {
            let contents = this._resource.eContents();
            if (!contents.isEmpty()) {
                this.saveHeader();
                let m = this.saveTopObject(contents.get(0));
                this.resetToMark(m);
                this.saveNamespaces();
                this._str.write(rs);
            }
            resolve();
        });
    }

    saveToString() : string {
        let contents = this._resource.eContents();
        if (contents.isEmpty())
            return "";
        this.saveHeader();
        let m = this.saveTopObject(contents.get(0));
        this.resetToMark(m);
        this.saveNamespaces();
        return this._str.toString();
    }

    private saveHeader() {
        this._str.add('<?xml version="1.0" encoding="UTF-8"?>');
        this._str.addLine();
    }

    private saveTopObject(eObject: EObject): XMLStringSegment {
        let name = this.getQName(eObject.eClass());
        this._str.startElement(name);
        let mark = this._str.mark();
        this.saveElementID(eObject);
        this.saveFeatures(eObject, false);
        return mark;
    }

    protected saveElementID(eObject: EObject) {}

    private saveFeatures(eObject: EObject, attributesOnly: boolean): boolean {
        let eAllFeatures = eObject.eClass().eAllStructuralFeatures;
        let elementFeatures: number[];
        let elementCount = 0;

        LOOP: for (let i = 0 ; i < eAllFeatures.size() ; i ++) {
            let eFeature = eAllFeatures.get(i);
            let kind = this._featureKinds.get(eFeature);
            if (!kind) {
                kind = this.getSaveFeatureKind(eFeature);
                this._featureKinds.set(eFeature, kind);
            }

            if (kind != SaveFeatureKind.Transient && this.shouldSaveFeature(eObject, eFeature)) {
                switch (kind) {
                    case SaveFeatureKind.DataTypeSingle: {
                        this.saveDataTypeSingle(eObject, eFeature);
                        continue LOOP;
                    }

                    case SaveFeatureKind.DataTypeSingleNillable: {
                        if (!this.isNil(eObject, eFeature)) {
                            this.saveDataTypeSingle(eObject, eFeature);
                            continue LOOP;
                        }
                        break;
                    }
                    case SaveFeatureKind.ObjectContainManyUnsettable:
                    case SaveFeatureKind.DataTypeMany: {
                        if (this.isEmpty(eObject, eFeature)) {
                            this.saveManyEmpty(eObject, eFeature);
                            continue LOOP;
                        }
                        break;
                    }
                    case SaveFeatureKind.ObjectContainSingleUnsettable:
                    case SaveFeatureKind.ObjectContainSingle:
                    case SaveFeatureKind.ObjectContainMany: {
                        break;
                    }
                    case SaveFeatureKind.ObjectHREFSingleUnsettable: {
                        if (!this.isNil(eObject, eFeature)) {
                            switch (this.getSaveResourceKindSingle(eObject, eFeature)) {
                                case SaveResourceKind.Cross: {
                                    break;
                                }
                                case SaveResourceKind.Same: {
                                    this.saveIDRefSingle(eObject, eFeature);
                                    continue LOOP;
                                }
                                default:
                                    continue LOOP;
                            }
                        }
                        break;
                    }
                    case SaveFeatureKind.ObjectHREFSingle: {
                        switch (this.getSaveResourceKindSingle(eObject, eFeature)) {
                            case SaveResourceKind.Cross: {
                                break;
                            }
                            case SaveResourceKind.Same: {
                                this.saveIDRefSingle(eObject, eFeature);
                                continue LOOP;
                            }
                            default:
                                continue LOOP;
                        }
                        break;
                    }
                    case SaveFeatureKind.ObjectHREFManyUnsettable: {
                        if (this.isEmpty(eObject, eFeature)) {
                            this.saveManyEmpty(eObject, eFeature);
                            continue LOOP;
                        } else {
                            switch (this.getSaveResourceKindMany(eObject, eFeature)) {
                                case SaveResourceKind.Cross: {
                                    break;
                                }
                                case SaveResourceKind.Same: {
                                    this.saveIDRefMany(eObject, eFeature);
                                    continue LOOP;
                                }
                                default:
                                    continue LOOP;
                            }
                        }
                        break;
                    }
                    case SaveFeatureKind.ObjectHREFMany: {
                        switch (this.getSaveResourceKindMany(eObject, eFeature)) {
                            case SaveResourceKind.Cross: {
                                break;
                            }
                            case SaveResourceKind.Same: {
                                this.saveIDRefMany(eObject, eFeature);
                                continue LOOP;
                            }
                            default:
                                continue LOOP;
                        }
                        break;
                    }
                    default:
                        continue LOOP;
                }
                if (attributesOnly) {
                    continue LOOP;
                }
                if (!elementFeatures) {
                    elementFeatures = new Array<number>(eAllFeatures.size());
                }
                elementFeatures[elementCount] = i;
                elementCount++;
            }
        }
        if (!elementFeatures) {
            this._str.endEmptyElement();
            return false;
        }
        for (let i = 0; i < elementCount; i++) {
            let eFeature = eAllFeatures.get(elementFeatures[i]);
            let kind = this._featureKinds.get(eFeature);
            switch (kind) {
                case SaveFeatureKind.DataTypeSingleNillable: {
                    this.saveNil(eObject, eFeature);
                    break;
                }
                case SaveFeatureKind.DataTypeMany: {
                    this.saveDataTypeMany(eObject, eFeature);
                    break;
                }
                case SaveFeatureKind.ObjectContainSingleUnsettable: {
                    if (this.isNil(eObject, eFeature)) {
                        this.saveNil(eObject, eFeature);
                    } else {
                        this.saveContainedSingle(eObject, eFeature);
                    }
                    break;
                }
                case SaveFeatureKind.ObjectContainSingle: {
                    this.saveContainedSingle(eObject, eFeature);
                    break;
                }
                case SaveFeatureKind.ObjectContainManyUnsettable:
                case SaveFeatureKind.ObjectContainMany: {
                    this.saveContainedMany(eObject, eFeature);
                    break;
                }
                case SaveFeatureKind.ObjectHREFSingleUnsettable: {
                    if (this.isNil(eObject, eFeature)) {
                        this.saveNil(eObject, eFeature);
                    } else {
                        this.saveHRefSingle(eObject, eFeature);
                    }
                    break;
                }
                case SaveFeatureKind.ObjectHREFSingle: {
                    this.saveHRefSingle(eObject, eFeature);
                    break;
                }
                case SaveFeatureKind.ObjectHREFManyUnsettable:
                case SaveFeatureKind.ObjectHREFMany: {
                    this.saveHRefMany(eObject, eFeature);
                    break;
                }
            }
        }

        this._str.endElement();
        return true;
    }

    protected saveNamespaces() {
        let prefixes: string[] = [...this._prefixesToURI.keys()].sort();
        for (const prefix of prefixes) {
            this._str.addAttribute("xmlns:" + prefix, this._prefixesToURI.get(prefix));
        }
    }

    private resetToMark(segment: XMLStringSegment) {
        this._str.resetToMark(segment);
    }

    private saveDataTypeSingle(eObject: EObject, eFeature: EStructuralFeature) {
        let val = eObject.eGetResolve(eFeature, false);
        let str = this.getDataType(val, eFeature, true);
        if (str) {
            this._str.addAttribute(this.getFeatureQName(eFeature), str);
        }
    }

    private saveDataTypeMany(eObject: EObject, eFeature: EStructuralFeature) {
        let l = eObject.eGetResolve(eFeature, false) as EList<EObject>;
        let d = eFeature.eType as EDataType;
        let p = d.ePackage;
        let f = p.eFactoryInstance;
        let name = this.getFeatureQName(eFeature);
        for (const value of l) {
            if (!value) {
                this._str.startElement(name);
                this._str.addAttribute("xsi:nil", "true");
                this._str.endEmptyElement();
                this._uriToPrefixes.set(XMLConstants.xsiURI, [XMLConstants.xsiNS]);
                this._prefixesToURI.set(XMLConstants.xsiNS, XMLConstants.xsiURI);
            } else {
                let str = f.convertToString(d, value);
                this._str.addContent(name, str);
            }
        }
    }

    private saveManyEmpty(eObject: EObject, eFeature: EStructuralFeature) {
        this._str.addAttribute(this.getFeatureQName(eFeature), "");
    }

    private saveEObjectSingle(eObject: EObject, eFeature: EStructuralFeature) {
        let value = eObject.eGetResolve(eFeature, false);
        if (value && isEObject(value)) {
            let id = this.getHRef(value);
            this._str.addAttribute(this.getFeatureQName(eFeature), id);
        }
    }

    private saveEObjectMany(eObject: EObject, eFeature: EStructuralFeature) {
        let l = eObject.eGetResolve(eFeature, false) as EList<EObject>;
        let failure = false;
        let first = true;
        let buffer = "";
        for (const value of l) {
            if (value) {
                let id = this.getHRef(value);
                if (id == "") {
                    failure = true;
                } else {
                    if (!first) {
                        buffer += " ";
                    }
                    buffer += id;
                    first = false;
                }
            }
        }
        if (!failure && buffer.length > 0) {
            this._str.addAttribute(this.getFeatureQName(eFeature), buffer);
        }
    }

    private saveNil(eObject: EObject, eFeature: EStructuralFeature) {
        this._str.addNil(this.getFeatureQName(eFeature));
    }

    private saveContainedSingle(eObject: EObject, eFeature: EStructuralFeature) {
        let value = eObject.eGetResolve(eFeature, false);
        if (value && isEObjectInternal(value)) {
            this.saveEObjectInternal(value, eFeature);
        }
    }

    private saveContainedMany(eObject: EObject, eFeature: EStructuralFeature) {
        let l = eObject.eGetResolve(eFeature, false) as EList<EObject>;
        for (const o of l) {
            if (isEObjectInternal(o)) {
                this.saveEObjectInternal(o, eFeature);
            }
        }
    }

    private saveEObjectInternal(o: EObjectInternal, f: EStructuralFeature) {
        if (o.eInternalResource() || o.eIsProxy()) {
            this.saveHRef(o, f);
        } else {
            this.saveEObject(o, f);
        }
    }

    private saveEObject(o: EObject, f: EStructuralFeature) {
        this._str.startElement(this.getFeatureQName(f));
        let eClass = o.eClass();
        let eType = f.eType;
        if (eType != eClass && eType != getEcorePackage().getEObject()) {
            this.saveTypeAttribute(eClass);
        }
        this.saveElementID(o);
        this.saveFeatures(o, false);
    }

    private saveTypeAttribute(eClass: EClass) {
        this._str.addAttribute("xsi:type", this.getQName(eClass));
        this._uriToPrefixes.set(XMLConstants.xsiURI, [XMLConstants.xsiNS]);
        this._prefixesToURI.set(XMLConstants.xsiNS, XMLConstants.xsiURI);
    }

    private saveHRefSingle(eObject: EObject, eFeature: EStructuralFeature) {
        let value = eObject.eGetResolve(eFeature, false);
        if (value && isEObject(value)) {
            this.saveHRef(value, eFeature);
        }
    }

    private saveHRefMany(eObject: EObject, eFeature: EStructuralFeature) {
        let l = eObject.eGetResolve(eFeature, false) as EList<EObject>;
        for (const value of l) {
            this.saveHRef(value, eFeature);
        }
    }

    private saveHRef(eObject: EObject, eFeature: EStructuralFeature) {
        let href = this.getHRef(eObject);
        if (href != "") {
            this._str.startElement(this.getFeatureQName(eFeature));
            let eClass = eObject.eClass();
            let eType = eFeature.eType;
            if (eType && isEClass(eType) && eType != eClass && eType.isAbstract) {
                this.saveTypeAttribute(eClass);
            }
            this._str.addAttribute("href", href);
            this._str.endEmptyElement();
        }
    }

    private saveIDRefSingle(eObject: EObject, eFeature: EStructuralFeature) {
        let value = eObject.eGetResolve(eFeature, false);
        if (value && isEObject(value)) {
            let id = this.getIDRef(value);
            if (id != "") {
                this._str.addAttribute(this.getFeatureQName(eFeature), id);
            }
        }
    }

    private saveIDRefMany(eObject: EObject, eFeature: EStructuralFeature) {
        let l = eObject.eGetResolve(eFeature, false) as EList<EObject>;
        let failure = false;
        let buffer = "";
        let first = true;
        for (const value of l) {
            if (value) {
                let id = this.getIDRef(value);
                if (id == "") {
                    failure = true;
                } else {
                    if (!first) {
                        buffer += " ";
                    }
                    buffer += id;
                    first = false;
                }
            }
        }
        if (!failure && buffer.length > 0) {
            this._str.addAttribute(this.getFeatureQName(eFeature), buffer);
        }
    }

    private getSaveResourceKindSingle(
        eObject: EObject,
        eFeature: EStructuralFeature
    ): SaveResourceKind {
        let value = eObject.eGetResolve(eFeature, false) as EObjectInternal;
        if (!value) {
            return SaveResourceKind.Skip;
        } else if (value.eIsProxy()) {
            return SaveResourceKind.Cross;
        } else {
            let resource = value.eResource();
            if (resource == this._resource || !resource) {
                return SaveResourceKind.Same;
            }
            return SaveResourceKind.Cross;
        }
    }

    private getSaveResourceKindMany(
        eObject: EObject,
        eFeature: EStructuralFeature
    ): SaveResourceKind {
        let list = eObject.eGetResolve(eFeature, false) as EList<EObject>;
        if (!list || list.isEmpty()) {
            return SaveResourceKind.Skip;
        }
        for (const e of list) {
            let o = e as EObjectInternal;
            if (!o) {
                return SaveResourceKind.Skip;
            } else if (o.eIsProxy) {
                return SaveResourceKind.Cross;
            } else {
                let resource = o.eResource();
                if (resource && resource != this._resource) {
                    return SaveResourceKind.Cross;
                }
            }
        }
        return SaveResourceKind.Same;
    }

    private getDataType(
        value: any,
        feature: EStructuralFeature,
        isAttribute: boolean
    ): string | null {
        if (!value) {
            return null;
        } else {
            let d = feature.eType as EDataType;
            let p = d.ePackage;
            let f = p.eFactoryInstance;
            let s = f.convertToString(d, value);
            return s;
        }
    }

    private getHRef(eObject: EObject): string {
        if (isEObjectInternal(eObject)) {
            let uri = eObject.eProxyURI();
            if (!uri) {
                let eResource = eObject.eResource();
                return eResource ? this.getResourceHRef(eResource, eObject) : "";
            } else {
                return uri.toString();
            }
        }
        return "";
    }

    private getResourceHRef(resource: EResource, object: EObject): string {
        let uri = resource.eURI;
        uri.hash = resource.getURIFragment(object);
        return uri.toString();
    }

    private getIDRef(eObject: EObject): string {
        return this._resource ? "#" + this._resource.getURIFragment(eObject) : "";
    }

    private getQName(eClass: EClass): string {
        return this.getElementQName(eClass.ePackage, eClass.name, false);
    }

    private getElementQName(ePackage: EPackage, name: string, mustHavePrefix: boolean): string {
        let nsPrefix = this.getPrefix(ePackage, mustHavePrefix);
        if (nsPrefix == "") {
            return name;
        } else if (name.length == 0) {
            return nsPrefix;
        } else {
            return nsPrefix + ":" + name;
        }
    }

    private getFeatureQName(eFeature: EStructuralFeature): string {
        return eFeature.name;
    }

    private getPrefix(ePackage: EPackage, mustHavePrefix: boolean): string {
        let nsPrefix = this._packages.get(ePackage.nsURI);
        if (!nsPrefix) {
            let found = false;
            let prefixes = this._uriToPrefixes.get(ePackage.nsURI);
            if (prefixes) {
                for (const prefix of prefixes) {
                    nsPrefix = prefix;
                    if (!mustHavePrefix || nsPrefix.length > 0) {
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                nsPrefix = this._namespaces.getPrefix(ePackage.nsURI);
                if (nsPrefix) {
                    return nsPrefix;
                }
                nsPrefix = ePackage.nsPrefix;
                if (nsPrefix.length == 0 && mustHavePrefix) {
                    nsPrefix = "_";
                }

                if (this._prefixesToURI.has(nsPrefix)) {
                    let currentValue = this._prefixesToURI.get(nsPrefix);
                    if (currentValue ? currentValue != ePackage.nsURI : ePackage.nsURI) {
                        let index = 1;
                        while (this._prefixesToURI.has(nsPrefix + "_" + index.toString())) {
                            index++;
                        }
                        nsPrefix += "_" + index.toString();
                    }
                }
                this._prefixesToURI.set(nsPrefix, ePackage.nsURI);
            }
            this._packages.set(ePackage.nsURI, nsPrefix);
        }
        return nsPrefix;
    }

    shouldSaveFeature(o: EObject, f: EStructuralFeature): boolean {
        return o.eIsSet(f) || (this._keepDefaults && f.defaultValueLiteral != "");
    }

    isNil(eObject: EObject, eFeature: EStructuralFeature): boolean {
        return eObject.eGetResolve(eFeature, false) == null;
    }

    isEmpty(eObject: EObject, eFeature: EStructuralFeature): boolean {
        return (eObject.eGetResolve(eFeature, false) as EList<EObject>).isEmpty();
    }

    getSaveFeatureKind(f: EStructuralFeature): SaveFeatureKind {
        if (f.isTransient) {
            return SaveFeatureKind.Transient;
        }

        if (isEReference(f)) {
            if (f.isContainment) {
                if (f.isMany) {
                    if (f.isUnsettable) {
                        return SaveFeatureKind.ObjectContainManyUnsettable;
                    } else {
                        return SaveFeatureKind.ObjectContainMany;
                    }
                } else {
                    if (f.isUnsettable) {
                        return SaveFeatureKind.ObjectContainSingleUnsettable;
                    } else {
                        return SaveFeatureKind.ObjectContainSingle;
                    }
                }
            }
            if (f.eOpposite && f.eOpposite.isContainment) {
                return SaveFeatureKind.Transient;
            }
            if (f.isMany) {
                if (f.isUnsettable) {
                    return SaveFeatureKind.ObjectHREFManyUnsettable;
                } else {
                    return SaveFeatureKind.ObjectHREFMany;
                }
            } else {
                if (f.isUnsettable) {
                    return SaveFeatureKind.ObjectHREFSingleUnsettable;
                } else {
                    return SaveFeatureKind.ObjectHREFSingle;
                }
            }
        } else {
            // Attribute
            let eType = f.eType;
            if (isEDataType(eType))
                if (!eType.isSerializable) {
                    return SaveFeatureKind.Transient;
                }
            if (f.isMany) {
                return SaveFeatureKind.DataTypeMany;
            }
            if (f.isUnsettable) {
                return SaveFeatureKind.DataTypeSingleNillable;
            }
            return SaveFeatureKind.DataTypeSingle;
        }
    }
}
