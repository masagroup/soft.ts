import { WriteStream } from "fs";
import { Err, Ok, Result } from "ts-results";
import { EObject, EResource, EEncoder, EPackage, EClass, EDataType, EFactory, EList, EObjectInternal, EcoreUtils, EStructuralFeature, isEReference, isEAttribute, EReference, EAttribute } from "./internal";
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind";
import { Encoder } from "./msgpack/Encoder";

const binaryVersion = 0;
const binarySignature = Uint8Array.from([137, 101, 109, 102, 10, 13, 26, 10]);

enum CheckType {
    CheckNothing,
    CheckDirectResource,
    CheckResource,
    CheckContainer,
}

class PackageData {
    id: number;
    classData: ClassData[] = [];
}

class ClassData {
    id: number;
    packageID: number;
    featureData: FeatureData[] = [];

    constructor(id: number, packageID: number) {
        this.id = id
        this.packageID = packageID
    }
}

class FeatureData {
    factory: EFactory;
    dataType: EDataType;
    name: string;
    featureKind: BinaryFeatureKind;
    isTransient: boolean;
}

export class BinaryEncoder implements EEncoder {
    private _resource: EResource;
    private _objectRoot: EObject;
    private _objectToID: Map<EObject, number> = new Map<EObject, number>;
    private _classDataMap: Map<EClass, ClassData> = new Map<EClass, ClassData>;
    private _packageDataMap: Map<EPackage, PackageData> = new Map<EPackage, PackageData>;
    private _uriToIDMap: Map<string, number> = new Map<string, number>;
    private _enumLiteralToIDMap: Map<string, number> = new Map<string, number>;
    private _version: number = binaryVersion;
    private _isIDAttributeEncoded: boolean = false;
    private _encoder: Encoder;


