// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as fs from "fs";
import * as sax from "sax";
import * as stream from "stream";
import {
    EClass,
    EClassifier,
    EcoreUtils,
    EDataType,
    EDiagnostic,
    EDiagnosticImpl,
    EFactory,
    EList,
    EMap,
    ENamedElement,
    EObject,
    EObjectInternal,
    EPackage,
    EPackageRegistry,
    EReference,
    EResource,
    EResourceImpl,
    EStructuralFeature,
    ExtendedMetaData,
    getEcorePackage,
    getPackageRegistry,
    isEClass,
    isEDataType,
    isEObject,
    isEObjectInternal,
    isEReference,
} from "./internal";

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
            this._namespaces[this._namespacesSize] = {
                prefix: prefix,
                uri: uri,
            };
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

export interface XMLResource extends EResource {
    xmlVersion: string;
    encoding: string;
}

export class XMLResourceImpl extends EResourceImpl implements XMLResource {
    private _xmlVersion: string = "1.0";
    private _encoding: string = "UTF-8";

    public get xmlVersion(): string {
        return this._xmlVersion;
    }
    public set xmlVersion(v: string) {
        this._xmlVersion = v;
    }

    public get encoding(): string {
        return this._encoding;
    }
    public set encoding(v: string) {
        this._encoding = v;
    }

    protected doLoadFromStream(rs: fs.ReadStream, options: Map<string, any>): Promise<void> {
        let l = this.createLoad(options);
        return l.loadFromStream(rs);
    }

    protected doLoadFromString(s: string, options: Map<string, any>) {
        let l = this.createLoad(options);
        return l.loadFromString(s);
    }

    protected doSaveToStream(ws: fs.WriteStream, options: Map<string, any>): Promise<void> {
        let s = this.createSave(options);
        return s.saveToStream(ws);
    }

    protected doSaveToString(options: Map<string, any>): string {
        let s = this.createSave(options);
        return s.saveToString();
    }

    protected createLoad(options: Map<string, any>): XMLLoad {
        return new XMLLoad(this, options);
    }

