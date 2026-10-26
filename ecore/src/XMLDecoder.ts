// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import sax from "sax"
import { Err, Ok, Result } from "ts-results-es"
import {
    BufferLike,
    EClass,
    EClassifier,
    EcoreUtils,
    EDataType,
    EDecoder,
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
    EStructuralFeature,
    ExtendedMetaData,
    getPackageRegistry,
    isEAttribute,
    isEClass,
    isEDataType,
    isEPackage,
    ReadableStreamLike,
    URI,
    XMLNamespaces,
    XMLOptions
} from "./internal.js"
import { ensureAsyncIterable } from "./utils/Stream.js"
import { ensureUint8Array } from "./utils/TypedArray.js"
import { utf8Decode } from "./utils/UTF8.js"
import { XMLConstants } from "./XMLConstants.js"

type XMLReference = {
    object: EObject
    feature: EStructuralFeature
    id: string
    pos: number
}

const LOAD_OBJECT_TYPE = "object"
const LOAD_ERROR_TYPE = "error"

// adds a decoded value to a many-valued feature without the duplicate scan, which
// made loading a long list quadratic. A list without addUnique falls back to add.
function appendLoaded(eList: EList<EObject>, value: any) {
    if ("addUnique" in eList && typeof eList.addUnique === "function") {
        eList.addUnique(value)
    } else {
        eList.add(value)
    }
}

enum LoadFeatureKind {
    Single,
    Many,
    ManyAdd,
    ManyMove,
    Other
}

export class XMLDecoder implements EDecoder {
    protected _resource: EResource
    protected _parser: sax.SAXParser
    protected _attributes: { [key: string]: sax.QualifiedAttribute } = null
    protected _namespaces: XMLNamespaces = new XMLNamespaces()
    protected _uriToFactories: Map<string, EFactory> = new Map<string, EFactory>()
    protected _prefixesToURI: Map<string, string> = new Map<string, string>()
    protected _elements: string[] = []
    protected _deferred: EObject[]
    protected _objects: EObject[] = []
    protected _types: any[] = []
    protected _sameDocumentProxies: EObject[] = []
    protected _notFeatures: { uri: string; local: string }[] = [
        { uri: XMLConstants.xsiURI, local: XMLConstants.typeAttrib },
        { uri: XMLConstants.xsiURI, local: XMLConstants.schemaLocationAttrib },
        {
            uri: XMLConstants.xsiURI,
            local: XMLConstants.noNamespaceSchemaLocationAttrib
        }
    ]
    protected _isResolveDeferred: boolean = false
    protected _isSuppressDocumentRoot: boolean = false
    protected _references: XMLReference[] = []
    protected _packageRegistry: EPackageRegistry
    protected _extendedMetaData: ExtendedMetaData
    protected _idAttributeName: string
    // the ids of the objects of the document set by setObjectID (xmi:id)
    protected _ids: Map<string, EObject>
    protected _text: string
    // the kind="simple" attribute of a class, if any
    private _simpleFeatures: Map<EClass, EStructuralFeature> = new Map<EClass, EStructuralFeature>()
    protected _xmlVersion: string
    protected _encoding: string
    // the load options of the document: a package it names in xsi:schemaLocation loads with them
    private _options: Map<string, any>
    // the locations of the xsi:schemaLocation of the document by namespace, the location of
    // xsi:noNamespaceSchemaLocation under ""
    private _urisToLocations: Map<string, URI> = new Map<string, URI>()
    // the reasons why the package at the location of a namespace did not load
    private _locationErrors: Map<string, string> = new Map<string, string>()
    private _attachFn: (eObject: EObject) => void
    private _errorFn: (eDiagnostic: EDiagnostic) => void

    constructor(resource: EResource, options: Map<string, any>) {
        this._resource = resource
        this._packageRegistry = this._resource.eResourceSet() ? this._resource.eResourceSet().getPackageRegistry() : getPackageRegistry()
        this._options = options
        if (options) {
            this._idAttributeName = options.get(XMLOptions.ID_ATTRIBUTE_NAME)
            this._isSuppressDocumentRoot = options.get(XMLOptions.SUPPRESS_DOCUMENT_ROOT)
            this._isResolveDeferred = options.get(XMLOptions.DEFERRED_REFERENCE_RESOLUTION) === true
            this._extendedMetaData = options.get(XMLOptions.EXTENDED_META_DATA)
            if (options.get(XMLOptions.DEFERRED_ROOT_ATTACHMENT) === true) {
                this._deferred = []
            }
        }
        if (!this._extendedMetaData) {
            this._extendedMetaData = new ExtendedMetaData()
        }
    }

