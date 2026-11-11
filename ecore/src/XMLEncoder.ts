// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { Err, Ok, Result } from "ts-results-es"
import {
    EClass,
    EClassifier,
    EDataType,
    EDiagnostic,
    EDiagnosticImpl,
    EEncoder,
    EFactory,
    EList,
    EMap,
    ENamedElement,
    EObject,
    EObjectInternal,
    EPackage,
    EResource,
    EStructuralFeature,
    ExtendedMetaData,
    getPackageRegistry,
    isEClass,
    isEDataType,
    isEObject,
    isEObjectInternal,
    isEReference,
    URI,
    XMLOptions
} from "./internal.js"
import { CODEC_TEXT_OPTION } from "./ECodec.js"
import { encodeXMLText, escapeXMLText } from "./XMLEncoding.js"
import { utf8Count, utf8Encode } from "./utils/UTF8.js"
import { XMLConstants } from "./XMLConstants.js"
import { XMLString } from "./XMLString.js"

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
    DataTypeAttributeMany
}

enum SaveResourceKind {
    Skip,
    Same,
    Cross
}

// convertToString is the lexical form of a data value: the one of its factory, but for the
// infinite and NaN numbers, written in the XSD lexical space of xsd:double and xsd:float (INF,
// -INF, NaN) instead of the JavaScript forms (Infinity, -Infinity). The decoder reads both.
function convertToString(eFactory: EFactory, eDataType: EDataType, value: any): string {
    if (typeof value === "number" && !Number.isFinite(value)) {
        return Number.isNaN(value) ? "NaN" : value > 0 ? "INF" : "-INF"
    }
    return eFactory.convertToString(eDataType, value)
}

function stringFormat(template: string, ...args: any[]) {
    return template.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != "undefined" ? args[number] : match
    })
}

// SchemaLocation is the location of the schema of a namespace, "" for a schema without namespace
interface SchemaLocation {
    namespace: string
    location: string
}

export class XMLEncoder implements EEncoder {
    protected _resource: EResource
    protected _str: XMLString = new XMLString()
    private _packages: Map<string, string> = new Map<string, string>()
    private _uriToPrefixes: Map<string, string[]> = new Map<string, string[]>()
    private _prefixesToURI: Map<string, string> = new Map<string, string>()
    private _featureKinds: Map<EStructuralFeature, number> = new Map<EStructuralFeature, number>()
    private _keepDefaults = false
    private _idAttributeName: string
    private _roots: EList<EObject>
    private _extendedMetaData: ExtendedMetaData
    private _useEncodedAttributeStyle = false
    private _xmlVersion: string
    private _encoding: string
    // the document type declaration written after the XML declaration, <!DOCTYPE TS>
    private _documentType = ""
    // the document is written as a text, in UTF-8 (CODEC_TEXT_OPTION)
    private _isText = false
    private _errorFn: (eDiagnostic: EDiagnostic) => void
    // the packages of the document by namespace, those of _packages
    private _ePackages: Map<string, EPackage> = new Map<string, EPackage>()
    // the schemas of the document, from the SCHEMA_LOCATION option or its document root: written as
    // xsi:schemaLocation, and xsi:noNamespaceSchemaLocation for the namespace ""
    private _schemaLocations: SchemaLocation[] = []
    // the SCHEMA_LOCATION option names the schemas: the document root is not read
    private _hasSchemaLocations = false
    // the SCHEMA_LOCATION option is true: the location of each package of the document is written
    private _declareSchemaLocation = false
    // the package of the top object: the package of the schema without namespace
    private _rootPackage: EPackage
    // set by a schema without namespace: the names of the packages that are not qualified
    // (ExtendedMetaData.isQualified) are written without namespace
    private _noNamespace = false

    constructor(resource: EResource, options: Map<string, any>) {
        this._resource = resource
        this._encoding = "UTF-8"
        this._xmlVersion = "1.0"
        if (options) {
            this._idAttributeName = options.get(XMLOptions.ID_ATTRIBUTE_NAME)
            this._roots = options.get(XMLOptions.ROOT_OBJECTS)
            this._extendedMetaData = options.get(XMLOptions.EXTENDED_META_DATA)
            this._useEncodedAttributeStyle = options.get(XMLOptions.USE_ENCODED_ATTRIBUTE_STYLE) === true
            this._keepDefaults = options.get(XMLOptions.KEEP_DEFAULTS) === true
            this._isText = options.get(CODEC_TEXT_OPTION) === true
            const encoding = options.get(XMLOptions.ENCODING)
            if (typeof encoding === "string" && encoding != "") {
                this._encoding = encoding
            }
            const lineWidth = options.get(XMLOptions.LINE_WIDTH)
            if (typeof lineWidth === "number" && lineWidth > 0) {
                this._str.lineWidth = lineWidth
            }
            const schemaLocations = options.get(XMLOptions.SCHEMA_LOCATION)
            if (typeof schemaLocations === "boolean") {
                this._declareSchemaLocation = schemaLocations
            } else if (typeof schemaLocations === "object" && schemaLocations !== null) {
                const entries: [string, string][] =
                    schemaLocations instanceof Map ? [...schemaLocations.entries()] : Object.entries(schemaLocations)
                this._hasSchemaLocations = true
                this._schemaLocations = entries
                    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
                    .map(([namespace, location]) => ({ namespace, location }))
            }
        }
        if (!this._extendedMetaData) {
            this._extendedMetaData = new ExtendedMetaData()
        }
    }

