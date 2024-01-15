import { WriteStream } from "fs";
import { Err, Ok, Result } from "ts-results";
import { EObject, EResource, EEncoder, EPackage, EClass, EDataType, EFactory, EList, EObjectInternal, EcoreUtils, EStructuralFeature, isEReference, isEAttribute, EReference, EAttribute } from "./internal";
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind";
import { ensureUint8Array } from "./utils/TypedArray";
import * as MsgPack from "./utils/MsgPack";
import { utf8Count, utf8Encode } from "./utils/UTF8";

const binaryVersion = 0;
const binarySignature = Uint8Array.from([137, 101, 109, 102, 10, 13, 26, 10]);
const initialBufferSize = 2048;

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

function setUint64(view: DataView, offset: number, value: number): void {
    const high = value / 0x1_0000_0000;
    const low = value; // high bits are truncated by DataView
    view.setUint32(offset, high);
    view.setUint32(offset + 4, low);
}

function setInt64(view: DataView, offset: number, value: number): void {
    const high = Math.floor(value / 0x1_0000_0000);
    const low = value; // high bits are truncated by DataView
    view.setUint32(offset, high);
    view.setUint32(offset + 4, low);
}

export class BinaryEncoder implements EEncoder {
    private _resource: EResource;
    private _objectRoot: EObject;
    private _baseURI: URL;
    private _objectToID: Map<EObject, number> = new Map<EObject, number>;
    private _classDataMap: Map<EClass, ClassData> = new Map<EClass, ClassData>;
    private _packageDataMap: Map<EPackage, PackageData> = new Map<EPackage, PackageData>;
    private _uriToIDMap: Map<string, number> = new Map<string, number>;
    private _enumLiteralToIDMap: Map<string, number> = new Map<string, number>;
    private _version: number = binaryVersion;
    private _isIDAttributeEncoded: boolean = false;
    private _pos: number = 0;
    private _view: DataView;
    private _bytes: Uint8Array;


    constructor(eContext: EResource, options: Map<string, any>) {
        this._resource = eContext;
        this._view = new DataView(new ArrayBuffer(initialBufferSize));
        this._bytes = new Uint8Array(this._view.buffer)
    }

    private reinitializeState() {
        this._pos = 0;
    }

    private ensureBufferSizeToWrite(sizeToWrite: number) {
        const requiredSize = this._pos + sizeToWrite;
        if (this._view.byteLength < requiredSize) {
            this.resizeBuffer(requiredSize * 2);
        }
    }

    private encodeAny(object: any) {
        if (object == null) {
            this.encodeNil();
        } else if (typeof object === "boolean") {
            this.encodeBoolean(object)
        } else if (typeof object === "number") {
            this.encodeNumber(object)
        } else if (typeof object === "string") {
            this.encodeString(object)
        } else if (ArrayBuffer.isView(object)) {
            this.encodeBytes(object)
        }
        // TODO
        // add Date and Extension
    }

    private encodeNil() {
        this.writeU8(MsgPack.Nil);
    }

    private encodeBoolean(object: boolean) {
        if (object === false) {
            this.writeU8(MsgPack.False);
        } else {
            this.writeU8(MsgPack.True);
        }
    }

    private encodeNumber(object: number) {
        if (Number.isSafeInteger(object)) {
            if (object >= 0) {
                if (object < 0x80) {
                    // positive fixint
                    this.writeU8(object);
                } else if (object < 0x100) {
                    // uint 8
                    this.writeU8(MsgPack.Uint8);
                    this.writeU8(object);
                } else if (object < 0x10000) {
                    // uint 16
                    this.writeU8(MsgPack.Uint16);
                    this.writeU16(object);
                } else if (object < 0x100000000) {
                    // uint 32
                    this.writeU8(MsgPack.Uint32);
                    this.writeU32(object);
                } else {
                    // uint 64
                    this.writeU8(MsgPack.Uint64);
                    this.writeU64(object);
                }
            } else {
                if (object >= -0x20) {
                    // negative fixint
                    this.writeU8(MsgPack.NegFixedNumLow | (object + 0x20));
                } else if (object >= -0x80) {
                    // int 8
                    this.writeU8(MsgPack.Int8);
                    this.writeI8(object);
                } else if (object >= -0x8000) {
                    // int 16
                    this.writeU8(MsgPack.Int16);
                    this.writeI16(object);
                } else if (object >= -0x80000000) {
                    // int 32
                    this.writeU8(MsgPack.Int32);
                    this.writeI32(object);
                } else {
                    // int 64
                    this.writeU8(MsgPack.Int64);
                    this.writeI64(object);
                }
            }
        } else {
            // float 64
            this.writeU8(MsgPack.Double)
            this.writeF64(object)
        }
    }

    private encodeBytes(object: ArrayBufferView) {
        const size = object.byteLength;
        if (size < 0x100) {
            // bin 8
            this.writeU8(0xc4);
            this.writeU8(size);
        } else if (size < 0x10000) {
            // bin 16
            this.writeU8(0xc5);
            this.writeU16(size);
        } else if (size < 0x100000000) {
            // bin 32
            this.writeU8(0xc6);
            this.writeU32(size);
        } else {
            throw new Error(`Too large binary: ${size}`);
        }
        const bytes = ensureUint8Array(object);
        this.writeU8a(bytes);
    }

