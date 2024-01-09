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
import { Err, Ok, Result } from "ts-results";
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
    EObject,
    EObjectInternal,
    EPackage,
    EPackageRegistry,
    EReference,
    EResource,
    EDecoder,
    EStructuralFeature,
    ExtendedMetaData,
    getPackageRegistry,
    isEClass,
    isEDataType,
    XMLNamespaces,
    XMLOptions,
} from "./internal";
import { XMLConstants } from "./XMLConstants";

type XMLReference = {
    object: EObject;
    feature: EStructuralFeature;
    id: string;
    pos: number;
};

const LOAD_OBJECT_TYPE = "object";
const LOAD_ERROR_TYPE = "error";

enum LoadFeatureKind {
    Single,
    Many,
    ManyAdd,
    ManyMove,
    Other,
}

export class XMLDecoder implements EDecoder {
    protected _resource: EResource;
    protected _parser: sax.SAXParser;
    protected _attributes: { [key: string]: sax.QualifiedAttribute } = null;
    protected _namespaces: XMLNamespaces = new XMLNamespaces();
    protected _uriToFactories: Map<string, EFactory> = new Map<string, EFactory>();
    protected _prefixesToURI: Map<string, string> = new Map<string, string>();
    protected _elements: string[] = [];
    protected _deferred: EObject[];
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
    protected _text: string;
    protected _xmlVersion: string;
    protected _encoding: string;
    private _attachFn: (eObject: EObject) => void;
    private _errorFn: (eDiagnostic: EDiagnostic) => void;

    constructor(resource: EResource, options: Map<string, any>) {
        this._resource = resource;
        this._packageRegistry = this._resource.eResourceSet()
            ? this._resource.eResourceSet().getPackageRegistry()
            : getPackageRegistry();
        if (options) {
            this._idAttributeName = options.get(XMLOptions.ID_ATTRIBUTE_NAME);
            this._isSuppressDocumentRoot = options.get(XMLOptions.SUPPRESS_DOCUMENT_ROOT);
            this._isResolveDeferred =
                options.get(XMLOptions.DEFERRED_REFERENCE_RESOLUTION) === true;
            this._extendedMetaData = options.get(XMLOptions.EXTENDED_META_DATA);
            if (options.get(XMLOptions.DEFERRED_ROOT_ATTACHMENT) === true) {
                this._deferred = [];
            }
        }
        if (!this._extendedMetaData) {
            this._extendedMetaData = new ExtendedMetaData();
        }
    }

    setXMLVersion(xmlVersion: string): void {
        this._xmlVersion = xmlVersion;
    }

    setEncoding(encoding: string): void {
        this._encoding = encoding;
    }

    getXMLVersion(): string {
        return this._xmlVersion;
    }

    getEncoding(): string {
        return this._encoding;
    }

    decode(buffer: BufferSource): Result<EResource, Error> {
        // create parser and configure decoder
        this._parser = this.createSAXParser();
        this._attachFn = function (eObject: EObject): void {
            this._resource.eContents().add(eObject);
        };
        this._errorFn = function (eDiagnostic: EDiagnostic): void {
            this._resource.getErrors().add(eDiagnostic);
        };

        // parse buffer
        this._parser.write(buffer.toString()).close();

        // check errors
        let errors = this._resource.getErrors();
        return errors.isEmpty() ? Ok(this._resource) : Err(errors.get(0));
    }

    decodeObject(buffer: BufferSource): Result<EObject, Error> {
        // create parser and configure decoder
        this._parser = this.createSAXParser();

        var error: Error;
        var object: EObject;
        this._attachFn = function (eObject: EObject): void {
            if (!object) {
                object = eObject;
            }
        };
        this._errorFn = function (eDiagnostic: EDiagnostic): void {
            if (!error) {
                error = eDiagnostic;
            }
        };

        // parse buffer
        this._parser.write(buffer.toString()).close();

        // check error
        return error ? Err(error) : Ok(object);
    }

    private createSAXParser(): sax.SAXParser {
        // configure parser
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
        saxParser.onprocessinginstruction = (n) => this.onProcessingInstruction(n);
        return saxParser;
    }

    decodeAsync(stream: fs.ReadStream): Promise<EResource> {
        return new Promise<EResource>((resolve, reject) => {
            this._attachFn = function (eObject: EObject): void {
                this._resource.eContents().add(eObject);
            };
            this._errorFn = function (eDiagnostic: EDiagnostic): void {
                this._resource.getErrors().add(eDiagnostic);
            };
            let saxStream = this.createSAXStream(() => {
                let errors = this._resource.getErrors();
                if (errors.isEmpty()) {
                    resolve(this._resource);
                } else {
                    reject(errors.get(0));
                }
            });
            this._parser = (saxStream as any)["_parser"];
            stream.pipe(saxStream);
        });
    }