    // setExtendedMetaData sets the ExtendedMetaData of the names and kinds of the features, none (null)
    // saving them under their own names
    setExtendedMetaData(extendedMetaData: ExtendedMetaData): void {
        this._extendedMetaData = extendedMetaData
    }

    setXMLVersion(xmlVersion: string): void {
        this._xmlVersion = xmlVersion
    }

    getXMLVersion(): string {
        return this._xmlVersion
    }

    // setEncoding sets the encoding the document is written in, an IANA name or a WHATWG label, UTF-8
    // by default, as the ENCODING option does
    setEncoding(encoding: string): void {
        this._encoding = encoding
    }

    getEncoding(): string {
        return this._encoding
    }

    // setDocumentType sets the document type declaration written after the XML declaration,
    // <!DOCTYPE TS>, none by default
    setDocumentType(documentType: string): void {
        this._documentType = documentType
    }

    getDocumentType(): string {
        return this._documentType
    }

    // toBytes returns the bytes of the document in its encoding, a character the encoding cannot
    // represent as a character reference; null for an encoding it cannot write, reported as an error
    private toBytes(): Uint8Array {
        const r = this._str.toString()
        let bytes: Uint8Array
        if (this._isText) {
            const text = escapeXMLText(r, this._encoding)
            if (text !== null) {
                bytes = new Uint8Array(utf8Count(text))
                utf8Encode(text, bytes, 0)
            }
        } else {
            bytes = encodeXMLText(r, this._encoding)
        }
        if (!bytes) {
            this.error(new EDiagnosticImpl(`unsupported encoding "${this._encoding}"`, this._resource?.getURI()?.toString() ?? "", 0, 0))
        }
        return bytes
    }

    encode(eResource: EResource): Result<Uint8Array, Error> {
        this._errorFn = (diagnostic: EDiagnostic) => {
            this._resource.getErrors().add(diagnostic)
        }
        let contents = this._roots
        if (!contents) {
            contents = this._resource.eContents()
        }
        if (contents.isEmpty()) {
            return Ok(new Uint8Array())
        }
        // the errors the resource already has, as the ones of its loading, are not the ones of this encoding
        const errors = this._resource.getErrors()
        const errorCount = errors.size()
        this.encodeTopObject(contents.get(0))
        const bytes = errors.size() == errorCount ? this.toBytes() : null

        if (errors.size() == errorCount) {
            return Ok(bytes)
        } else {
            return Err(errors.get(errorCount))
        }
    }

    encodeObject(eObject: EObject): Result<Uint8Array, Error> {
        let error: Error
        this._errorFn = (diagnostic: EDiagnostic) => {
            if (!error) {
                error = diagnostic
            }
        }
        this.encodeTopObject(eObject)
        const bytes = error ? null : this.toBytes()
        if (error) {
            return Err(error)
        } else {
            return Ok(bytes)
        }
    }

    async encodeAsync(eResource: EResource, stream: WritableStream): Promise<Uint8Array> {
        const r = this.encode(eResource)
        if (r.isOk()) {
            const writer = stream.getWriter()
            try {
                await writer.write(r.value)
            } finally {
                writer.releaseLock()
            }
            return r.value
        } else {
            return Promise.reject(r.error)
        }
    }

    async encodeObjectAsync(eObject: EObject, stream: WritableStream): Promise<Uint8Array> {
        const r = this.encodeObject(eObject)
        if (r.isOk()) {
            const writer = stream.getWriter()
            try {
                await writer.write(r.value)
            } finally {
                writer.releaseLock()
            }
            return r.value
        } else {
            return Promise.reject(r.error)
        }
    }

    private encodeTopObject(eObject: EObject) {
        // header
        this.saveHeader()
        this._rootPackage = eObject.eClass().getEPackage()

        // initialize prefixes if any in top
        if (this._extendedMetaData) {
            const eClass = eObject.eClass()
            // read only when set: reading the map builds it on the object. The option names the
            // schemas instead.
            const eSchemaLocationFeature = this._extendedMetaData.getXSISchemaLocationMapFeature(eClass)
            if (eSchemaLocationFeature && !this._hasSchemaLocations && eObject.eIsSet(eSchemaLocationFeature)) {
                for (const entry of eObject.eGet(eSchemaLocationFeature) as EMap<string, string>) {
                    this._schemaLocations.push({ namespace: entry.getKey() ?? "", location: entry.getValue() ?? "" })
                }
            }
            this._noNamespace = this._schemaLocations.some((l) => l.namespace == "")
            // after the schemas: the namespace of a package written without namespace is not declared
            const ePrefixMapFeature = this._extendedMetaData.getXMLNSPrefixMapFeature(eClass)
            if (ePrefixMapFeature) {
                const m = eObject.eGet(ePrefixMapFeature) as EMap<string, string>
                this.setPrefixToNamespace(m)
            }
        }

        // object
        this.saveTopObject(eObject)

        // namespaces
        this._str.resetToFirstElementMark()
        this.saveNamespaces()
    }

