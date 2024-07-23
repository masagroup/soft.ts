import { Err, Ok, Result } from "ts-results-es"
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind.js"
import {
    BinaryOptions,
    EAttribute,
    EClass,
    EcoreUtils,
    EDataType,
    EEncoder,
    EFactory,
    EList,
    EObject,
    EObjectInternal,
    EPackage,
    EReference,
    EResource,
    EStructuralFeature,
    isEAttribute,
    isEReference,
    URI
} from "./internal.js"
import { Encoder } from "./msgpack/Encoder.js"

const binaryVersion = 0
const binarySignature = Uint8Array.from([137, 101, 109, 102, 10, 13, 26, 10])

enum CheckType {
    CheckNothing,
    CheckDirectResource,
    CheckResource,
    CheckContainer
}

class PackageData {
    id: number
    classData: ClassData[] = []
}

class ClassData {
    id: number
    packageID: number
    featureData: FeatureData[] = []

    constructor(id: number, packageID: number) {
        this.id = id
        this.packageID = packageID
    }
}

class FeatureData {
    factory: EFactory
    dataType: EDataType
    name: string
    featureKind: BinaryFeatureKind
    isTransient: boolean
}

export class BinaryEncoder implements EEncoder {
    private _resource: EResource
    private _baseURI: URI
    private _objectRoot: EObject
    private _objectToID: Map<EObject, number> = new Map<EObject, number>()
    private _classDataMap: Map<EClass, ClassData> = new Map<EClass, ClassData>()
    private _packageDataMap: Map<EPackage, PackageData> = new Map<EPackage, PackageData>()
    private _uriToIDMap: Map<string, number> = new Map<string, number>()
    private _enumLiteralToIDMap: Map<string, number> = new Map<string, number>()
    private _version: number = binaryVersion
    private _isIDAttributeEncoded: boolean = false
    private _encoder: Encoder

    constructor(eContext: EResource, options?: Map<string, any>) {
        this._resource = eContext
        this._baseURI = this._resource?.eURI
        this._isIDAttributeEncoded = options?.get(BinaryOptions.BINARY_OPTION_ID_ATTRIBUTE) ?? false
    }

    private encodeBoolean(object: boolean) {
        this._encoder.encodeBoolean(object)
    }

    private encodeNumber(object: number) {
        this._encoder.encodeNumber(object)
    }

    private encodeBytes(object: ArrayBufferView) {
        this._encoder.encodeBinary(object)
    }

    private encodeString(object: string) {
        this._encoder.encodeString(object)
    }

    private encodeDate(object: Date) {
        this._encoder.encode(object)
    }

    private encodeAny(object: any) {
        this._encoder.encode(object)
    }

    private encodeSignature() {
        this.encodeBytes(binarySignature)
    }

    private encodeVersion() {
        this.encodeNumber(this._version)
    }

    private encodeEObjects(objects: EList<EObject>, check: CheckType) {
        this.encodeNumber(objects.size())
        for (const object of objects) {
            this.encodeEObject(object, check)
        }
    }

    private encodeEObject(eObject: EObject, check: CheckType) {
        if (eObject == null) {
            this.encodeNumber(-1)
        } else if (this._objectToID.has(eObject)) {
            this.encodeNumber(this._objectToID.get(eObject))
        } else {
            let eObjectInternal = eObject as EObjectInternal

            // object id
            let objectID = this._objectToID.size
            this._objectToID.set(eObject, objectID)
            this.encodeNumber(objectID)

            // object class
            let eClass = eObject.eClass()
            let eClassData = this.encodeClass(eClass)

            let saveFeatureValues = true
            switch (check) {
                case CheckType.CheckDirectResource:
                    if (eObjectInternal.eIsProxy()) {
                        this.encodeNumber(-2)
                        this.encodeURI(eObjectInternal.eProxyURI())
                        saveFeatureValues = false
                    } else {
                        let eResource = eObjectInternal.eInternalResource()
                        if (eResource) {
                            this.encodeNumber(-2)
                            this.encodeURIWithFragment(eResource.eURI, eResource.getURIFragment(eObjectInternal))
                            saveFeatureValues = false
                        }
                    }
                    break
                case CheckType.CheckResource:
                    if (eObjectInternal.eIsProxy()) {
                        this.encodeNumber(-2)
                        this.encodeURI(eObjectInternal.eProxyURI())
                        saveFeatureValues = false
                    } else {
                        let eResource = eObjectInternal.eInternalResource()
                        if (
                            eResource != null &&
                            (eResource != this._resource ||
                                (this._objectRoot != null && !EcoreUtils.isAncestor(this._objectRoot, eObjectInternal)))
                        ) {
                            this.encodeNumber(-2)
                            this.encodeURIWithFragment(eResource.eURI, eResource.getURIFragment(eObjectInternal))
                            saveFeatureValues = false
                        }
                    }
                    break
                case CheckType.CheckNothing:
                    break
                case CheckType.CheckContainer:
                    break
            }
            if (saveFeatureValues) {
                let objectIDManager = this._resource.eObjectIDManager
                if (this._isIDAttributeEncoded && objectIDManager) {
                    let id = objectIDManager.getID(eObject)
                    if (id) {
                        this.encodeNumber(-1)
                        this.encodeAny(id)
                    }
                }

                for (let featureID = 0; featureID < eClassData.featureData.length; featureID++) {
                    let featureData = eClassData.featureData[featureID]
                    if (
                        !featureData.isTransient &&
                        (check == CheckType.CheckContainer ||
                            featureData.featureKind != BinaryFeatureKind.bfkObjectContainerProxy)
                    ) {
                        this.encodeFeatureValue(eObjectInternal, featureID, featureData)
                    }
                }
            }
            this.encodeNumber(0)
        }
    }

