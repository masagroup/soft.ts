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
    EList,
    EMap,
    ENamedElement,
    EObject,
    EObjectInternal,
    EPackage,
    EResource,
    EStructuralFeature,
    ExtendedMetaData,
    getEcorePackage,
    getPackageRegistry,
    isEClass,
    isEDataType,
    isEObject,
    isEObjectInternal,
    isEReference,
    URI,
    XMLOptions
} from "./internal.js"
import { XMLConstants } from "./XMLConstants.js"
import { XMLString } from "./XMLString.js"
import { utf8Count, utf8Encode } from "./utils/UTF8.js"

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

function stringFormat(template: string, ...args: any[]) {
    return template.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != "undefined" ? args[number] : match
    })
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
    private _xmlVersion: string
    private _encoding: string
    private _errorFn: (eDiagnostic: EDiagnostic) => void

    constructor(resource: EResource, options: Map<string, any>) {
        this._resource = resource
        this._encoding = "UTF-8"
        this._xmlVersion = "1.0"
        if (options) {
            this._idAttributeName = options.get(XMLOptions.ID_ATTRIBUTE_NAME)
            this._roots = options.get(XMLOptions.ROOT_OBJECTS)
            this._extendedMetaData = options.get(XMLOptions.EXTENDED_META_DATA)
        }
        if (!this._extendedMetaData) {
            this._extendedMetaData = new ExtendedMetaData()
        }
    }

    setXMLVersion(xmlVersion: string): void {
        this._xmlVersion = xmlVersion
    }

    getXMLVersion(): string {
        return this._xmlVersion
    }

    setEncoding(encoding: string): void {
        this._encoding = encoding
    }

    getEncoding(): string {
        return this._encoding
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
        this.encodeTopObject(contents.get(0))

        const errors = this._resource.getErrors()
        if (errors.isEmpty()) {
            const r = this._str.toString()
            const e  = new Uint8Array(utf8Count(r))
            utf8Encode(r,e,0)
            return Ok(e)
        } else {
            return Err(errors.get(0))
        }
    }

    encodeObject(eObject: EObject): Result<Uint8Array, Error> {
        let error: Error
        this._errorFn = (diagnostic: EDiagnostic) => {
            error = diagnostic
        }
        this.encodeTopObject(eObject)
        if (error) {
            return Err(error)
        } else {
            const r = this._str.toString()
            const e  = new Uint8Array(utf8Count(r))
            utf8Encode(r,e,0)
            return Ok(e)
        }
    }

    async encodeAsync(eResource: EResource, stream: WritableStream): Promise<Uint8Array> {
        const r = this.encode(eResource)
        if (r.isOk()) {
            stream.getWriter().write(r.value)
            return r.value
        } else {
            return Promise.reject(r.error)
        }
    }

    async encodeObjectAsync(eObject: EObject, stream: WritableStream): Promise<Uint8Array> {
        const r = this.encodeObject(eObject)
        if (r.isOk()) {
            stream.getWriter().write(r.value)
            return r.value
        } else {
            return Promise.reject(r.error)
        }
    }

    private encodeTopObject(eObject: EObject) {
        // header
        this.saveHeader()

        // initialize prefixes if any in top
        if (this._extendedMetaData) {
            const eClass = eObject.eClass()
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
            while (eClassifier) {
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
            if (id) {
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
                    case SaveFeatureKind.ObjectContainMany: {
                        break
                    }
                    case SaveFeatureKind.ObjectHREFSingleUnsettable: {
                        if (!this.isNil(eObject, eFeature)) {
                            switch (this.getSaveResourceKindSingle(eObject, eFeature)) {
                                case SaveResourceKind.Cross: {
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
    }

    private saveDataTypeSingle(eObject: EObject, eFeature: EStructuralFeature) {
        const val = eObject.eGetResolve(eFeature, false)
        const str = this.getDataType(val, eFeature, true)
        if (str) {
            this._str.addAttribute(this.getFeatureQName(eFeature), str)
        }
    }

    private saveDataTypeMany(eObject: EObject, eFeature: EStructuralFeature) {
        const l = eObject.eGetResolve(eFeature, false) as EList<EObject>
        const d = eFeature.getEType() as EDataType
        const p = d.getEPackage()
        const f = p.getEFactoryInstance()
        const name = this.getFeatureQName(eFeature)
        for (const value of l) {
            if (!value) {
                this._str.startElement(name)
                this._str.addAttribute("xsi:nil", "true")
                this._str.endEmptyElement()
                this._uriToPrefixes.set(XMLConstants.xsiURI, [XMLConstants.xsiNS])
                this._prefixesToURI.set(XMLConstants.xsiNS, XMLConstants.xsiURI)
            } else {
                const str = f.convertToString(d, value)
                this._str.addContent(name, str)
            }
        }
    }

    private saveManyEmpty(eObject: EObject, eFeature: EStructuralFeature) {
        this._str.addAttribute(this.getFeatureQName(eFeature), "")
    }

    private saveEObjectSingle(eObject: EObject, eFeature: EStructuralFeature) {
        const value = eObject.eGetResolve(eFeature, false)
        if (value && isEObject(value)) {
            const id = this.getHRef(value)
            this._str.addAttribute(this.getFeatureQName(eFeature), id)
        }
    }

    private saveEObjectMany(eObject: EObject, eFeature: EStructuralFeature) {
        const l = eObject.eGetResolve(eFeature, false) as EList<EObject>
        let failure = false
        let first = true
        let buffer = ""
        for (const value of l) {
            if (value) {
                const id = this.getHRef(value)
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
        if (eType != eClass && eType != getEcorePackage().getEObject()) {
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
            const s = f.convertToString(d, value)
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
                    if (this._resource && this._resource.getObjectIDManager()) {
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
        this.error(
            new EDiagnosticImpl("Object is not contained in a resource.", this._resource.getURI().toString(), 0, 0)
        )
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

    private setPrefixToNamespace(prefixToNamespaceMap: EMap<string, string>) {
        for (const mapEntry of prefixToNamespaceMap) {
            const prefix = mapEntry.getKey()
            const nsURI = mapEntry.getValue()
            const ePackage = this.getPackageForSpace(nsURI)
            if (ePackage) {
                this._packages.set(ePackage.getNsURI(), prefix)
            }
            this._prefixesToURI.set(prefix, nsURI)
            if (this._uriToPrefixes.has(nsURI)) {
                const prefixes = this._uriToPrefixes.get(nsURI)
                prefixes.push(prefix)
                this._uriToPrefixes.set(nsURI, prefixes)
            } else {
                this._uriToPrefixes.set(nsURI, [])
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