    decodeObjectAsync(stream: fs.ReadStream): Promise<EObject> {
        return new Promise<EObject>((resolve, reject) => {
            var error: Error;
            var object: EObject;
            this._attachFn = function (eObject: EObject): void {
                if (!object) {
                    object = eObject;
                }
            };
            this._errorFn = function (eDiagnostic: EDiagnostic): void {
                if (!error) {
                    error = eDiagnostic;
                }
            };
            let saxStream = this.createSAXStream(() => {
                if (error) {
                    reject(error);
                } else {
                    resolve(object);
                }
            });
            this._parser = (saxStream as any)["_parser"];
            stream.pipe(saxStream);
        });
    }

    private createSAXStream(end: () => void): sax.SAXStream {
        let saxStream = new sax.SAXStream(true, {
            trim: true,
            lowercase: true,
            xmlns: true,
            position: true,
        });
        saxStream.on("processinginstruction", (n) => this.onProcessingInstruction(n));
        saxStream.on("opentag", (t: sax.QualifiedTag) => this.onStartTag(t));
        saxStream.on("closetag", (t) => this.onEndTag(t));
        saxStream.on("text", (t) => this.onText(t));
        saxStream.on("error", (e) => this.onError(e));
        saxStream.on("end", end);
        return saxStream;
    }

    private onProcessingInstruction(node: { name: string; body: string }) {
        if (node.name == "xml") {
            let ver = this.procInst("version", node.body);
            if (ver != "") {
                this._xmlVersion = ver;
            }

            let encoding = this.procInst("encoding", node.body);
            if (encoding != "") {
                this._encoding = encoding;
            }
        }
    }

    private procInst(param: string, s: string): string {
        let regexp = new RegExp(param + '="([^"]*)"', "g");
        let match = regexp.exec(s);
        return match.length == 0 ? "" : match[1];
    }

    private onStartTag(tag: sax.QualifiedTag) {
        this._elements.push(tag.local);
        this.setAttributes(tag.attributes);
        this._namespaces.pushContext();
        this.handlePrefixMapping();
        if (this._objects.length == 0) {
            this.handleSchemaLocation();
        }
        this.processElement(tag.uri, tag.local);
    }

    private onEndTag(tagName: string) {
        this._elements.pop();

        let eRoot: EObject = null;
        let eObject: EObject = null;
        if (this._objects.length > 0) {
            eRoot = this._objects[0];
            eObject = this._objects.pop();
        }

        let eType = this._types.pop();
        if (this._text) {
            if (eType === LOAD_OBJECT_TYPE) {
                if (this._text.length > 0) {
                    this.handleProxy(eObject, this._text);
                }
            } else if (eType !== LOAD_ERROR_TYPE) {
                if (eObject == null && this._objects.length > 0) {
                    eObject = this._objects[this._objects.length - 1];
                }
                this.setFeatureValue(eObject, eType as EStructuralFeature, this._text, -1);
            }
        }
        delete this._text;

        if (this._elements.length == 0) {
            if (this._deferred) {
                this._deferred.forEach((element) => {
                    this._resource.eContents().add(element);
                });
            }
            this.handleReferences();
            this.recordSchemaLocations(eRoot);
        }

        let context = this._namespaces.popContext();
        context.forEach((element) => {
            this._uriToFactories.delete(element.uri);
        });
    }

    private onText(text: string): void {
        if (this._text) {
            this._text += text;
        }
    }

    private onError(err: Error) {
        this.error(
            new EDiagnosticImpl(
                err.message,
                this._resource.eURI.toString(),
                this._parser.line,
                this._parser.column,
            ),
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
                eObject.eClass(),
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
            XMLConstants.schemaLocationAttrib,
        );
        if (xsiSchemaLocation) {
            this.handleXSISchemaLocation(xsiSchemaLocation);
        }

        let xsiNoNamespaceSchemaLocation = this.getAttributeValue(
            XMLConstants.xsiURI,
            XMLConstants.noNamespaceSchemaLocationAttrib,
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
                if (this._deferred) {
                    this._deferred.push(eObject);
                } else {
                    this._attachFn(eObject);
                }
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
                    this._parser.column,
                ),
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
        handleAttributes: boolean = true,
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
        eFeature: EStructuralFeature,
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
                    this._text = "";
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
                        (eProxy as EObjectInternal).eProxyURI().href.slice(1),
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
                        this._parser.column,
                    ),
                );
            }
        }
    }

    protected handleAttributes(eObject: EObject) {
        if (this._attributes) {
            for (let i in this._attributes) {
                let attr = this._attributes[i];
                if (attr.local == this._idAttributeName) {
                    let idManager = this._resource.eObjectIDManager;
                    if (idManager) idManager.setID(eObject, attr.value);
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
        position: number,
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
                this._parser.line,
            ),
        );
    }

    private handleUnknownPackage(name: string) {
        this.error(
            new EDiagnosticImpl(
                "Package " + name + " not found",
                this._resource.eURI?.toString(),
                this._parser.column,
                this._parser.line,
            ),
        );
    }

    private handleUnknownURI(name: string) {
        this.error(
            new EDiagnosticImpl(
                "URI " + name + " not found",
                this._resource.eURI?.toString(),
                this._parser.column,
                this._parser.line,
            ),
        );
    }

    private error(diagnostic: EDiagnostic) {
        this._errorFn(diagnostic);
    }
}