    setXMLVersion(xmlVersion: string): void {
        this._xmlVersion = xmlVersion
    }

    setEncoding(encoding: string): void {
        this._encoding = encoding
    }

    getXMLVersion(): string {
        return this._xmlVersion
    }

    getEncoding(): string {
        return this._encoding
    }

    private createSAXParser(): sax.SAXParser {
        // configure parser
        const saxParser = new sax.SAXParser(true, {
            trim: false,
            lowercase: true,
            xmlns: true,
            position: true
        })
        saxParser.onopentag = (t: sax.QualifiedTag) => this.onStartTag(t)
        saxParser.onclosetag = (t: string) => this.onEndTag(t)
        saxParser.ontext = (t: string) => this.onText(t)
        saxParser.oncdata = (t: string) => this.onText(t)
        saxParser.onerror = (e) => this.onError(e)
        saxParser.onprocessinginstruction = (n) => this.onProcessingInstruction(n)
        return saxParser
    }

    decode(bufferLike: BufferLike): Result<EResource, Error> {
        // contents & errors
        this._attachFn = function (eObject: EObject): void {
            this._resource.eContents().add(eObject)
        }
        this._errorFn = function (eDiagnostic: EDiagnostic): void {
            this._resource.getErrors().add(eDiagnostic)
        }
        // parser & buffer
        const buffer = ensureUint8Array(bufferLike)
        const bufferUTF8 = utf8Decode(buffer, 0, buffer.length)
        this._parser = this.createSAXParser()
        this._parser.write(bufferUTF8).close()

        // check errors
        const errors = this._resource.getErrors()
        return errors.isEmpty() ? Ok(this._resource) : Err(errors.get(0))
    }

    decodeObject(bufferLike: BufferLike): Result<EObject, Error> {
        // object & error
        let error: Error
        let object: EObject
        this._attachFn = function (eObject: EObject): void {
            if (!object) {
                object = eObject
            }
        }
        this._errorFn = function (eDiagnostic: EDiagnostic): void {
            if (!error) {
                error = eDiagnostic
            }
        }
        // parser & buffer
        const buffer = ensureUint8Array(bufferLike)
        const bufferUTF8 = utf8Decode(buffer, 0, buffer.length)
        this._parser = this.createSAXParser()
        this._parser.write(bufferUTF8).close()
        // check error
        return error ? Err(error) : Ok(object)
    }

    async decodeAsync(streamLike: ReadableStreamLike<BufferLike>): Promise<EResource> {
        // content & error
        const errors = this._resource.getErrors()
        const contents = this._resource.eContents()
        this._attachFn = function (eObject: EObject): void {
            contents.add(eObject)
        }
        this._errorFn = function (eDiagnostic: EDiagnostic): void {
            errors.add(eDiagnostic)
        }
        // parser & buffer
        this._parser = this.createSAXParser()
        await this.writeStream(streamLike)
        // close parser
        this._parser.close()
        // result
        return errors.isEmpty() ? this._resource : Promise.reject(errors.get(0))
    }

    async decodeObjectAsync(streamLike: ReadableStreamLike<BufferLike>): Promise<EObject> {
        // object & error
        let error: Error
        let object: EObject
        this._attachFn = function (eObject: EObject): void {
            if (!object) {
                object = eObject
            }
        }
        this._errorFn = function (eDiagnostic: EDiagnostic): void {
            if (!error) {
                error = eDiagnostic
            }
        }
        // parser & buffer
        this._parser = this.createSAXParser()
        await this.writeStream(streamLike)
        // close parser
        this._parser.close()
        // result
        return error ? Promise.reject(error) : object
    }

    private async writeStream(streamLike: ReadableStreamLike<BufferLike>): Promise<void> {
        // a single streaming decoder keeps multibyte characters split across chunks intact
        const textDecoder = new TextDecoder("utf-8")
        for await (const bufferLike of ensureAsyncIterable(streamLike)) {
            const text = textDecoder.decode(ensureUint8Array(bufferLike), { stream: true })
            if (text.length > 0) {
                this._parser.write(text)
            }
        }
        const remaining = textDecoder.decode()
        if (remaining.length > 0) {
            this._parser.write(remaining)
        }
    }

    private onProcessingInstruction(node: { name: string; body: string }) {
        if (node.name == "xml") {
            const ver = this.procInst("version", node.body)
            if (ver != "") {
                this._xmlVersion = ver
            }

            const encoding = this.procInst("encoding", node.body)
            if (encoding != "") {
                this._encoding = encoding
            }
        }
    }