    protected createSave(options: Map<string, any>): XMLSave {
        return new XMLSave(this, options);
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

export const OPTION_EXTENDED_META_DATA = "EXTENDED_META_DATA";
export const OPTION_SUPPRESS_DOCUMENT_ROOT = "OPTION_SUPPRESS_DOCUMENT_ROOT";
export const OPTION_IDREF_RESOLUTION_DEFERRED = "OPTION_IDREF_RESOLUTION_DEFERRED";
export const OPTION_ID_ATTRIBUTE_NAME = "OPTION_ID_ATTRIBUTE_NAME";
export const OPTION_ROOT_OBJECTS = "OPTION_ROOT_OBJECTS";

const LOAD_OBJECT_TYPE = "object";
const LOAD_ERROR_TYPE = "error";

export class XMLLoad {
    protected _resource: XMLResource;
    protected _parser: sax.SAXParser;
    protected _attributes: { [key: string]: sax.QualifiedAttribute } = null;
    protected _namespaces: XMLNamespaces = new XMLNamespaces();
    protected _uriToFactories: Map<string, EFactory> = new Map<string, EFactory>();
    protected _prefixesToURI: Map<string, string> = new Map<string, string>();
    protected _elements: string[] = [];
    protected _objects: EObject[] = [];
    protected _types: any[] = [];
    protected _sameDocumentProxies: EObject[] = [];
    protected _notFeatures: { uri: string; local: string }[] = [
        { uri: XMLConstants.xsiURI, local: XMLConstants.typeAttrib },
        { uri: XMLConstants.xsiURI, local: XMLConstants.schemaLocationAttrib },
        {
            uri: XMLConstants.xsiURI,
            local: XMLConstants.noNamespaceSchemaLocationAttrib,
        },
    ];
    protected _isResolveDeferred: boolean = false;
    protected _isSuppressDocumentRoot: boolean = false;
    protected _references: XMLReference[] = [];
    protected _packageRegistry: EPackageRegistry;
    protected _extendedMetaData: ExtendedMetaData;
    protected _idAttributeName: string;
    protected _textBuilder: String;

    constructor(resource: XMLResource, options: Map<string, any>) {
        this._resource = resource;
        this._packageRegistry = this._resource.eResourceSet()
            ? this._resource.eResourceSet().getPackageRegistry()
            : getPackageRegistry();
        if (options) {
            this._idAttributeName = options.get(OPTION_ID_ATTRIBUTE_NAME);
            this._isSuppressDocumentRoot = options.get(OPTION_SUPPRESS_DOCUMENT_ROOT);
            this._isResolveDeferred = options.get(OPTION_IDREF_RESOLUTION_DEFERRED) === true;
            this._extendedMetaData = options.get(OPTION_EXTENDED_META_DATA);
        }
        if (!this._extendedMetaData) {
            this._extendedMetaData = new ExtendedMetaData();
        }
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
            saxStream.on("text", (t) => this.onText(t));
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
        saxParser.ontext = (t: string) => this.onText(t);
        saxParser.onerror = (e) => this.onError(e);
        this._parser = saxParser;
        this._parser.write(s).close();
    }

    onStartTag(tag: sax.QualifiedTag) {
        this._elements.push(tag.local);
        this.setAttributes(tag.attributes);
        this._namespaces.pushContext();
        this.handlePrefixMapping();
        if (this._objects.length == 0) {
            this.handleSchemaLocation();
        }
        this.processElement(tag.uri, tag.local);
    }

    onEndTag(tagName: string) {
        this._elements.pop();

        let eRoot: EObject = null;
        let eObject: EObject = null;
        if (this._objects.length > 0) {
            eRoot = this._objects[0];
            eObject = this._objects.pop();
        }

        let eType = this._types.pop();
        if (this._textBuilder) {
            if (eType === LOAD_OBJECT_TYPE) {
                if (this._textBuilder.length > 0) {
                    this.handleProxy(eObject, this._textBuilder.toString());
                }
            } else if (eType !== LOAD_ERROR_TYPE) {
                if (eObject == null && this._objects.length > 0) {
                    eObject = this._objects[this._objects.length - 1];
                }
                this.setFeatureValue(
                    eObject,
                    eType as EStructuralFeature,
                    this._textBuilder.toString(),
                    -1
                );
            }
        }
        this._textBuilder = null;

        if (this._elements.length == 0) {
            this.handleReferences();
            this.recordSchemaLocations(eRoot);
        }

        let context = this._namespaces.popContext();
        context.forEach((element) => {
            this._uriToFactories.delete(element.uri);
        });
    }

    onText(text: string): void {}

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

    private setAttributes(attributes: { [key: string]: sax.QualifiedAttribute }): {
        [key: string]: sax.QualifiedAttribute;
    } {
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
        if (this._prefixesToURI.has(prefix)) {
            let index = 1;
            while (this._prefixesToURI.has(prefix + "_" + index)) {
                index++;
            }
            prefix += "_" + index;
        }
        this._prefixesToURI.set(prefix, uri);
        this._uriToFactories.delete(uri);
    }

    private recordSchemaLocations(eObject: EObject) {
        if (this._extendedMetaData && eObject) {
            let xmlnsPrefixMapFeature = this._extendedMetaData.getXMLNSPrefixMapFeature(
                eObject.eClass()
            );
            if (xmlnsPrefixMapFeature) {
                let m = eObject.eGet(xmlnsPrefixMapFeature) as EMap<string, string>;
                for (let [key, value] of this._prefixesToURI) {
                    m.put(key, value);
                }
            }
        }
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

    protected getXSIType(): string {
        return this.getAttributeValue(XMLConstants.xsiURI, XMLConstants.typeAttrib);
    }

    private processElement(uri: string, local: string) {
        if (this._objects.length == 0) {
            let eObject = this.createTopObject(uri, local);
            if (eObject) {
                this._resource.eContents().add(eObject);
            }
        } else {
            this.handleFeature(uri, local);
        }
    }

    private validateObject(eObject: EObject, uri: string, typeName: string) {
        if (!eObject) {
            this.error(
                new EDiagnosticImpl(
                    "Class {'" + uri + +"':'" + typeName + "}' not found",
                    this._resource.eURI.toString(),
                    this._parser.line,
                    this._parser.column
                )
            );
        }
    }

    private processObject(eObject: EObject) {
        if (eObject) {
            this._objects.push(eObject);
            this._types.push(LOAD_OBJECT_TYPE);
        } else {
            this._types.push(LOAD_ERROR_TYPE);
        }
    }

    private createTopObject(uri: string, local: string): EObject {
        let eFactory = this.getFactoryForURI(uri);
        if (eFactory) {
            let ePackage = eFactory.ePackage;
            if (this._extendedMetaData && this._extendedMetaData.getDocumentRoot(ePackage)) {
                let eClass = this._extendedMetaData.getDocumentRoot(ePackage);
                // add document root to object list & handle its features
                let eObject = this.createObjectWithFactory(eFactory, eClass, false);
                this.processObject(eObject);
                this.handleFeature(uri, local);
                if (this._isSuppressDocumentRoot) {
                    // remove document root from object list
                    this._objects.splice(0, 1);
                    // remove type info from type list
                    this._types.splice(0, 1);
                    if (this._objects.length > 0) {
                        eObject = this._objects[0];
                        // remove new object from its container ( document root )
                        EcoreUtils.remove(eObject);
                    }
                }
                return eObject;
            } else {
                let eType = this.getType(ePackage, local);
                let eObject = this.createObjectWithFactory(eFactory, eType);
                this.validateObject(eObject, uri, local);
                this.processObject(eObject);
                return eObject;
            }
        } else {
            let prefix = this._namespaces.getPrefix(uri);
            if (prefix) this.handleUnknownPackage(prefix);
            else this.handleUnknownURI(uri);
            return null;
        }
    }

    private createObjectWithFactory(
        eFactory: EFactory,
        eType: EClassifier,
        handleAttributes: boolean = true
    ): EObject {
        if (eFactory) {
            if (isEClass(eType) && !eType.isAbstract) {
                let eObject = eFactory.create(eType);
                if (eObject && handleAttributes) {
                    this.handleAttributes(eObject);
                }
                return eObject;
            }
        }
        return null;
    }

    private createObjectFromFeatureType(eObject: EObject, eFeature: EStructuralFeature): EObject {
        let eResult: EObject = null;
        if (eFeature?.eType) {
            let eType = eFeature.eType;
            let eFactory = eType.ePackage.eFactoryInstance;
            eResult = this.createObjectWithFactory(eFactory, eType);
        }
        if (eResult) {
            this.setFeatureValue(eObject, eFeature, eResult, -1);
        }
        this.processObject(eResult);
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

        let eType = this.getType(eFactory.ePackage, local);
        let eResult = this.createObjectWithFactory(eFactory, eType);
        this.validateObject(eResult, uri, local);
        if (eResult) {
            this.setFeatureValue(eObject, eFeature, eResult, -1);
        }
        this.processObject(eResult);
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

    private handleFeature(uri: string, local: string) {
        let eObject: EObject = null;
        if (this._objects.length > 0) {
            eObject = this._objects[this._objects.length - 1];
        }

        if (eObject) {
            let eFeature = this.getFeature(eObject, local);
            if (eFeature) {
                let featureKind = this.getLoadFeatureKind(eFeature);
                if (featureKind == LoadFeatureKind.Single || featureKind == LoadFeatureKind.Many) {
                    this._textBuilder = new String();
                    this._types.push(eFeature);
                    this._objects.push(null);
                } else {
                    let xsiType = this.getXSIType();
                    if (xsiType) {
                        this.createObjectFromTypeName(eObject, xsiType, eFeature);
                    } else {
                        this.createObjectFromFeatureType(eObject, eFeature);
                    }
                }
            } else {
                this.handleUnknownFeature(local);
            }
        } else {
            this._types.push(LOAD_ERROR_TYPE);
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

    protected handleAttributes(eObject: EObject) {
        if (this._attributes) {
            for (let i in this._attributes) {
                let attr = this._attributes[i];
                if (attr.local == this._idAttributeName) {
                    // let idManager = this._resource.eResourceIDManager;
                    // idManager.setID(eObject,attr.value);
                } else if (attr.local == XMLConstants.href) {
                    this.handleProxy(eObject, attr.value);
                } else if (attr.prefix != XMLConstants.xmlNS && this.isUserAttribute(attr)) {
                    this.setAttributeValue(eObject, attr);
                }
            }
        }
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

    private handleProxy(eProxy: EObject, id: string): void {
        let uri: URL = null;
        try {
            uri = new URL(id);
        } catch {
            return;
        }

        // resolve reference uri
        if (!uri.protocol) {
            uri = new URL(id, this._resource.eURI);
        }

        // set object proxy uri
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
        if (!eFeature && this._extendedMetaData) {
            for (const eFeature of eClass.eAllStructuralFeatures) {
                if (name === this._extendedMetaData.getName(eFeature)) return eFeature;
            }
        }
        return eFeature;
    }

    private getType(ePackage: EPackage, local: string): EClassifier {
        return this._extendedMetaData
            ? this._extendedMetaData.getType(ePackage, local)
            : ePackage.getEClassifier(local);
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
    currentSegment: XMLStringSegment = null;
    firstElementMark: XMLStringSegment = null;
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

    toString(): string {
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
            if (this.firstElementMark == null ) {
                this.firstElementMark = this.mark()
            }
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

    resetToFirstElementMark() {
        this.resetToMark(this.firstElementMark);
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

function stringFormat(template: string, ...args: any[]) {
    return template.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

export class XMLSave {
    protected _resource: XMLResource;
    protected _str: XMLString = new XMLString();
    private _packages: Map<string, string> = new Map<string, string>();
    private _uriToPrefixes: Map<string, string[]> = new Map<string, string[]>();
    private _prefixesToURI: Map<string, string> = new Map<string, string>();
    private _featureKinds: Map<EStructuralFeature, number> = new Map<EStructuralFeature, number>();
    private _keepDefaults = false;
    private _idAttributeName : string;
    private _roots : EList<EObject>;
    private _extendedMetaData : ExtendedMetaData;

    constructor(resource: XMLResource, options: Map<string, any>) {
        this._resource = resource;
        if (options) {
            this._idAttributeName = options.get(OPTION_ID_ATTRIBUTE_NAME);
            this._roots = options.get(OPTION_ROOT_OBJECTS);
            this._extendedMetaData = options.get(OPTION_EXTENDED_META_DATA);
        }
        if (!this._extendedMetaData) {
            this._extendedMetaData = new ExtendedMetaData();
        }
    }

    saveToStream(rs: fs.WriteStream): Promise<void> {
        return new Promise((resolve, reject) => {
            this.saveContents();
            this._str.write(rs);
            resolve();
        });
    }

    saveToString(): string {
        this.saveContents();
        return this._str.toString();
    }

    private saveContents() {
        let contents = this._roots;
        if (!contents) contents = this._resource.eContents();
        if (contents.isEmpty()) return;

        // header
        this.saveHeader();

        // top object
        let eObject = contents.get(0);

        // initialize prefixes if any in top
        if (this._extendedMetaData) {
            let eClass = eObject.eClass();
            let ePrefixMapFeature = this._extendedMetaData.getXMLNSPrefixMapFeature(eClass);
            if (ePrefixMapFeature) {
                let m = eObject.eGet(ePrefixMapFeature) as Map<string,string>;
                this.setPrefixToNamespace(m);
            }
        }

        // object
        this.saveTopObject(eObject);

        // namespaces
        this._str.resetToFirstElementMark();
        this.saveNamespaces();
    }

    private saveHeader() {
        this._str.add(stringFormat('<?xml version="{0}" encoding="{1}"?>',this._resource.xmlVersion,this._resource.encoding));
        this._str.addLine();
    }

    private saveTopObject(eObject: EObject) {
        let eClass = eObject.eClass();
        if (!this._extendedMetaData || this._extendedMetaData.getDocumentRoot(eClass.ePackage) != eClass) {
            let rootFeature = this.getRootFeature(eClass);
            let name = rootFeature ? this.getFeatureQName(rootFeature) : this.getClassQName(eClass);
            this._str.startElement(name);
        } else {
            this._str.startElement("");
        }
        this.saveElementID(eObject);
        this.saveFeatures(eObject, false);
    }

    private getRootFeature(eClassifier : EClassifier) : EStructuralFeature {
        if (this._extendedMetaData) {
            while (eClassifier) {
                let eClass = this._extendedMetaData.getDocumentRoot(eClassifier.ePackage);
                if (eClass) {
                    for (const eFeature of eClass.eStructuralFeatures) {
                        if (eFeature.eType == eClassifier && eFeature.isChangeable)
                            return eFeature;
                    }
                }
                if (isEClass(eClassifier)) {
                    let eSuperTypes = eClassifier.eSuperTypes;
                    if (eSuperTypes.isEmpty())
                        eClassifier = null;
                    else
                        eClassifier = eSuperTypes.get(0);
                } else {
                    eClassifier = null;
                }
            }
        }
        return null;
    }

    protected saveElementID(eObject: EObject) {

    }

    private saveFeatures(eObject: EObject, attributesOnly: boolean): boolean {
        let eAllFeatures = eObject.eClass().eAllStructuralFeatures;
        let elementFeatures: number[];
        let elementCount = 0;

        LOOP: for (let i = 0; i < eAllFeatures.size(); i++) {
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
        this._str.addAttribute("xsi:type", this.getClassQName(eClass));
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
            } else if (o.eIsProxy()) {
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
        if (value == null) {
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

    private getClassQName(eClass : EClass) : string {
        return this.getElementQName(eClass.ePackage, this.getXmlName(eClass), false);
    }
    
    private getFeatureQName(eFeature : EStructuralFeature) : string {
        if (this._extendedMetaData) {
            let name = this._extendedMetaData.getName(eFeature);
            let namespace = this._extendedMetaData.getNamespace(eFeature);
            let ePackage = this.getPackageForSpace(namespace);
            if (ePackage) {
                return this.getElementQName(ePackage, name, false);
            } else {
                return name;
            }
        } else {
            return eFeature.name;
        }
    }
    
    private getElementQName(ePackage : EPackage, name : string, mustHavePrefix : boolean) :string {
        let nsPrefix = this.getPrefix(ePackage, mustHavePrefix);
        if (nsPrefix == "") {
            return name
        } else if (name.length == 0) {
            return nsPrefix
        } else {
            return nsPrefix + ":" + name
        }
    }
    
    private getXmlName(eElement : ENamedElement) : string {
        if (this._extendedMetaData) {
            return this._extendedMetaData.getName(eElement);
        }
        return eElement.name;
    }

    private getPrefix(ePackage: EPackage, mustHavePrefix: boolean): string {
        let nsPrefix = this._packages.get(ePackage.nsURI);
        if (!nsPrefix) {
            let nsURI = ePackage.nsURI
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

    private setPrefixToNamespace(prefixToNamespaceMap : Map<string,string>) {
        for (let [prefix,nsURI] of prefixToNamespaceMap) {
            let ePackage = this.getPackageForSpace(nsURI);
            if (ePackage) {
                this._packages.set(ePackage.nsURI,prefix);
            }
            this._prefixesToURI.set(prefix,nsURI);
            if (this._uriToPrefixes.has(nsURI)) {
                let prefixes = this._uriToPrefixes.get(nsURI);
                prefixes.push(prefix);
                this._uriToPrefixes.set(nsURI,prefixes);  
            } else {
                this._uriToPrefixes.set(nsURI,[]);  
            }
        }
    }

    private getPackageForSpace(nsURI : string) : EPackage {
        let packageRegistry = getPackageRegistry();
        if (this._resource.eResourceSet()) {
            packageRegistry = this._resource.eResourceSet().getPackageRegistry();
        }
        return packageRegistry.getPackage(nsURI);
    }

    private shouldSaveFeature(o: EObject, f: EStructuralFeature): boolean {
        return o.eIsSet(f) || (this._keepDefaults && f.defaultValueLiteral != "");
    }

    private isNil(eObject: EObject, eFeature: EStructuralFeature): boolean {
        return eObject.eGetResolve(eFeature, false) == null;
    }

    private isEmpty(eObject: EObject, eFeature: EStructuralFeature): boolean {
        return (eObject.eGetResolve(eFeature, false) as EList<EObject>).isEmpty();
    }

    private getSaveFeatureKind(f: EStructuralFeature): SaveFeatureKind {
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