    private saveHeader() {
        this._str.add(stringFormat('<?xml version="{0}" encoding="{1}"?>', this._xmlVersion, this._encoding))
        this._str.addLine()
        if (this._documentType != "") {
            this._str.add(this._documentType)
            this._str.addLine()
        }
    }

    private saveTopObject(eObject: EObject) {
        const eClass = eObject.eClass()
        if (!this._extendedMetaData || this._extendedMetaData.getDocumentRoot(eClass.getEPackage()) != eClass) {
            const rootFeature = this.getRootFeature(eClass)
            const name = rootFeature ? this.getFeatureQName(rootFeature) : this.getClassQName(eClass)
            this._str.startElement(name)
        } else {
            this._str.startElement("")
        }
        this.saveElementID(eObject)
        this.saveFeatures(eObject, false)
    }

    private getRootFeature(eClassifier: EClassifier): EStructuralFeature {
        if (this._extendedMetaData) {
            // the classifiers searched already: the first super types may lead to a cycle, in an
            // invalid model
            const searched = new Set<EClassifier>()
            while (eClassifier && !searched.has(eClassifier)) {
                searched.add(eClassifier)
                const eClass = this._extendedMetaData.getDocumentRoot(eClassifier.getEPackage())
                if (eClass) {
                    for (const eFeature of eClass.getEStructuralFeatures()) {
                        if (eFeature.getEType() == eClassifier && eFeature.isChangeable()) return eFeature
                    }
                }
                if (isEClass(eClassifier)) {
                    const eSuperTypes = eClassifier.getESuperTypes()
                    if (eSuperTypes.isEmpty()) eClassifier = null
                    else eClassifier = eSuperTypes.get(0)
                } else {
                    eClassifier = null
                }
            }
        }
        return null
    }

    protected saveElementID(eObject: EObject) {
        if (this._idAttributeName && this._resource.getObjectIDManager()) {
            const id = this._resource.getObjectIDManager().getID(eObject)
            if (id !== undefined && id !== null) {
                this._str.addAttribute(this._idAttributeName, String(id))
            }
        }
    }