    private procInst(param: string, s: string): string {
        const regexp = new RegExp(param + '="([^"]*)"', "g")
        const match = regexp.exec(s)
        return !match || match.length == 0 ? "" : match[1]
    }

    private onStartTag(tag: sax.QualifiedTag) {
        this._elements.push(tag.local)
        this.setAttributes(tag.attributes)
        this._namespaces.pushContext()
        this.handlePrefixMapping()
        if (this._objects.length == 0) {
            this.handleSchemaLocation()
        }
        this.processElement(tag.uri, tag.local)
    }

    private onEndTag(tagName: string) {
        this._elements.pop()

        let eRoot: EObject = null
        let eObject: EObject = null
        if (this._objects.length > 0) {
            eRoot = this._objects[0]
            eObject = this._objects.pop()
        }

        const eType = this._types.pop()
        if (this._text !== undefined) {
            if (eType === LOAD_OBJECT_TYPE) {
                if (this._text.length > 0) {
                    // the text of an element is the simple content of its class if it has one, else a proxy URI
                    const eSimpleFeature = this.getSimpleFeature(eObject.eClass())
                    if (eSimpleFeature) {
                        this.setFeatureValue(eObject, eSimpleFeature, this._text, -1)
                    } else {
                        this.handleProxy(eObject, this._text)
                    }
                }
            } else if (eType !== LOAD_ERROR_TYPE) {
                if (eObject == null && this._objects.length > 0) {
                    eObject = this._objects[this._objects.length - 1]
                }
                this.setFeatureValue(eObject, eType as EStructuralFeature, this._text, -1)
            }
        }
        delete this._text

        if (this._elements.length == 0) {
            if (this._deferred) {
                this._deferred.forEach((element) => {
                    this._resource.eContents().add(element)
                })
            }
            this.handleReferences()
            this.recordSchemaLocations(eRoot)
        }

        const context = this._namespaces.popContext()
        context.forEach((element) => {
            this._uriToFactories.delete(element.uri)
        })
    }

    private onText(text: string): void {
        if (this._text !== undefined) {
            this._text += text
        }
    }

    private onError(err: Error) {
        this.decodeError(err.message)
    }

    private setAttributes(attributes: { [key: string]: sax.QualifiedAttribute }): {
        [key: string]: sax.QualifiedAttribute
    } {
        const oldAttributes = this._attributes
        this._attributes = attributes
        return oldAttributes
    }

    protected getAttributeValue(uri: string, local: string): string {
        if (this._attributes) {
            for (const i in this._attributes) {
                const attr = this._attributes[i]
                if (attr.uri == uri && attr.local == local) {
                    return attr.value
                }
            }
        }
        return null
    }

    private handlePrefixMapping(): void {
        if (this._attributes) {
            for (const i in this._attributes) {
                const attr = this._attributes[i]
                if (attr.prefix == XMLConstants.xmlNS) {
                    this.startPrefixMapping(attr.local, attr.value)
                }
            }
        }
    }

    private startPrefixMapping(prefix: string, uri: string) {
        this._namespaces.declarePrefix(prefix, uri)
        if (this._prefixesToURI.has(prefix)) {
            let index = 1
            while (this._prefixesToURI.has(prefix + "_" + index)) {
                index++
            }
            prefix += "_" + index
        }
        this._prefixesToURI.set(prefix, uri)
        this._uriToFactories.delete(uri)
    }

    private recordSchemaLocations(eObject: EObject) {
        if (this._extendedMetaData && eObject) {
            const xmlnsPrefixMapFeature = this._extendedMetaData.getXMLNSPrefixMapFeature(eObject.eClass())
            if (xmlnsPrefixMapFeature) {
                const m = eObject.eGet(xmlnsPrefixMapFeature) as EMap<string, string>
                for (const [key, value] of this._prefixesToURI) {
                    m.put(key, value)
                }
            }
        }
    }

    private handleSchemaLocation(): void {
        const xsiSchemaLocation = this.getAttributeValue(XMLConstants.xsiURI, XMLConstants.schemaLocationAttrib)
        if (xsiSchemaLocation) {
            this.handleXSISchemaLocation(xsiSchemaLocation)
        }

        const xsiNoNamespaceSchemaLocation = this.getAttributeValue(XMLConstants.xsiURI, XMLConstants.noNamespaceSchemaLocationAttrib)
        if (xsiNoNamespaceSchemaLocation) {
            this.handleXSINoNamespaceSchemaLocation(xsiNoNamespaceSchemaLocation)
        }
    }