    private encodeString(object: string) {
        const maxHeaderSize = 1 + 4
        const byteLength = utf8Count(object)
        this.ensureBufferSizeToWrite(maxHeaderSize + byteLength)
        this.writeStringHeader(byteLength)
        utf8Encode(object, this._bytes, this._pos)
        this._pos += byteLength
    }

    private writeU8(value: number) {
        this.ensureBufferSizeToWrite(1);
        this._view.setUint8(this._pos, value);
        this._pos++;
    }

    private writeU8a(values: ArrayLike<number>) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this._bytes.set(values, this._pos);
        this._pos += size;
    }

    private writeI8(value: number) {
        this.ensureBufferSizeToWrite(1);
        this._view.setInt8(this._pos, value);
        this._pos++;
    }

    private writeU16(value: number) {
        this.ensureBufferSizeToWrite(2);
        this._view.setUint16(this._pos, value);
        this._pos += 2;
    }

    private writeI16(value: number) {
        this.ensureBufferSizeToWrite(2);
        this._view.setInt16(this._pos, value);
        this._pos += 2;
    }

    private writeU32(value: number) {
        this.ensureBufferSizeToWrite(4);
        this._view.setUint32(this._pos, value);
        this._pos += 4;
    }

    private writeI32(value: number) {
        this.ensureBufferSizeToWrite(4);
        this._view.setInt32(this._pos, value);
        this._pos += 4;
    }

    private writeF32(value: number) {
        this.ensureBufferSizeToWrite(4);
        this._view.setFloat32(this._pos, value);
        this._pos += 4;
    }

    private writeF64(value: number) {
        this.ensureBufferSizeToWrite(8);
        this._view.setFloat64(this._pos, value);
        this._pos += 8;
    }

    private writeU64(value: number) {
        this.ensureBufferSizeToWrite(8);
        setUint64(this._view, this._pos, value);
        this._pos += 8;
    }

    private writeI64(value: number) {
        this.ensureBufferSizeToWrite(8);
        setInt64(this._view, this._pos, value);
        this._pos += 8;
    }

    private writeStringHeader(byteLength: number) {
        if (byteLength < 32) {
            // fixstr
            this.writeU8(0xa0 + byteLength);
        } else if (byteLength < 0x100) {
            // str 8
            this.writeU8(0xd9);
            this.writeU8(byteLength);
        } else if (byteLength < 0x10000) {
            // str 16
            this.writeU8(0xda);
            this.writeU16(byteLength);
        } else if (byteLength < 0x100000000) {
            // str 32
            this.writeU8(0xdb);
            this.writeU32(byteLength);
        } else {
            throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }
    }

    private resizeBuffer(newSize: number) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);
        newBytes.set(this._bytes);
        this._view = newView;
        this._bytes = newBytes;
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
            case BinaryFeatureKind.bfkObjectProxy:
                this.encodeEObject(value as EObject, CheckType.CheckResource)
            case BinaryFeatureKind.bfkObjectList:
            case BinaryFeatureKind.bfkObjectContainmentList:
                this.encodeEObjects(value as EList<EObject>, CheckType.CheckNothing)
            case BinaryFeatureKind.bfkObjectContainmentListProxy:
                this.encodeEObjects(value as EList<EObject>, CheckType.CheckDirectResource)
            case BinaryFeatureKind.bfkObjectListProxy:
                this.encodeEObjects(value as EList<EObject>, CheckType.CheckResource)
            case BinaryFeatureKind.bfkData:
                let valueStr = featureData.factory.convertToString(featureData.dataType, value)
                this.encodeString(valueStr)
            case BinaryFeatureKind.bfkDataList:
                let l = value as EList<any>
                this.encodeNumber(l.size())
                for ( const value of l ) {
                    let valueStr = featureData.factory.convertToString(featureData.dataType, value)
                    this.encodeString(valueStr)
                }
            case BinaryFeatureKind.bfkEnum:
                let literalStr = featureData.factory.convertToString(featureData.dataType, value)
                if (this._enumLiteralToIDMap.has(literalStr)) {
                    let enumID = this._enumLiteralToIDMap.get(literalStr)
                    this.encodeNumber(enumID)
                } else {
                    let enumID = this._enumLiteralToIDMap.size
                    this._enumLiteralToIDMap.set(literalStr,enumID)
                    this.encodeNumber(enumID)
                    this.encodeString(literalStr)
                }
            case BinaryFeatureKind.bfkDate:
                //this.encodeDate(value as Date)
                throw new Error("Date  serialization not implemented")
            case BinaryFeatureKind.bfkNumber:
                this.encodeNumber(value as number)
            case BinaryFeatureKind.bfkBool:
                this.encodeBoolean(value as boolean)
            case BinaryFeatureKind.bfkString:
                this.encodeString(value as string)
            case BinaryFeatureKind.bfkByteArray:
                this.encodeBytes(value as Uint8Array)
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

    encode(eResource: EResource): Result<Uint8Array, Error> {
        this.reinitializeState()
        try {
            this.encodeSignature()
            this.encodeVersion()
            this.encodeEObjects(eResource.eContents(), CheckType.CheckContainer)
            return Ok(this._bytes.subarray(0, this._pos))
        } catch (err) {
            return Err(err)
        }

    }
    encodeObject(eObject: EObject): Result<Uint8Array, Error> {
        this.reinitializeState()
        try {
            this.encodeSignature()
            this.encodeVersion()
            this.encodeEObject(eObject, CheckType.CheckContainer)
            return Ok(this._bytes.subarray(0, this._pos))
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