    private saveFeatures(eObject: EObject, attributesOnly: boolean): boolean {
        const eAllFeatures = eObject.eClass().getEAllStructuralFeatures()
        let elementFeatures: number[]
        let elementCount = 0

        LOOP: for (let i = 0; i < eAllFeatures.size(); i++) {
            const eFeature = eAllFeatures.get(i)
            let kind = this._featureKinds.get(eFeature)
            if (kind === undefined) {
                kind = this.getSaveFeatureKind(eFeature)
                this._featureKinds.set(eFeature, kind)
            }

            if (kind != SaveFeatureKind.Transient && this.shouldSaveFeature(eObject, eFeature)) {
                switch (kind) {
                    case SaveFeatureKind.DataTypeSingle: {
                        this.saveDataTypeSingle(eObject, eFeature)
                        continue LOOP
                    }
                    case SaveFeatureKind.ObjectAttributeSingle: {
                        // an attribute reference: a full href across resources, an IDREF otherwise
                        switch (this.getSaveResourceKindSingle(eObject, eFeature)) {
                            case SaveResourceKind.Cross:
                                this.saveEObjectSingle(eObject, eFeature, false)
                                break
                            case SaveResourceKind.Same:
                                this.saveIDRefSingle(eObject, eFeature)
                                break
                        }
                        continue LOOP
                    }
                    case SaveFeatureKind.ObjectAttributeMany: {
                        switch (this.getSaveResourceKindMany(eObject, eFeature)) {
                            case SaveResourceKind.Cross:
                                this.saveEObjectMany(eObject, eFeature, false)
                                break
                            case SaveResourceKind.Same:
                                this.saveIDRefMany(eObject, eFeature)
                                break
                        }
                        continue LOOP
                    }

                    case SaveFeatureKind.DataTypeSingleNillable: {
                        if (!this.isNil(eObject, eFeature)) {
                            this.saveDataTypeSingle(eObject, eFeature)
                            continue LOOP
                        }
                        break
                    }
                    case SaveFeatureKind.ObjectContainManyUnsettable:
                    case SaveFeatureKind.DataTypeMany: {
                        if (this.isEmpty(eObject, eFeature)) {
                            this.saveManyEmpty(eObject, eFeature)
                            continue LOOP
                        }
                        break
                    }
                    case SaveFeatureKind.ObjectContainSingleUnsettable:
                    case SaveFeatureKind.ObjectContainSingle:
                    case SaveFeatureKind.ObjectContainMany:
                    case SaveFeatureKind.DataTypeContentSingle:
                    case SaveFeatureKind.DataTypeElementSingle: {
                        break
                    }
                    case SaveFeatureKind.ObjectHREFSingleUnsettable: {
                        if (!this.isNil(eObject, eFeature)) {
                            switch (this.getSaveResourceKindSingle(eObject, eFeature)) {
                                case SaveResourceKind.Cross: {
                                    if (this._useEncodedAttributeStyle) {
                                        this.saveEObjectSingle(eObject, eFeature, true)
                                        continue LOOP
                                    }
                                    break
                                }
                                case SaveResourceKind.Same: {
                                    this.saveIDRefSingle(eObject, eFeature)
                                    continue LOOP
                                }
                                default:
                                    continue LOOP
                            }
                        }
                        break
                    }
                    case SaveFeatureKind.ObjectHREFSingle: {
                        switch (this.getSaveResourceKindSingle(eObject, eFeature)) {
                            case SaveResourceKind.Cross: {
                                if (this._useEncodedAttributeStyle) {
                                    this.saveEObjectSingle(eObject, eFeature, true)
                                    continue LOOP
                                }
                                break
                            }
                            case SaveResourceKind.Same: {
                                this.saveIDRefSingle(eObject, eFeature)
                                continue LOOP
                            }
                            default:
                                continue LOOP
                        }
                        break
                    }
                    case SaveFeatureKind.ObjectHREFManyUnsettable: {
                        if (this.isEmpty(eObject, eFeature)) {
                            this.saveManyEmpty(eObject, eFeature)
                            continue LOOP
                        } else {
                            switch (this.getSaveResourceKindMany(eObject, eFeature)) {
                                case SaveResourceKind.Cross: {
                                    if (this._useEncodedAttributeStyle) {
                                        this.saveEObjectMany(eObject, eFeature, true)
                                        continue LOOP
                                    }
                                    break
                                }
                                case SaveResourceKind.Same: {
                                    this.saveIDRefMany(eObject, eFeature)
                                    continue LOOP
                                }
                                default:
                                    continue LOOP
                            }
                        }
                        break
                    }
                    case SaveFeatureKind.ObjectHREFMany: {
                        switch (this.getSaveResourceKindMany(eObject, eFeature)) {
                            case SaveResourceKind.Cross: {
                                if (this._useEncodedAttributeStyle) {
                                    this.saveEObjectMany(eObject, eFeature, true)
                                    continue LOOP
                                }
                                break
                            }
                            case SaveResourceKind.Same: {
                                this.saveIDRefMany(eObject, eFeature)
                                continue LOOP
                            }
                            default:
                                continue LOOP
                        }
                        break
                    }
                    default:
                        continue LOOP
                }
                if (attributesOnly) {
                    continue LOOP
                }
                if (!elementFeatures) {
                    elementFeatures = new Array<number>(eAllFeatures.size())
                }
                elementFeatures[elementCount] = i
                elementCount++
            }
        }
        if (!elementFeatures) {
            this._str.endEmptyElement()
            return false
        }
        for (let i = 0; i < elementCount; i++) {
            const eFeature = eAllFeatures.get(elementFeatures[i])
            const kind = this._featureKinds.get(eFeature)
            switch (kind) {
                case SaveFeatureKind.DataTypeSingleNillable: {
                    this.saveNil(eObject, eFeature)
                    break
                }
                case SaveFeatureKind.DataTypeMany: {
                    this.saveDataTypeMany(eObject, eFeature)
                    break
                }
                case SaveFeatureKind.ObjectContainSingleUnsettable: {
                    if (this.isNil(eObject, eFeature)) {
                        this.saveNil(eObject, eFeature)
                    } else {
                        this.saveContainedSingle(eObject, eFeature)
                    }
                    break
                }
                case SaveFeatureKind.ObjectContainSingle: {
                    this.saveContainedSingle(eObject, eFeature)
                    break
                }
                case SaveFeatureKind.DataTypeContentSingle: {
                    this.saveDataTypeContent(eObject, eFeature)
                    break
                }
                case SaveFeatureKind.DataTypeElementSingle: {
                    this.saveDataTypeElementSingle(eObject, eFeature)
                    break
                }
                case SaveFeatureKind.ObjectContainManyUnsettable:
                case SaveFeatureKind.ObjectContainMany: {
                    this.saveContainedMany(eObject, eFeature)
                    break
                }
                case SaveFeatureKind.ObjectHREFSingleUnsettable: {
                    if (this.isNil(eObject, eFeature)) {
                        this.saveNil(eObject, eFeature)
                    } else {
                        this.saveHRefSingle(eObject, eFeature)
                    }
                    break
                }
                case SaveFeatureKind.ObjectHREFSingle: {
                    this.saveHRefSingle(eObject, eFeature)
                    break
                }
                case SaveFeatureKind.ObjectHREFManyUnsettable:
                case SaveFeatureKind.ObjectHREFMany: {
                    this.saveHRefMany(eObject, eFeature)
                    break
                }
            }
        }

        this._str.endElement()
        return true
    }