    // handleXSISchemaLocation records the locations of xsi:schemaLocation, pairs of a namespace and a
    // location, a relative location resolved against the uri of the resource. The package of a
    // namespace loads from its location when the package registry does not know it (see
    // getPackageFromLocation).
    protected handleXSISchemaLocation(loc: string): void {
        const fields = loc.split(/\s+/).filter((field) => field.length > 0)
        for (let i = 0; i + 1 < fields.length; i += 2) {
            this.putLocation(fields[i], fields[i + 1])
        }
    }

    // handleXSINoNamespaceSchemaLocation records the location of the elements without namespace.
    protected handleXSINoNamespaceSchemaLocation(loc: string): void {
        this.putLocation("", loc.trim())
    }

    private putLocation(uri: string, location: string) {
        let locationURI: URI
        try {
            locationURI = new URI(location)
        } catch {
            return
        }
        const resourceURI = this._resource.getURI()
        if (resourceURI && !locationURI.isAbsolute()) {
            locationURI = resourceURI.resolve(locationURI)
        }
        this._urisToLocations.set(uri, locationURI)
    }

    // getPackageFromLocation loads the package of the namespace uri from its schema location, through
    // the resource set with the options of the document, and registers it in the package registry of
    // the resource set (EMF XMLHandler.getPackageForURI). A resource of the resource set at the location
    // is reused, loaded when it is not: a resource being loaded, as in a cycle of schema locations,
    // gives the package already decoded. It returns null without a location or a resource set, or when
    // the location has no package, the reason recorded for the diagnostic of the unknown package.
    private getPackageFromLocation(uri: string): EPackage {
        const location = this._urisToLocations.get(uri)
        const eResourceSet = this._resource.eResourceSet()
        if (!location || !eResourceSet) {
            return null
        }
        let eResource = eResourceSet.getResource(location, false)
        if (!eResource) {
            eResource = eResourceSet.createResource(location)
            if (!eResource) {
                this._locationErrors.set(uri, location.toString() + ": no codec")
                return null
            }
            this.loadLocation(eResource)
            if (!eResource.isLoaded() || !eResource.getErrors().isEmpty()) {
                // a location that does not load is not kept in the resource set
                eResourceSet.getResources().remove(eResource)
                const reason = eResource.getErrors().isEmpty() ? "not loaded" : eResource.getErrors().get(0).message
                this._locationErrors.set(uri, location.toString() + ": " + reason)
                return null
            }
        } else if (!eResource.isLoaded() && !eResource.isLoading()) {
            this.loadLocation(eResource)
        }
        for (const eObject of eResource.eContents()) {
            if (isEPackage(eObject)) {
                eResourceSet.getPackageRegistry().registerPackage(eObject)
                return eObject
            }
        }
        this._locationErrors.set(uri, location.toString() + ": no package")
        return null
    }

    private loadLocation(eResource: EResource) {
        try {
            eResource.loadSync(this._options)
        } catch (e) {
            eResource.getErrors().add(new EDiagnosticImpl(e instanceof Error ? e.message : String(e), eResource.getURI().toString(), 0, 0))
        }
    }

    protected getXSIType(): string {
        return this.getAttributeValue(XMLConstants.xsiURI, XMLConstants.typeAttrib)
    }

    private processElement(uri: string, local: string) {
        if (this._objects.length == 0) {
            const eObject = this.createTopObject(uri, local)
            if (eObject) {
                if (this._deferred) {
                    this._deferred.push(eObject)
                } else {
                    this._attachFn(eObject)
                }
            }
        } else {
            this.handleFeature(uri, local)
        }
    }

    private validateObject(eObject: EObject, uri: string, typeName: string) {
        if (!eObject) {
            this.decodeError("Class {'" + uri + "':'" + typeName + "'} not found")
        }
    }

    private processObject(eObject: EObject) {
        if (eObject) {
            this._objects.push(eObject)
            this._types.push(LOAD_OBJECT_TYPE)
            // capture the text of the element of a class with simple content
            if (this.getSimpleFeature(eObject.eClass())) {
                this._text = ""
            }
        } else {
            this._types.push(LOAD_ERROR_TYPE)
        }
    }

    private getSimpleFeature(eClass: EClass): EStructuralFeature {
        let eFeature = this._simpleFeatures.get(eClass)
        if (eFeature === undefined) {
            eFeature = null
            if (this._extendedMetaData) {
                for (const f of eClass.getEAllStructuralFeatures()) {
                    if (isEAttribute(f) && this._extendedMetaData.getFeatureKind(f) === "simple") {
                        eFeature = f
                        break
                    }
                }
            }
            this._simpleFeatures.set(eClass, eFeature)
        }
        return eFeature
    }

