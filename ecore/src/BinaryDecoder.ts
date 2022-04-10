import { ReadStream } from "fs";
import { Err, Ok, Result } from "ts-results";
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind";
import { isEAttribute } from "./EAttributeExt";
import { EList } from "./EList";
import { EObjectInternal } from "./EObjectInternal";
import { EClass, EcoreUtils, EDataType, EFactory, EObject, EPackage, EResource, EResourceDecoder, EStructuralFeature, getPackageRegistry, ImmutableEList, isEClass, isEPackage } from "./internal";
import * as MsgPack from "./MsgPack";

function ensureUint8Array(buffer: ArrayLike<number> | Uint8Array | ArrayBufferView | ArrayBuffer): Uint8Array {
    if (buffer instanceof Uint8Array) {
      return buffer;
    } else if (ArrayBuffer.isView(buffer)) {
      return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    } else if (buffer instanceof ArrayBuffer) {
      return new Uint8Array(buffer);
    } else {
      // ArrayLike<number>
      return Uint8Array.from(buffer);
    }
}

function createDataView(buffer: ArrayLike<number> | ArrayBufferView | ArrayBuffer): DataView {
    if (buffer instanceof ArrayBuffer) {
      return new DataView(buffer);
    }
    const bufferView = ensureUint8Array(buffer);
    return new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
}