    protected saveNamespaces() {
        const prefixes: string[] = [...this._prefixesToURI.keys()].sort()
        for (const prefix of prefixes) {
            let attribute = "xmlns"
            if (prefix.length > 0) attribute += ":" + prefix
            this._str.addAttribute(attribute, this._prefixesToURI.get(prefix))
        }
        // the schemas of the document, as EMF writes them: the schema without namespace as
        // xsi:noNamespaceSchemaLocation. A schema without namespace and without location writes none,
        // and only makes the document a document without namespace.
        if (this._declareSchemaLocation) {
            this.addPackageSchemaLocations()
        }
        const pairs: string[] = []
        let noNamespaceLocation = ""
        for (const l of this._schemaLocations) {
            if (l.namespace == "") {
                noNamespaceLocation = l.location
            } else {
                pairs.push(l.namespace, l.location)
            }
        }
        if ((pairs.length > 0 || noNamespaceLocation != "") && !this._prefixesToURI.has(XMLConstants.xsiNS)) {
            this._str.addAttribute("xmlns:" + XMLConstants.xsiNS, XMLConstants.xsiURI)
        }
        if (pairs.length > 0) {
            this._str.addAttribute(XMLConstants.xsiNS + ":" + XMLConstants.schemaLocationAttrib, pairs.join(" "))
        }
        if (noNamespaceLocation != "") {
            this._str.addAttribute(XMLConstants.xsiNS + ":" + XMLConstants.noNamespaceSchemaLocationAttrib, noNamespaceLocation)
        }
    }

    // addPackageSchemaLocations adds the location of each package of the document, for the
    // SCHEMA_LOCATION option true, as EMF does: the uri of the resource of the package, relative to
    // the resource saved, its fragment kept unless it is the root. A package without resource, or
    // registered at its namespace, as a generated package is, has none. The schemas the document names
    // already are kept, and those named without location are given one. A package written without
    // namespace is the schema without namespace when it is the package of the top object.
    private addPackageSchemaLocations() {
        const known = new Map<string, number>()
        this._schemaLocations.forEach((l, i) => known.set(l.namespace, i))
        const ePackages = [...this._ePackages.values()].sort((a, b) =>
            a.getNsURI() < b.getNsURI() ? -1 : a.getNsURI() > b.getNsURI() ? 1 : 0
        )
        for (const ePackage of ePackages) {
            let namespace = ePackage.getNsURI()
            if (this.isUnqualified(ePackage)) {
                if (ePackage != this._rootPackage) {
                    continue
                }
                namespace = ""
            }
            const i = known.get(namespace)
            if (i !== undefined && this._schemaLocations[i].location != "") {
                continue
            }
            const eResource = ePackage.eResource()
            if (!eResource || !eResource.getURI()) {
                continue
            }
            let location = eResource.getURI()
            if (eResource.getURIFragment(ePackage) != "/") {
                location = this.getResourceHRef(eResource, ePackage)
            }
            if (location.toString() == ePackage.getNsURI()) {
                continue
            }
            if (this._resource?.getURI()) {
                location = this._resource.getURI().relativize(location)
            }
            if (i !== undefined) {
                this._schemaLocations[i].location = location.toString()
            } else {
                known.set(namespace, this._schemaLocations.length)
                this._schemaLocations.push({ namespace, location: location.toString() })
            }
        }
    }

    private saveDataTypeSingle(eObject: EObject, eFeature: EStructuralFeature) {
        const val = eObject.eGetResolve(eFeature, false)
        const str = this.getDataType(val, eFeature, true)
        if (str !== undefined && str !== null) {
            this._str.addAttribute(this.getFeatureQName(eFeature), str)
        }
    }

    // saveDataTypeElementSingle saves a kind="element" single attribute as a child element
    private saveDataTypeElementSingle(eObject: EObject, eFeature: EStructuralFeature) {
        const val = eObject.eGetResolve(eFeature, false)
        const str = this.getDataType(val, eFeature, false)
        if (str !== undefined && str !== null) {
            this._str.addContent(this.getFeatureQName(eFeature), str)
        }
    }

    // saveDataTypeContent saves a kind="simple" attribute as the text of the element
    private saveDataTypeContent(eObject: EObject, eFeature: EStructuralFeature) {
        const val = eObject.eGetResolve(eFeature, false)
        const str = this.getDataType(val, eFeature, false)
        if (str !== undefined && str !== null) {
            this._str.addContentValue(str)
        }
    }

    private saveDataTypeMany(eObject: EObject, eFeature: EStructuralFeature) {
        const l = eObject.eGetResolve(eFeature, false) as EList<EObject>
        const d = eFeature.getEType() as EDataType
        const p = d.getEPackage()
        const f = p.getEFactoryInstance()
        const name = this.getFeatureQName(eFeature)
        for (const value of l) {
            if (value == null) {
                this._str.startElement(name)
                this._str.addAttribute("xsi:nil", "true")
                this._str.endEmptyElement()
                this._uriToPrefixes.set(XMLConstants.xsiURI, [XMLConstants.xsiNS])
                this._prefixesToURI.set(XMLConstants.xsiNS, XMLConstants.xsiURI)
            } else {
                const str = convertToString(f, d, value)
                this._str.addContent(name, str)
            }
        }
    }

    private saveManyEmpty(eObject: EObject, eFeature: EStructuralFeature) {
        this._str.addAttribute(this.getFeatureQName(eFeature), "")
    }