    private createTopObject(uri: string, local: string): EObject {
        const eFactory = this.getFactoryForURI(uri)
        if (eFactory) {
            const ePackage = eFactory.getEPackage()
            if (this._extendedMetaData && this._extendedMetaData.getDocumentRoot(ePackage)) {
                const eClass = this._extendedMetaData.getDocumentRoot(ePackage)
                // add document root to object list & handle its features
                let eObject = this.createObjectWithFactory(eFactory, eClass, false)
                this.processObject(eObject)
                this.handleFeature(uri, local)
                if (this._isSuppressDocumentRoot) {
                    // remove document root from object list
                    this._objects.splice(0, 1)
                    // remove type info from type list
                    this._types.splice(0, 1)
                    if (this._objects.length > 0) {
                        eObject = this._objects[0]
                        // remove new object from its container ( document root )
                        EcoreUtils.remove(eObject)
                    }
                }
                return eObject
            } else {
                const eType = this.getType(ePackage, local)
                const eObject = this.createObjectWithFactory(eFactory, eType)
                this.validateObject(eObject, uri, local)
                this.processObject(eObject)
                return eObject
            }
        } else {
            const prefix = this._namespaces.getPrefix(uri)
            if (prefix) this.handleUnknownPackage(prefix, uri)
            else this.handleUnknownURI(uri)
            return null
        }
    }

    private createObjectWithFactory(eFactory: EFactory, eType: EClassifier, handleAttributes: boolean = true): EObject {
        if (eFactory) {
            if (isEClass(eType) && !eType.isAbstract()) {
                const eObject = eFactory.create(eType)
                if (eObject && handleAttributes) {
                    this.handleAttributes(eObject)
                }
                return eObject
            }
        }
        return null
    }

    private createObjectFromFeatureType(eObject: EObject, eFeature: EStructuralFeature): EObject {
        let eResult: EObject = null
        if (eFeature?.getEType()) {
            const eType = eFeature.getEType()
            const ePackage = eType.getEPackage()
            // the factory the package registry chose for the package, else its factory instance
            let eFactory = this.getFactoryForURI(ePackage.getNsURI())
            if (!eFactory || eFactory.getEPackage() != ePackage) {
                eFactory = ePackage.getEFactoryInstance()
            }
            eResult = this.createObjectWithFactory(eFactory, eType)
        }
        if (eResult) {
            this.setFeatureValue(eObject, eFeature, eResult, -1)
        }
        this.processObject(eResult)
        return eResult
    }

    private createObjectFromTypeName(eObject: EObject, qname: string, eFeature: EStructuralFeature): EObject {
        let prefix = ""
        let local = qname
        const index = qname.indexOf(":")
        if (index != -1) {
            prefix = qname.slice(0, index)
            local = qname.slice(index + 1)
        }

        const uri = this._namespaces.getURI(prefix)
        const eFactory = this.getFactoryForURI(uri)
        if (!eFactory) {
            this.handleUnknownPackage(prefix, uri)
            return null
        }

        const eType = this.getType(eFactory.getEPackage(), local)
        const eResult = this.createObjectWithFactory(eFactory, eType)
        this.validateObject(eResult, uri, local)
        if (eResult) {
            this.setFeatureValue(eObject, eFeature, eResult, -1)
        }
        this.processObject(eResult)
        return eResult
    }

    private getFactoryForURI(uri: string): EFactory {
        let factory = this._uriToFactories.get(uri)
        if (factory == undefined) {
            factory = this._packageRegistry.getFactory(uri)
            if (!factory && this.getPackageFromLocation(uri)) {
                factory = this._packageRegistry.getFactory(uri)
            }
            if (factory) {
                this._uriToFactories.set(uri, factory)
            }
        }
        return factory
    }

    private handleFeature(uri: string, local: string) {
        let eObject: EObject = null
        if (this._objects.length > 0) {
            eObject = this._objects[this._objects.length - 1]
        }

        if (eObject) {
            const eFeature = this.getFeature(eObject, local)
            if (eFeature) {
                const featureKind = this.getLoadFeatureKind(eFeature)
                if (featureKind == LoadFeatureKind.Single || featureKind == LoadFeatureKind.Many) {
                    this._text = ""
                    this._types.push(eFeature)
                    this._objects.push(null)
                } else {
                    const xsiType = this.getXSIType()
                    if (xsiType) {
                        this.createObjectFromTypeName(eObject, xsiType, eFeature)
                    } else {
                        this.createObjectFromFeatureType(eObject, eFeature)
                    }
                }
            } else {
                // a placeholder, so onEndTag pops it and not a real ancestor
                this._types.push(LOAD_ERROR_TYPE)
                this._objects.push(null)
                this.handleUnknownFeature(local)
            }
        } else {
            this._types.push(LOAD_ERROR_TYPE)
            this._objects.push(null)
            this.handleUnknownFeature(local)
        }
    }