function prettyByte(byte: number): string {
    return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`;
}

function arraysAreEqual(a : Uint8Array, b: Uint8Array) {
    if (a.byteLength !== b.byteLength) return false;
    return a.every((val, i) => val === b[i]);
}

const binaryVersion = 0;
const binarySignature = Uint8Array.from([137,101,109,102,10,13,26,10])

class PackageData {
	ePackage : EPackage;
	eClassData : ClassData[];
}

class ClassData {
	eClass     :  EClass;
	eFactory   : EFactory;
	featureData :  FeatureData[]
}

class FeatureData {
	featureID   : number;
	eFeature    : EStructuralFeature;
	featureKind : BinaryFeatureKind;
	eFactory    : EFactory;
	eDataType   : EDataType;
}

export class BinaryDecoder implements EResourceDecoder {
    private _resource : EResource;
    private _bytes : Uint8Array;
    private _view : DataView;
    private _pos : number;
    private _objects : EObject[] = []
    private _isResolveProxies : boolean = false;
    private _packageData : PackageData[] = [];
    private _baseURI : URL;
    private _uris : URL[] = [];

    constructor(eContext: EResource, options: Map<string, any>) {
        this._resource = eContext;
        this._baseURI = this._resource.eURI;
    }

    decode(buffer: BufferSource): Result<EResource, Error> {
        try {
            this.setBuffer(buffer);
            this.decodeSignature();
            this.decodeVersion();

            // objects
            let size = this.decodeNumber();
            let objects = []
            for (let i = 0; i < size; i++) {
                objects.push(this.decodeEObject());
            }

            // add objects to resource
            this._resource.eContents().addAll(new ImmutableEList(objects))
            return Ok(this._resource);
        } catch( e ) {
            return Err(e)
        }
    }

    decodeObject(buffer: BufferSource): Result<EObject, Error> {
        throw new Error("Method not implemented.");
    }

    decodeAsync(stream: ReadStream): Promise<Result<EResource, Error>> {
        throw new Error("Method not implemented.");
    }
    
    decodeObjectAsync(stream: ReadStream): Promise<Result<EObject, Error>> {
        throw new Error("Method not implemented.");
    }

    private setBuffer(buffer: ArrayLike<number> | BufferSource): void {
        this._bytes = ensureUint8Array(buffer);
        this._view = createDataView(this._bytes);
        this._pos = 0;
    }

    private decodeSignature() {
        let signature = this.decodeBytes();
        if (!arraysAreEqual(signature,binarySignature)) {
            throw Error("Invalid signature for a binary EMF serialization")
        }
    }

    private decodeVersion() {
        let version = this.decodeNumber();
        if (version != binaryVersion) {
            throw Error("Invalid version for a binary EMF serialization")
        }
    }

    private decodeEObject() : EObject {
        let id = this.decodeNumber();
        if ( id == -1) {
            return null;
        } else if ( this._objects.length <= id ) {
            var eResult : EObject;
            let eClassData = this.decodeClass();
            let eObject = eClassData.eFactory.create(eClassData.eClass) as EObjectInternal
            eResult = eObject
            let featureID = this.decodeNumber() - 1

            if (featureID == -3) {
                // proxy object
                let eProxyURI = this.decodeURI();
                eObject.eSetProxyURI(eProxyURI)
                if (this._isResolveProxies) {
                    eResult = EcoreUtils.resolveInResource(eObject, this._resource);
                    this._objects.push(eResult);
                } else {
                    this._objects.push(eObject);
                }
                featureID = this.decodeNumber() - 1;
            } else {
                // standard object
                this._objects.push(eObject);
            }

            if (featureID == -2) {
                // object id attribute
                let objectID = this.decodeAny();
                let objectIDManager = this._resource.eObjectIDManager;
                if (objectIDManager) {
                    objectIDManager.setID(eObject, objectID);
                }
                featureID = this.decodeNumber() - 1;
            }
            for ( ; featureID != -1; featureID = this.decodeNumber() -1) {
                let eFeatureData = eClassData.featureData[featureID];
                if (!eFeatureData) {
                    eFeatureData = this.newFeatureData(eClassData, featureID);
                    eClassData.featureData[featureID] = eFeatureData
                }
                this.decodeFeatureValue(eObject, eFeatureData);
            }
            return eResult
        } else {
            return this._objects[id];
        }
    }

    private decodeClass() : ClassData {
        let ePackageData = this.decodePackage();
	    let id = this.decodeNumber();
	    let eClassData = ePackageData.eClassData[id];
        if (!eClassData) {
            eClassData = this.newClassData(ePackageData);
            ePackageData.eClassData[id] = eClassData;
        }
        return eClassData;
    }

    private decodePackage() : PackageData {
        let id = this.decodeNumber()
        if (this._packageData.length <= id ){
            // decode package parameters
            let nsURI = this.decodeString();
            let uri = this.decodeURI();
    
            // retrieve package
            let eResourceSet = this._resource.eResourceSet()
            let packageRegistry = eResourceSet ? eResourceSet.getPackageRegistry() : getPackageRegistry();
            let ePackage = packageRegistry.getPackage(nsURI);
            if (!ePackage) {
                let eObject = eResourceSet.getEObject(uri,true);
                if (isEPackage(eObject)) {
                    ePackage = eObject;
                }
            }
            
            // create new package data
            let ePackageData = this.newPackageData(ePackage);
            this._packageData.push(ePackageData);
            return ePackageData
    
        } else {
            return this._packageData[id];
        }
    }

    private decodeFeatureValue(eObject : EObjectInternal, featureData : FeatureData) {
        switch (featureData.featureKind) {
        case BinaryFeatureKind.bfkObjectContainer:
        case BinaryFeatureKind.bfkObjectContainerProxy:
        case BinaryFeatureKind.bfkObject:
        case BinaryFeatureKind.bfkObjectProxy:
        case BinaryFeatureKind.bfkObjectContainment:
        case BinaryFeatureKind.bfkObjectContainmentProxy:
            eObject.eSetFromID(featureData.featureID, this.decodeObject());
            break;
        case BinaryFeatureKind.bfkObjectList:
        case BinaryFeatureKind.bfkObjectListProxy:
        case BinaryFeatureKind.bfkObjectContainmentList:
        case BinaryFeatureKind.bfkObjectContainmentListProxy:
            let l = eObject.eGetFromID(featureData.featureID, false,false) as EList<any>;
            this.decodeObjects(l);
            break;
        case BinaryFeatureKind.bfkData:
            let valueStr = this.decodeString();
            let value = featureData.eFactory.createFromString(featureData.eDataType, valueStr);
            eObject.eSetFromID(featureData.featureID, value);
            break;
        case BinaryFeatureKind.bfkDataList:
            size := d.decodeInt()
            values := []interface{}{}
            for i := 0; i < size; i++ {
                valueStr := d.decodeString()
                value := featureData.eFactory.CreateFromString(featureData.eDataType, valueStr)
                values = append(values, value)
            }
            l := eObject.EGetResolve(featureData.eFeature, false).(EList)
            l.AddAll(NewBasicEList(values))
        case bfkEnum:
            var valueStr string
            id := d.decodeInt()
            if len(d.enumLiterals) <= id {
                valueStr = d.decodeString()
                d.enumLiterals = append(d.enumLiterals, valueStr)
            } else {
                valueStr = d.enumLiterals[id]
            }
            value := featureData.eFactory.CreateFromString(featureData.eDataType, valueStr)
            eObject.ESetFromID(featureData.featureID, value)
        case bfkDate:
            eObject.ESetFromID(featureData.featureID, d.decodeDate())
        case bfkFloat64:
            eObject.ESetFromID(featureData.featureID, d.decodeFloat64())
        case bfkFloat32:
            eObject.ESetFromID(featureData.featureID, d.decodeFloat32())
        case bfkInt:
            eObject.ESetFromID(featureData.featureID, d.decodeInt())
        case bfkInt64:
            eObject.ESetFromID(featureData.featureID, d.decodeInt64())
        case bfkInt32:
            eObject.ESetFromID(featureData.featureID, d.decodeInt32())
        case bfkInt16:
            eObject.ESetFromID(featureData.featureID, d.decodeInt16())
        case bfkByte:
            eObject.ESetFromID(featureData.featureID, d.decodeByte())
        case bfkBool:
            eObject.ESetFromID(featureData.featureID, d.decodeBool())
        case bfkString:
            eObject.ESetFromID(featureData.featureID, d.decodeString())
        case bfkByteArray:
            eObject.ESetFromID(featureData.featureID, d.decodeBytes())
        }
    }

    private newClassData(ePackageData : PackageData) : ClassData {
        let className = this.decodeString();
        let ePackage = ePackageData.ePackage;
        let eClassifier = ePackage.getEClassifier(className)
        if (isEClass(eClassifier)) {
            let classData = new ClassData();
            classData.eClass = eClassifier;
            classData.eFactory = ePackage.eFactoryInstance;
            classData.featureData = new Array(eClassifier.getFeatureCount());
            return classData;
        }
        throw new Error(`Unable to find class ${className} in package  ${ePackage.nsURI}`);
    }

    private newPackageData(ePackage : EPackage) : PackageData {
        let packageData = new PackageData();
        packageData.ePackage = ePackage;
        packageData.eClassData = new Array(ePackage.eClassifiers.size());
        return packageData;
    }

    private newFeatureData(eClassData : ClassData, featureID : number ) : FeatureData {
        let eFeatureName = this.decodeString();
        let eFeature = eClassData.eClass.getEStructuralFeatureFromName(eFeatureName);
        if (!eFeature)
            throw new Error(`Unable to find feature ${eFeatureName} in ${eClassData.eClass.name} EClass`);
        let featureData = new FeatureData();
        featureData.eFeature = eFeature;
        featureData.featureID = featureID;
        featureData.featureKind = getBinaryCodecFeatureKind(eFeature);
        if (isEAttribute(eFeature)) {
            featureData.eDataType = eFeature.eAttributeType;
            featureData.eFactory = featureData.eDataType.ePackage.eFactoryInstance;
        }
        return featureData;
    }
    
    private decodeURI() : URL {
        let id = this.decodeNumber();
        if (id == -1)
            return null;
        else {
            var uri : URL;
            if (this._uris.length <= id) {
                // build uri
                let uriStr = this.decodeString();
                if (uriStr == "") {
                    uri = this._baseURI;
                } else if (this._baseURI){
                    uri = new URL(uriStr , this._baseURI.toString());
                } else {
                    uri = new URL(uriStr);
                }
                // add it to the uri array
                this._uris.push(uri);
            } else {
                uri = this._uris[id];
            }
            return new URL( uri.toString() + "#" + this.decodeString());
        }
    }

    private decodeBoolean() : boolean {
        let code = this.readU8();
        return this.bool(code);
    }

    private bool( code : number ) : boolean {
        switch (code) {
            case MsgPack.True:
                return true;
            case MsgPack.False:
                return false;
        }
        throw new Error(`Unrecognized type byte: ${prettyByte(code)}`);
    }

    private decodeAny() : any {
        let code = this.readU8();
        if (MsgPack.isFixedNum(code)) {
            return code;
        }
	    if (MsgPack.isFixedString(code)) {
		    return this.string(code)
    	}

        switch (code) {
            case MsgPack.Nil:
                return null;
            case MsgPack.False:
            case MsgPack.True:
                return this.bool(code);
            case MsgPack.Float:
            case MsgPack.Double:
            case MsgPack.Uint8:
            case MsgPack.Uint16:
            case MsgPack.Uint32:
            case MsgPack.Uint64:
            case MsgPack.Int8:
            case MsgPack.Int16:
            case MsgPack.Int32:
            case MsgPack.Int64:
                return this.number(code);
            case MsgPack.Bin8:
            case MsgPack.Bin16:
            case MsgPack.Bin32:
                return this.bytes(code);
            case MsgPack.Str8:
            case MsgPack.Str16:
            case MsgPack.Str32:
                return this.string(code);
        }
        throw new Error(`Unrecognized type byte: ${prettyByte(code)} decoding any`);
	}
    
    private decodeNumber() : number {
        let code = this.readU8();
        return this.number(code);
    }

    private number(code : number ) : number {
        if (code === MsgPack.Nil) {
            return 0
        }
        if (MsgPack.isFixedNum(code)) {
            return code;
        }
        switch (code) {
            case MsgPack.Uint8:
                return this.readU8();
            case MsgPack.Int8:
                return this.readI8();
            case MsgPack.Uint16:
                return this.readU16();
            case MsgPack.Int16:
                return this.readI16();
            case MsgPack.Uint32:
                return this.readU32();
            case MsgPack.Int32:
                return this.readI32();
            case MsgPack.Uint64:
                return this.readU64();
            case MsgPack.Int64:
                return this.readI64();
            case MsgPack.Float:
                return this.readF32();
            case MsgPack.Double:
                return this.readF64();    
        }
        throw new Error(`Unrecognized type byte: ${prettyByte(code)}`);
    }

    private decodeString() : string {
        let code = this.readU8();
        return this.string(code);
    }

    private string(code : number) : string {
        let len = this.bytesLen(code);
        let str = "";
        if (len > 0)  {
            if (len > MsgPack.TEXT_DECODER_THRESHOLD) {
                str = MsgPack.utf8DecodeTD(this._bytes, this._pos, len);
            } else {
                str = MsgPack.utf8DecodeJs(this._bytes, this._pos, len);
            }
        }
        this._pos += len;
        return str;
    }

    private decodeBytes() : Uint8Array {
        let code = this.readU8();
        return this.bytes(code);
    }

    private bytes(code : number) : Uint8Array {
        let len = this.bytesLen(code);
        let bytes = this._bytes.subarray(this._pos, this._pos + len);
        this._pos += len;
        return bytes;
    }

    private bytesLen(c : number) : number {
        if (c == MsgPack.Nil ) {
            return -1;
        }
    
        if (MsgPack.isFixedString(c)) {
            return c & MsgPack.FixedStrMask;
        }
    
        switch (c) {
        case MsgPack.Str8, MsgPack.Bin8:
            return this.readU8();
        case MsgPack.Str16, MsgPack.Bin16:
            return this.readU16();
        case MsgPack.Str32, MsgPack.Bin32:
            return this.readU32();
        }
        throw new Error(`invalid code type byte: ${prettyByte(c)} decoding string/bytes length`);
    }

    private readU8() : number {
        const value = this._view.getUint8(this._pos);
        this._pos++;
        return value;
    }

    private readI8() : number {
        const value = this._view.getInt8(this._pos);
        this._pos++;
        return value;
    }

    private readU16() : number {
        const value = this._view.getUint16(this._pos);
        this._pos++;
        return value;
    }

    private readI16() : number {
        const value = this._view.getInt16(this._pos);
        this._pos++;
        return value;
    }

    private readU32() : number {
        const value = this._view.getUint32(this._pos);
        this._pos++;
        return value;
    }

    private readI32() : number {
        const value = this._view.getInt32(this._pos);
        this._pos++;
        return value;
    }

    private readU64() : number {
        const high = this._view.getUint32(this._pos);
        const low = this._view.getUint32(this._pos + 4);
        const value = high * 0x1_0000_0000 + low;
        this._pos+=4;
        return value;
    }

    private readI64() : number {
        const high = this._view.getInt32(this._pos);
        const low = this._view.getUint32(this._pos + 4);
        const value = high * 0x1_0000_0000 + low;
        this._pos+=4;
        return value;
    }

    private readF32() : number {
        const value = this._view.getFloat32(this._pos);
        this._pos++;
        return value;
    }

    private readF64() : number {
        const value = this._view.getFloat64(this._pos);
        this._pos++;
        return value;
    }
}