    // saveEObjectSingle saves a reference as an attribute holding its href, prefixed with the class of
    // the object in the encoded attribute style
    private saveEObjectSingle(eObject: EObject, eFeature: EStructuralFeature, encoded: boolean) {
        const value = eObject.eGetResolve(eFeature, false)
        if (value && isEObject(value)) {
            const id = encoded ? this.getEncodedHRef(value, eFeature) : this.getHRef(value)
            if (id != "") {
                this._str.addAttribute(this.getFeatureQName(eFeature), id)
            }
        }
    }

    private saveEObjectMany(eObject: EObject, eFeature: EStructuralFeature, encoded: boolean) {
        const l = eObject.eGetResolve(eFeature, false) as EList<EObject>
        let failure = false
        let first = true
        let buffer = ""
        for (const value of l) {
            if (value) {
                const id = encoded ? this.getEncodedHRef(value, eFeature) : this.getHRef(value)
                if (id == "") {
                    failure = true
                } else {
                    if (!first) {
                        buffer += " "
                    }
                    buffer += id
                    first = false
                }
            }
        }
        if (!failure && buffer.length > 0) {
            this._str.addAttribute(this.getFeatureQName(eFeature), buffer)
        }
    }

    // getEncodedHRef is the href of eObject in the encoded attribute style: prefixed with the
    // qualified name of its class when the type of eFeature does not tell it, as the type attribute
    // of an href element would be.
    private getEncodedHRef(eObject: EObject, eFeature: EStructuralFeature): string {
        const href = this.getHRef(eObject)
        if (href != "") {
            const eClass = eObject.eClass()
            const eType = eFeature.getEType()
            if (eType && isEClass(eType) && eType != eClass && eType.isAbstract()) {
                return this.getClassQName(eClass) + " " + href
            }
        }
        return href
    }

    private saveNil(eObject: EObject, eFeature: EStructuralFeature) {
        this._str.addNil(this.getFeatureQName(eFeature))
    }

    private saveContainedSingle(eObject: EObject, eFeature: EStructuralFeature) {
        const value = eObject.eGetResolve(eFeature, false)
        if (value && isEObjectInternal(value)) {
            this.saveEObjectInternal(value, eFeature)
        }
    }

    private saveContainedMany(eObject: EObject, eFeature: EStructuralFeature) {
        const l = eObject.eGetResolve(eFeature, false) as EList<EObject>
        for (const o of l) {
            if (isEObjectInternal(o)) {
                this.saveEObjectInternal(o, eFeature)
            }
        }
    }

    private saveEObjectInternal(o: EObjectInternal, f: EStructuralFeature) {
        if (o.eInternalResource() || o.eIsProxy()) {
            this.saveHRef(o, f)
        } else {
            this.saveEObject(o, f)
        }
    }

    private saveEObject(o: EObject, f: EStructuralFeature) {
        this._str.startElement(this.getFeatureQName(f))
        const eClass = o.eClass()
        const eType = f.getEType()
        if (eType != eClass) {
            this.saveTypeAttribute(eClass)
        }
        this.saveElementID(o)
        this.saveFeatures(o, false)
    }

    private saveTypeAttribute(eClass: EClass) {
        this._str.addAttribute("xsi:type", this.getClassQName(eClass))
        this._uriToPrefixes.set(XMLConstants.xsiURI, [XMLConstants.xsiNS])
        this._prefixesToURI.set(XMLConstants.xsiNS, XMLConstants.xsiURI)
    }

    private saveHRefSingle(eObject: EObject, eFeature: EStructuralFeature) {
        const value = eObject.eGetResolve(eFeature, false)
        if (value && isEObject(value)) {
            this.saveHRef(value, eFeature)
        }
    }

    private saveHRefMany(eObject: EObject, eFeature: EStructuralFeature) {
        const l = eObject.eGetResolve(eFeature, false) as EList<EObject>
        for (const value of l) {
            this.saveHRef(value, eFeature)
        }
    }

    private saveHRef(eObject: EObject, eFeature: EStructuralFeature) {
        const href = this.getHRef(eObject)
        if (href != "") {
            this._str.startElement(this.getFeatureQName(eFeature))
            const eClass = eObject.eClass()
            const eType = eFeature.getEType()
            if (eType && isEClass(eType) && eType != eClass && eType.isAbstract()) {
                this.saveTypeAttribute(eClass)
            }
            this._str.addAttribute("href", href)
            this._str.endEmptyElement()
        }
    }

    private saveIDRefSingle(eObject: EObject, eFeature: EStructuralFeature) {
        const value = eObject.eGetResolve(eFeature, false)
        if (value && isEObject(value)) {
            const id = this.getIDRef(value)
            if (id != "") {
                this._str.addAttribute(this.getFeatureQName(eFeature), id)
            }
        }
    }

    private saveIDRefMany(eObject: EObject, eFeature: EStructuralFeature) {
        const l = eObject.eGetResolve(eFeature, false) as EList<EObject>
        let failure = false
        let buffer = ""
        let first = true
        for (const value of l) {
            if (value) {
                const id = this.getIDRef(value)
                if (id == "") {
                    failure = true
                } else {
                    if (!first) {
                        buffer += " "
                    }
                    buffer += id
                    first = false
                }
            }
        }
        if (!failure && buffer.length > 0) {
            this._str.addAttribute(this.getFeatureQName(eFeature), buffer)
        }
    }