    private handleReferences() {
        for (const eProxy of this._sameDocumentProxies) {
            for (const eReference of eProxy.eClass().getEAllReferences()) {
                const eOpposite = eReference.getEOpposite()
                if (eOpposite && eOpposite.isChangeable() && eProxy.eIsSet(eReference)) {
                    const resolvedObject = this.getEObject((eProxy as EObjectInternal).eProxyURI().fragment)
                    if (resolvedObject) {
                        let proxyHolder: EObject = null
                        if (eReference.isMany()) {
                            const value = eProxy.eGet(eReference)
                            const list = value as EList<EObject>
                            proxyHolder = list.get(0)
                        } else {
                            const value = eProxy.eGet(eReference)
                            proxyHolder = value as EObject
                        }

                        if (eOpposite.isMany()) {
                            const value = proxyHolder.eGetResolve(eOpposite, false)
                            const holderContents = value as EList<EObject>
                            const resolvedIndex = holderContents.indexOf(resolvedObject)
                            if (resolvedIndex != -1) {
                                const proxyIndex = holderContents.indexOf(eProxy)
                                holderContents.moveTo(resolvedIndex, proxyIndex)
                                if (proxyIndex > resolvedIndex) {
                                    holderContents.removeAt(proxyIndex - 1)
                                } else {
                                    holderContents.removeAt(proxyIndex + 1)
                                }
                                break
                            }
                        }

                        let replace = false
                        if (eReference.isMany()) {
                            const value = resolvedObject.eGet(eReference)
                            const list = value as EList<EObject>
                            replace = !list.contains(proxyHolder)
                        } else {
                            const value = resolvedObject.eGet(eReference)
                            const object = value as EObject
                            replace = object != proxyHolder
                        }

                        if (replace) {
                            if (eOpposite.isMany()) {
                                const value = proxyHolder.eGetResolve(eOpposite, false)
                                const list = value as EList<EObject>
                                const ndx = list.indexOf(eProxy)
                                list.set(ndx, resolvedObject)
                            } else {
                                proxyHolder.eSet(eOpposite, resolvedObject)
                            }
                        }
                        break
                    }
                }
            }
        }

        for (const reference of this._references) {
            const eObject = this.getEObject(reference.id)
            if (eObject) {
                this.setFeatureValue(reference.object, reference.feature, eObject, reference.pos)
            } else {
                this.decodeError("Unresolved reference '" + reference.id + "'")
            }
        }
    }

    protected handleAttributes(eObject: EObject) {
        if (this._attributes) {
            for (const i in this._attributes) {
                const attr = this._attributes[i]
                if (attr.local == this._idAttributeName) {
                    const idManager = this._resource.getObjectIDManager()
                    if (idManager) idManager.setID(eObject, attr.value)
                } else if (attr.local == XMLConstants.href) {
                    this.handleProxy(eObject, attr.value)
                } else if (attr.prefix != XMLConstants.xmlNS && this.isUserAttribute(attr)) {
                    this.setAttributeValue(eObject, attr)
                }
            }
        }
    }

    private isUserAttribute(attr: sax.QualifiedAttribute): boolean {
        for (const i in this._notFeatures) {
            const feature = this._notFeatures[i]
            if (feature.uri == attr.uri && feature.local == attr.local) {
                return false
            }
        }
        return true
    }

    private handleProxy(eProxy: EObject, id: string): void {
        const resourceURI = this._resource.getURI()
        if (!resourceURI) {
            return
        }

        let uri: URI = null
        try {
            uri = new URI(id)
        } catch {
            return
        }

        // resolve reference uri
        if (!uri.isAbsolute()) {
            uri = resourceURI.resolve(uri)
        }

        // set object proxy uri
        const eObjectInternal = eProxy as EObjectInternal
        eObjectInternal.eSetProxyURI(uri)

        if (resourceURI.equals(uri.trimFragment())) {
            this._sameDocumentProxies.push(eProxy)
        }
    }