    constructor(eContext: EResource, options: Map<string, any>) {
        this._resource = eContext;
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
            let eObjectInternal = eObject as EObjectInternal;

            // object id
            let objectID = this._objectToID.size;
            this.encodeNumber(objectID);

            // object class
            let eClass = eObject.eClass();
            let eClassData = this.encodeClass(eClass);

            let saveFeatureValues = true;
            switch (check) {
                case CheckType.CheckDirectResource:
                    if (eObjectInternal.eIsProxy()) {
                        this.encodeNumber(-2)
                        this.encodeURI(eObjectInternal.eProxyURI())
                        saveFeatureValues = false
                    } else {
                        let eResource = eObjectInternal.eInternalResource();
                        if (eResource) {
                            this.encodeNumber(-2)
                            this.encodeURIWithFragment(eResource.eURI, eResource.getURIFragment(eObjectInternal))
                            saveFeatureValues = false
                        }
                    }
                    break;
                case CheckType.CheckResource:
                    if (eObjectInternal.eIsProxy()) {
                        this.encodeNumber(-2)
                        this.encodeURI(eObjectInternal.eProxyURI())
                        saveFeatureValues = false
                    } else {
                        let eResource = eObjectInternal.eInternalResource();
                        if (eResource != this._resource || (this._objectRoot != null && !EcoreUtils.isAncestor(this._objectRoot, eObjectInternal))) {
                            this.encodeNumber(-2)
                            this.encodeURIWithFragment(eResource.eURI, eResource.getURIFragment(eObjectInternal))
                            saveFeatureValues = false
                        }
                    }
                    break;
                case CheckType.CheckNothing:
                    break;
                case CheckType.CheckContainer:
                    break;
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
                    if (!featureData.isTransient && (check == CheckType.CheckContainer || featureData.featureKind != BinaryFeatureKind.bfkObjectContainerProxy)) {
                        this.encodeFeatureValue(eObjectInternal, featureID, featureData)
                    }
                }
            }
        }
    }

    private encodePackage(ePackage: EPackage): PackageData {
        let ePackageData = this._packageDataMap.get(ePackage)
        if (ePackageData) {
            this.encodeNumber(ePackageData.id)
        } else {
            ePackageData = new PackageData()
            ePackageData.id = this._packageDataMap.size
            this.encodeNumber(ePackageData.id)
            this.encodeString(ePackage.nsURI)
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
            this.encodeString(eClass.name)
            this._classDataMap.set(eClass, eClassData)

        }
        return eClassData
    }

    private encodeURI(uri: URL) {
        if (uri == null) {
            this.encodeNumber(-1)
        } else {
            let uriStr = uri.toString()
            let ndx = uriStr.indexOf("#");
            let trimmed: string = ndx != -1 ? (ndx > 0 ? uriStr.slice(0, ndx - 1) : "") : uriStr;
            let fragment: string = ndx != -1 ? (ndx > 0 ? uriStr.slice(ndx + 1) : "") : "";
            this.encodeURIWithFragment(new URL(trimmed), fragment)
        }
    }

    private encodeURIWithFragment(uri: URL, fragment: string) {
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
                this.encodeString(uri.toString())
            }
            this.encodeString(fragment)
        }
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
                    break;
                case BinaryFeatureKind.bfkObjectContainerProxy:
                    this.encodeEObject(value as EObject, CheckType.CheckResource)
                    break;
                case BinaryFeatureKind.bfkObjectContainmentProxy:
                    this.encodeEObject(value as EObject, CheckType.CheckDirectResource)
                    break;
                case BinaryFeatureKind.bfkObjectProxy:
                    this.encodeEObject(value as EObject, CheckType.CheckResource)
                    break;
                case BinaryFeatureKind.bfkObjectList:
                case BinaryFeatureKind.bfkObjectContainmentList:
                    this.encodeEObjects(value as EList<EObject>, CheckType.CheckNothing)
                    break;
                case BinaryFeatureKind.bfkObjectContainmentListProxy:
                    this.encodeEObjects(value as EList<EObject>, CheckType.CheckDirectResource)
                    break;
                case BinaryFeatureKind.bfkObjectListProxy:
                    this.encodeEObjects(value as EList<EObject>, CheckType.CheckResource)
                    break;
                case BinaryFeatureKind.bfkData:
                    let valueStr = featureData.factory.convertToString(featureData.dataType, value)
                    this.encodeString(valueStr)
                    break;
                case BinaryFeatureKind.bfkDataList:
                    let l = value as EList<any>
                    this.encodeNumber(l.size())
                    for (const value of l) {
                        let valueStr = featureData.factory.convertToString(featureData.dataType, value)
                        this.encodeString(valueStr)
                    }
                    break;
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
                    break;
                case BinaryFeatureKind.bfkDate:
                    this.encodeDate(value as Date)
                case BinaryFeatureKind.bfkNumber:
                    this.encodeNumber(value as number)
                    break;
                case BinaryFeatureKind.bfkBool:
                    this.encodeBoolean(value as boolean)
                    break;
                case BinaryFeatureKind.bfkString:
                    this.encodeString(value as string)
                    break;
                case BinaryFeatureKind.bfkByteArray:
                    this.encodeBytes(value as Uint8Array)
                    break;
                default:
                    throw new Error(`feature with feature kind '${featureData.featureKind}' is not supported`)
            }
        }
    }

    private newClassData(eClass: EClass): ClassData {
        let eFeatures = eClass.eAllStructuralFeatures
        let ePackageData = this.encodePackage(eClass.ePackage)
        let eClassData = new ClassData(this.newClassID(ePackageData), ePackageData.id)
        ePackageData.classData[eClassData.id] = eClassData
        for (const eFeature of eFeatures) {
            eClassData.featureData.push(this.newFeatureData(eFeature))
        }
        return eClassData
    }

    private newFeatureData(eFeature: EStructuralFeature): FeatureData {
        let eFeatureData = new FeatureData()
        eFeatureData.name = eFeature.name
        eFeatureData.featureKind = getBinaryCodecFeatureKind(eFeature)
        if (isEReference(eFeature)) {
            let eReference = eFeature as EReference
            eFeatureData.isTransient = eReference.isTransient || (eReference.isContainer && !eReference.isResolveProxies)
        } else if (isEAttribute(eFeature)) {
            let eAttribute = eFeature as EAttribute
            let eDataType = eAttribute.eAttributeType
            eFeatureData.isTransient = eAttribute.isTransient
            eFeatureData.dataType = eDataType
            eFeatureData.factory = eDataType.ePackage.eFactoryInstance
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
    encodeAsync(eResource: EResource, s: WriteStream): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
    encodeObjectAsync(eObject: EObject, s: WriteStream): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
}