    private getSaveResourceKindSingle(eObject: EObject, eFeature: EStructuralFeature): SaveResourceKind {
        const value = eObject.eGetResolve(eFeature, false) as EObjectInternal
        if (!value) {
            return SaveResourceKind.Skip
        } else if (value.eIsProxy()) {
            return SaveResourceKind.Cross
        } else {
            const resource = value.eResource()
            if (resource == this._resource || !resource) {
                return SaveResourceKind.Same
            }
            return SaveResourceKind.Cross
        }
    }

    private getSaveResourceKindMany(eObject: EObject, eFeature: EStructuralFeature): SaveResourceKind {
        const list = eObject.eGetResolve(eFeature, false) as EList<EObject>
        if (!list || list.isEmpty()) {
            return SaveResourceKind.Skip
        }
        for (const e of list) {
            const o = e as EObjectInternal
            if (!o) {
                return SaveResourceKind.Skip
            } else if (o.eIsProxy()) {
                return SaveResourceKind.Cross
            } else {
                const resource = o.eResource()
                if (resource && resource != this._resource) {
                    return SaveResourceKind.Cross
                }
            }
        }
        return SaveResourceKind.Same
    }

    private getDataType(value: any, feature: EStructuralFeature, isAttribute: boolean): string | null {
        if (value == null) {
            return null
        } else {
            const d = feature.getEType() as EDataType
            const p = d.getEPackage()
            const f = p.getEFactoryInstance()
            const s = convertToString(f, d, value)
            return s
        }
    }

    private getHRef(eObject: EObject): string {
        if (isEObjectInternal(eObject)) {
            let uri = eObject.eProxyURI()
            if (!uri) {
                const eResource = eObject.eResource()
                if (eResource) {
                    uri = this.getResourceHRef(eResource, eObject)
                } else {
                    // an object in no resource has an href only by the id the id manager gave it
                    const idManager = this._resource?.getObjectIDManager()
                    const id = idManager?.getID(eObject)
                    if (id !== undefined && id !== null) {
                        uri = this.getResourceHRef(this._resource, eObject)
                    } else {
                        this.handleDanglingHREF(eObject)
                        return ""
                    }
                }
            }
            uri = this._resource.getURI().relativize(uri)
            return uri.toString()
        }
        return ""
    }

    private handleDanglingHREF(eObject: EObject) {
        this.error(new EDiagnosticImpl("Object is not contained in a resource.", this._resource.getURI()?.toString() ?? "", 0, 0))
    }

    private error(d: EDiagnostic) {
        this._errorFn(d)
    }

    private getResourceHRef(resource: EResource, object: EObject): URI {
        const uri = resource.getURI()
        return new URI({
            scheme: uri.scheme,
            user: uri.user,
            host: uri.host,
            port: uri.port,
            path: uri.path,
            query: uri.query,
            fragment: resource.getURIFragment(object)
        })
    }

    private getIDRef(eObject: EObject): string {
        return this._resource ? "#" + this._resource.getURIFragment(eObject) : ""
    }

    private getClassQName(eClass: EClass): string {
        return this.getElementQName(eClass.getEPackage(), this.getXmlName(eClass), false)
    }

    private getFeatureQName(eFeature: EStructuralFeature): string {
        if (this._extendedMetaData) {
            const name = this._extendedMetaData.getName(eFeature)
            const namespace = this._extendedMetaData.getNamespace(eFeature)
            if (namespace == "") {
                // a feature without namespace, as an attribute is by default, is not qualified, even
                // when a package is registered for documents without namespace
                return name
            }
            const ePackage = this.getPackageForSpace(namespace)
            if (ePackage) {
                return this.getElementQName(ePackage, name, false)
            } else {
                return name
            }
        } else {
            return eFeature.getName()
        }
    }

    private getElementQName(ePackage: EPackage, name: string, mustHavePrefix: boolean): string {
        const nsPrefix = this.getPrefix(ePackage, mustHavePrefix)
        if (nsPrefix == "") {
            return name
        } else if (name.length == 0) {
            return nsPrefix
        } else {
            return nsPrefix + ":" + name
        }
    }

    private getXmlName(eElement: ENamedElement): string {
        if (this._extendedMetaData) {
            return this._extendedMetaData.getName(eElement)
        }
        return eElement.getName()
    }

    private getPrefix(ePackage: EPackage, mustHavePrefix: boolean): string {
        let nsPrefix = this._packages.get(ePackage.getNsURI())
        if (nsPrefix === undefined) {
            this._ePackages.set(ePackage.getNsURI(), ePackage)
            if (this.isUnqualified(ePackage)) {
                this._packages.set(ePackage.getNsURI(), "")
                return ""
            }
            let found = false
            const prefixes = this._uriToPrefixes.get(ePackage.getNsURI())
            if (prefixes) {
                for (const prefix of prefixes) {
                    nsPrefix = prefix
                    if (!mustHavePrefix || nsPrefix.length > 0) {
                        found = true
                        break
                    }
                }
            }
            if (!found) {
                nsPrefix = ePackage.getNsPrefix()
                if (nsPrefix.length == 0 && mustHavePrefix) {
                    nsPrefix = "_"
                }

                if (this._prefixesToURI.has(nsPrefix)) {
                    const currentValue = this._prefixesToURI.get(nsPrefix)
                    if (currentValue ? currentValue != ePackage.getNsURI() : ePackage.getNsURI()) {
                        let index = 1
                        while (this._prefixesToURI.has(nsPrefix + "_" + index.toString())) {
                            index++
                        }
                        nsPrefix += "_" + index.toString()
                    }
                }
                this._prefixesToURI.set(nsPrefix, ePackage.getNsURI())
            }
            this._packages.set(ePackage.getNsURI(), nsPrefix)
        }
        return nsPrefix
    }