    private setAttributeValue(eObject: EObject, attr: sax.QualifiedAttribute) {
        const eFeature = this.getFeature(eObject, attr.local)
        if (eFeature) {
            const kind = this.getLoadFeatureKind(eFeature)
            if (kind == LoadFeatureKind.Single || kind == LoadFeatureKind.Many) {
                this.setFeatureValue(eObject, eFeature, attr.value, -2)
            } else {
                this.setValueFromId(eObject, eFeature as EReference, attr.value)
            }
        } else {
            this.handleUnknownFeature(attr.local)
        }
    }

    private setFeatureValue(eObject: EObject, eFeature: EStructuralFeature, value: any, position: number) {
        const kind = this.getLoadFeatureKind(eFeature)
        switch (kind) {
            case LoadFeatureKind.Single: {
                const eDataType = eFeature.getEType() as EDataType
                if (value === null || value === undefined) {
                    eObject.eSet(eFeature, null)
                } else {
                    const eFactory = this.factoryFor(eFeature, eDataType)
                    if (eFactory) {
                        const literal = this.createFromString(eFactory, eDataType, value as string)
                        if (literal.ok) eObject.eSet(eFeature, literal.value)
                    }
                }
                break
            }
            case LoadFeatureKind.Many: {
                const eDataType = eFeature.getEType() as EDataType
                const eList = eObject.eGetResolve(eFeature, false) as EList<EObject>
                if (position != -2) {
                    if (value === null || value === undefined) {
                        appendLoaded(eList, null)
                    } else {
                        const eFactory = this.factoryFor(eFeature, eDataType)
                        if (eFactory) {
                            const literal = this.createFromString(eFactory, eDataType, value as string)
                            if (literal.ok) appendLoaded(eList, literal.value)
                        }
                    }
                }
                break
            }
            case LoadFeatureKind.ManyAdd:
            case LoadFeatureKind.ManyMove: {
                const eList = eObject.eGetResolve(eFeature, false) as EList<EObject>
                if (position == -1) {
                    appendLoaded(eList, value)
                } else if (position == -2) {
                    eList.clear()
                } else if (eObject == value) {
                    const index = eList.indexOf(value)
                    if (index == -1) {
                        eList.insert(position, value)
                    } else {
                        eList.moveTo(index, position)
                    }
                } else if (kind == LoadFeatureKind.ManyAdd) {
                    appendLoaded(eList, value)
                } else {
                    eList.move(position, value)
                }
                break
            }
            default: {
                eObject.eSet(eFeature, value)
            }
        }
    }

    private setValueFromId(eObject: EObject, eReference: EReference, ids: string) {
        let mustAdd = this._isResolveDeferred
        let mustAddOrNotOppositeIsMany = false
        let isFirstID = true
        let position = 0
        let qName = ""
        const tokens = ids.split(" ")
        const references: XMLReference[] = []
        for (let id of tokens) {
            const index = id.indexOf("#")
            if (index != -1) {
                if (index == 0) {
                    id = id.slice(1)
                } else {
                    const oldAttributes = this.setAttributes(null)
                    let eProxy: EObject
                    if (qName.length == 0) {
                        eProxy = this.createObjectFromFeatureType(eObject, eReference)
                    } else {
                        eProxy = this.createObjectFromTypeName(eObject, qName, eReference)
                    }
                    this.setAttributes(oldAttributes)
                    if (eProxy) {
                        this.handleProxy(eProxy, id)
                    }
                    this._objects.pop()
                    qName = ""
                    position++
                    continue
                }
            } else {
                const index = id.indexOf(":")
                if (index != -1) {
                    qName = id
                    continue
                }
            }

            if (!this._isResolveDeferred) {
                if (isFirstID) {
                    const eOpposite = eReference.getEOpposite()
                    if (eOpposite) {
                        mustAdd = eOpposite.isTransient() || eReference.isMany()
                        mustAddOrNotOppositeIsMany = mustAdd || !eOpposite.isMany()
                    } else {
                        mustAdd = true
                        mustAddOrNotOppositeIsMany = true
                    }
                    isFirstID = false
                }

                if (mustAddOrNotOppositeIsMany) {
                    const resolved = this.getEObject(id)
                    if (resolved) {
                        this.setFeatureValue(eObject, eReference, resolved, -1)
                        qName = ""
                        position++
                        continue
                    }
                }
            }

            if (mustAdd) {
                references.push({
                    object: eObject,
                    feature: eReference,
                    id: id,
                    pos: position
                } as XMLReference)
            }

            qName = ""
            position++
        }

        if (position == 0) {
            this.setFeatureValue(eObject, eReference, null, -2)
        } else {
            this._references.push(...references)
        }
    }