    private encodePackage(ePackage: EPackage): PackageData {
        let ePackageData = this._packageDataMap.get(ePackage)
        if (ePackageData) {
            this.encodeNumber(ePackageData.id)
        } else {
            ePackageData = new PackageData()
            ePackageData.id = this._packageDataMap.size
            ePackageData.classData = new Array(ePackage.getEClassifiers().size())
            this.encodeNumber(ePackageData.id)
            this.encodeString(ePackage.getNsURI())
            this.encodeURI(EcoreUtils.getURI(ePackage))
            this._packageDataMap.set(ePackage, ePackageData)
        }
        return ePackageData
    }

    private encodeClass(eClass: EClass): ClassData {
        let eClassData = this._classDataMap.get(eClass)
        if (eClassData) {
            this.encodeNumber(eClassData.packageID)
            this.encodeNumber(eClassData.id)
        } else {
            eClassData = this.newClassData(eClass)
            this.encodeNumber(eClassData.id)
            this.encodeString(eClass.getName())
            this._classDataMap.set(eClass, eClassData)
        }
        return eClassData
    }

    private encodeURI(uri: URI) {
        if (uri == null) {
            this.encodeNumber(-1)
        } else {
            this.encodeURIWithFragment(uri.trimFragment(), uri.fragment)
        }
    }

    private encodeURIWithFragment(uri: URI, fragment: string) {
        if (uri == null) {
            this.encodeNumber(-1)
        } else {
            let uriStr = uri.toString()
            if (this._uriToIDMap.has(uriStr)) {
                this.encodeNumber(this._uriToIDMap.get(uriStr))
            } else {
                let id = this._uriToIDMap.size
                this._uriToIDMap.set(uriStr, id)
                this.encodeNumber(id)
                this.encodeString(this.relativizeURI(uri).toString())
            }
            this.encodeString(fragment)
        }
    }

    private relativizeURI(uri: URI): URI {
        return this._baseURI ? this._baseURI.relativize(uri) : uri
    }