    // isUnqualified returns whether the names of a package are written without namespace: in a
    // document without namespace, those of a package that is not qualified
    private isUnqualified(ePackage: EPackage): boolean {
        return this._noNamespace && this._extendedMetaData != null && !this._extendedMetaData.isQualified(ePackage)
    }

    private setPrefixToNamespace(prefixToNamespaceMap: EMap<string, string>) {
        for (const mapEntry of prefixToNamespaceMap) {
            const prefix = mapEntry.getKey()
            const nsURI = mapEntry.getValue()
            const ePackage = this.getPackageForSpace(nsURI)
            if (ePackage && this.isUnqualified(ePackage)) {
                continue
            }
            if (ePackage) {
                this._packages.set(ePackage.getNsURI(), prefix)
                this._ePackages.set(ePackage.getNsURI(), ePackage)
            }
            this._prefixesToURI.set(prefix, nsURI)
            if (this._uriToPrefixes.has(nsURI)) {
                const prefixes = this._uriToPrefixes.get(nsURI)
                prefixes.push(prefix)
                this._uriToPrefixes.set(nsURI, prefixes)
            } else {
                this._uriToPrefixes.set(nsURI, [prefix])
            }
        }
    }

    private getPackageForSpace(nsURI: string): EPackage {
        let packageRegistry = getPackageRegistry()
        if (this._resource.eResourceSet()) {
            packageRegistry = this._resource.eResourceSet().getPackageRegistry()
        }
        return packageRegistry.getPackage(nsURI)
    }

    private shouldSaveFeature(o: EObject, f: EStructuralFeature): boolean {
        return o.eIsSet(f) || (this._keepDefaults && f.getDefaultValueLiteral() != "")
    }

    private isNil(eObject: EObject, eFeature: EStructuralFeature): boolean {
        return eObject.eGetResolve(eFeature, false) == null
    }

    private isEmpty(eObject: EObject, eFeature: EStructuralFeature): boolean {
        return (eObject.eGetResolve(eFeature, false) as EList<EObject>).isEmpty()
    }

    private getSaveFeatureKind(f: EStructuralFeature): SaveFeatureKind {
        if (f.isTransient()) {
            return SaveFeatureKind.Transient
        }

        if (isEReference(f)) {
            if (f.isContainment()) {
                if (f.isMany()) {
                    if (f.isUnsettable()) {
                        return SaveFeatureKind.ObjectContainManyUnsettable
                    } else {
                        return SaveFeatureKind.ObjectContainMany
                    }
                } else {
                    if (f.isUnsettable()) {
                        return SaveFeatureKind.ObjectContainSingleUnsettable
                    } else {
                        return SaveFeatureKind.ObjectContainSingle
                    }
                }
            }
            if (f.getEOpposite()?.isContainment()) {
                return SaveFeatureKind.Transient
            }
            // a kind="attribute" reference is an attribute, as the decoder reads it
            if (this._extendedMetaData?.getFeatureKind(f) === "attribute") {
                return f.isMany() ? SaveFeatureKind.ObjectAttributeMany : SaveFeatureKind.ObjectAttributeSingle
            }
            if (f.isMany()) {
                if (f.isUnsettable()) {
                    return SaveFeatureKind.ObjectHREFManyUnsettable
                } else {
                    return SaveFeatureKind.ObjectHREFMany
                }
            } else {
                if (f.isUnsettable()) {
                    return SaveFeatureKind.ObjectHREFSingleUnsettable
                } else {
                    return SaveFeatureKind.ObjectHREFSingle
                }
            }
        } else {
            // Attribute
            const eType = f.getEType()
            if (isEDataType(eType))
                if (!eType.isSerializable()) {
                    return SaveFeatureKind.Transient
                }
            if (!f.isMany()) {
                // a kind="simple" attribute is the text of the element, a kind="element" one a child
                // element, as the decoder reads them
                const featureKind = this._extendedMetaData?.getFeatureKind(f)
                if (featureKind === "simple") {
                    return SaveFeatureKind.DataTypeContentSingle
                }
                if (featureKind === "element") {
                    return SaveFeatureKind.DataTypeElementSingle
                }
            }
            if (f.isMany()) {
                return SaveFeatureKind.DataTypeMany
            }
            if (f.isUnsettable()) {
                return SaveFeatureKind.DataTypeSingleNillable
            }
            return SaveFeatureKind.DataTypeSingle
        }
    }
}