    private getFeature(eObject: EObject, name: string): EStructuralFeature {
        const eClass = eObject.eClass()
        const eFeature = eClass.getEStructuralFeatureFromName(name)
        if (!eFeature && this._extendedMetaData) {
            for (const eFeature of eClass.getEAllStructuralFeatures()) {
                if (name === this._extendedMetaData.getName(eFeature)) return eFeature
            }
        }
        return eFeature
    }

    private getType(ePackage: EPackage, local: string): EClassifier {
        return this._extendedMetaData ? this._extendedMetaData.getType(ePackage, local) : ePackage.getEClassifier(local)
    }

    private getLoadFeatureKind(eFeature: EStructuralFeature): LoadFeatureKind {
        const eClassifier = eFeature.getEType()
        if (eClassifier && isEDataType(eClassifier)) {
            return eFeature.isMany() ? LoadFeatureKind.Many : LoadFeatureKind.Single
        } else if (eFeature.isMany()) {
            const eReference = eFeature as EReference
            const eOpposite = eReference.getEOpposite()
            if (!eOpposite || eOpposite.isTransient() || !eOpposite.isMany()) {
                return LoadFeatureKind.ManyAdd
            }
            return LoadFeatureKind.ManyMove
        }
        return LoadFeatureKind.Other
    }

    // the factory that builds values of eDataType, or null once a load diagnostic
    // reports why: a data type contained by no package has no factory to reach
    private factoryFor(eFeature: EStructuralFeature, eDataType: EDataType): EFactory {
        const ePackage = eDataType.getEPackage()
        if (!ePackage) {
            this.decodeError("Data type " + eDataType.getName() + " of feature " + eFeature.getName() + " belongs to no package")
            return null
        }
        const eFactory = ePackage.getEFactoryInstance()
        if (!eFactory) {
            this.decodeError(
                "Package " + ePackage.getNsURI() + " has no factory to build " + eDataType.getName() + " for feature " + eFeature.getName()
            )
        }
        return eFactory
    }

    // diagnostic returns a diagnostic at the current position of the parser: the location of a
    // resource without uri is empty
    private diagnostic(message: string): EDiagnostic {
        return new EDiagnosticImpl(message, this._resource.getURI()?.toString() ?? "", this._parser.line, this._parser.column)
    }

    // createFromString creates the value of eDataType from str: a factory throws on an invalid
    // literal, which is reported and not set. A factory parsing numbers with Number reads the
    // infinities of XSD (INF, -INF) and Go (+Inf, -Inf) as NaN: they are read as infinities.
    private createFromString(eFactory: EFactory, eDataType: EDataType, str: string): { ok: boolean; value?: any } {
        try {
            const value = eFactory.createFromString(eDataType, str)
            if (typeof value === "number" && Number.isNaN(value) && /^[+-]?inf(inity)?$/i.test(str.trim())) {
                return { ok: true, value: str.trim().startsWith("-") ? -Infinity : Infinity }
            }
            return { ok: true, value: value }
        } catch (e) {
            this.decodeError(e instanceof Error ? e.message : String(e))
            return { ok: false }
        }
    }

    // setObjectID gives id to eObject, an object of the document (xmi:id): the references of the
    // document resolve it, and the object id manager of the resource, if any, registers it
    protected setObjectID(eObject: EObject, id: string) {
        if (!this._ids) this._ids = new Map<string, EObject>()
        this._ids.set(id, eObject)
        const idManager = this._resource.getObjectIDManager()
        if (idManager) {
            try {
                idManager.setID(eObject, id)
            } catch (e) {
                this.decodeError(e instanceof Error ? e.message : String(e))
            }
        }
    }

    // getEObject returns the object of the document with id or fragment: an id set by setObjectID,
    // else the object of the resource
    private getEObject(id: string): EObject {
        return this._ids?.get(id) ?? this._resource.getEObject(id)
    }

    protected decodeError(message: string) {
        this.error(this.diagnostic(message))
    }

    private handleUnknownFeature(name: string) {
        this.decodeError("Feature " + name + " not found")
    }

    private handleUnknownPackage(name: string, uri: string) {
        this.decodeError("Package {'" + name + "'='" + uri + "'} not found" + this.getLocationError(uri))
    }

    private handleUnknownURI(uri: string) {
        this.decodeError("URI " + uri + " not found" + this.getLocationError(uri))
    }

    private getLocationError(uri: string): string {
        const reason = this._locationErrors.get(uri)
        return reason ? " (schema location " + reason + ")" : ""
    }

    private error(diagnostic: EDiagnostic) {
        this._errorFn(diagnostic)
    }
}