    private encodeFeatureValue(eObject: EObjectInternal, featureID: number, featureData: FeatureData) {
        if (eObject.eIsSetFromID(featureID)) {
            this.encodeNumber(featureID + 1)
            if (featureData.name.length > 0) {
                this.encodeString(featureData.name)
                featureData.name = ""
            }
            let value = eObject.eGetFromID(featureID, false, false)
            switch (featureData.featureKind) {
                case BinaryFeatureKind.bfkObject:
                case BinaryFeatureKind.bfkObjectContainment:
                    this.encodeEObject(value as EObject, CheckType.CheckNothing)
                    break
                case BinaryFeatureKind.bfkObjectContainerProxy:
                    this.encodeEObject(value as EObject, CheckType.CheckResource)
                    break
                case BinaryFeatureKind.bfkObjectContainmentProxy:
                    this.encodeEObject(value as EObject, CheckType.CheckDirectResource)
                    break
                case BinaryFeatureKind.bfkObjectProxy:
                    this.encodeEObject(value as EObject, CheckType.CheckResource)
                    break
                case BinaryFeatureKind.bfkObjectList:
                case BinaryFeatureKind.bfkObjectContainmentList:
                    this.encodeEObjects(value as EList<EObject>, CheckType.CheckNothing)
                    break
                case BinaryFeatureKind.bfkObjectContainmentListProxy:
                    this.encodeEObjects(value as EList<EObject>, CheckType.CheckDirectResource)
                    break
                case BinaryFeatureKind.bfkObjectListProxy:
                    this.encodeEObjects(value as EList<EObject>, CheckType.CheckResource)
                    break
                case BinaryFeatureKind.bfkData:
                    let valueStr = featureData.factory.convertToString(featureData.dataType, value)
                    this.encodeString(valueStr)
                    break
                case BinaryFeatureKind.bfkDataList:
                    let l = value as EList<any>
                    this.encodeNumber(l.size())
                    for (const value of l) {
                        let valueStr = featureData.factory.convertToString(featureData.dataType, value)
                        this.encodeString(valueStr)
                    }
                    break
                case BinaryFeatureKind.bfkEnum:
                    let literalStr = featureData.factory.convertToString(featureData.dataType, value)
                    if (this._enumLiteralToIDMap.has(literalStr)) {
                        let enumID = this._enumLiteralToIDMap.get(literalStr)
                        this.encodeNumber(enumID)
                    } else {
                        let enumID = this._enumLiteralToIDMap.size
                        this._enumLiteralToIDMap.set(literalStr, enumID)
                        this.encodeNumber(enumID)
                        this.encodeString(literalStr)
                    }
                    break
                case BinaryFeatureKind.bfkDate:
                    this.encodeDate(value as Date)
                    break
                case BinaryFeatureKind.bfkNumber:
                    this.encodeNumber(value as number)
                    break
                case BinaryFeatureKind.bfkBool:
                    this.encodeBoolean(value as boolean)
                    break
                case BinaryFeatureKind.bfkString:
                    this.encodeString(value as string)
                    break
                case BinaryFeatureKind.bfkByteArray:
                    this.encodeBytes(value as Uint8Array)
                    break
                default:
                    throw new Error(`feature with feature kind '${featureData.featureKind}' is not supported`)
            }
        }
    }

    private newClassData(eClass: EClass): ClassData {
        let eFeatures = eClass.getEAllStructuralFeatures()
        let ePackageData = this.encodePackage(eClass.getEPackage())
        let eClassData = new ClassData(this.newClassID(ePackageData), ePackageData.id)
        ePackageData.classData[eClassData.id] = eClassData
        for (const eFeature of eFeatures) {
            eClassData.featureData.push(this.newFeatureData(eFeature))
        }
        return eClassData
    }

    private newFeatureData(eFeature: EStructuralFeature): FeatureData {
        let eFeatureData = new FeatureData()
        eFeatureData.name = eFeature.getName()
        eFeatureData.featureKind = getBinaryCodecFeatureKind(eFeature)
        if (isEReference(eFeature)) {
            let eReference = eFeature as EReference
            eFeatureData.isTransient = eReference.isTransient() || (eReference.isContainer() && !eReference.isResolveProxies())
        } else if (isEAttribute(eFeature)) {
            let eAttribute = eFeature as EAttribute
            let eDataType = eAttribute.getEAttributeType()
            eFeatureData.isTransient = eAttribute.isTransient()
            eFeatureData.dataType = eDataType
            eFeatureData.factory = eDataType.getEPackage().getEFactoryInstance()
        }
        return eFeatureData
    }

    private newClassID(ePackageData: PackageData): number {
        for (let i = 0; i < ePackageData.classData.length; i++) {
            let c = ePackageData.classData[i]
            if (c == null) {
                return i
            }
        }
        return -1
    }

    private reinitializeState() {
        this._encoder = new Encoder()
    }

    encode(eResource: EResource): Result<Uint8Array, Error> {
        try {
            this.reinitializeState()
            this.encodeSignature()
            this.encodeVersion()
            this.encodeEObjects(eResource.eContents(), CheckType.CheckContainer)
            return Ok(this._encoder.bytes())
        } catch (err) {
            return Err(err)
        }
    }

    encodeObject(eObject: EObject): Result<Uint8Array, Error> {
        try {
            this.reinitializeState()
            this.encodeSignature()
            this.encodeVersion()
            this.encodeEObject(eObject, CheckType.CheckContainer)
            return Ok(this._encoder.bytes())
        } catch (err) {
            return Err(err)
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
}
