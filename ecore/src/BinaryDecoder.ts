// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { Err, Ok, Result } from "ts-results-es"
import { BinaryFeatureKind, getBinaryCodecFeatureKind } from "./BinaryFeatureKind.js"
import {
    BufferLike,
    EClass,
    EcoreUtils,
    EDataType,
    EDecoder,
    EDiagnosticImpl,
    EFactory,
    EList,
    EObject,
    EObjectInternal,
    EPackage,
    EResource,
    EStructuralFeature,
    getPackageRegistry,
    ImmutableEList,
    isEAttribute,
    isEClass,
    isEPackage,
    ReadableStreamLike,
    URI
} from "./internal.js"
import { Decoder } from "./msgpack/Decoder.js"
import { ensureAsyncIterable } from "./utils/Stream.js"
import { ensureUint8Array } from "./utils/TypedArray.js"

function arraysAreEqual(a: Uint8Array, b: Uint8Array) {
    if (a.byteLength !== b.byteLength) return false
    return a.every((val, i) => val === b[i])
}

const binaryVersion = 0
const binarySignature = Uint8Array.from([137, 101, 109, 102, 10, 13, 26, 10])

class PackageData {
    ePackage: EPackage
    eClassData: ClassData[]
}

class ClassData {
    eClass: EClass
    eFactory: EFactory
    featureData: FeatureData[]
}

class FeatureData {
    featureID: number
    eFeature: EStructuralFeature
    featureKind: BinaryFeatureKind
    eFactory: EFactory
    eDataType: EDataType
}

export class BinaryDecoder implements EDecoder {
    private _resource: EResource
    private _decoder: Decoder
    private _objects: EObject[] = []
    private _isResolveProxies: boolean = false
    private _packageData: PackageData[] = []
    private _baseURI: URI
    private _uris: URI[] = []
    private _enumLiterals: string[] = []

    constructor(eContext: EResource, options?: Map<string, any>) {
        this._resource = eContext
        this._baseURI = this._resource.getURI()
    }

    decode(buffer: BufferLike): Result<EResource, Error> {
        try {
            this.setBuffer(buffer)
            this.decodeSignature()
            this.decodeVersion()

            // objects
            const size = this._decoder.decodeNumber()
            const objects = []
            for (let i = 0; i < size; i++) {
                objects.push(this.decodeEObject())
            }

            // add objects to resource
            this._resource.eContents().addAll(new ImmutableEList(objects))
            return Ok(this._resource)
        } catch (e) {
            switch (e.constructor) {
                case Error: {
                    const err = e as Error
                    this._resource.getErrors().add(new EDiagnosticImpl(err.message, this._resource.getURI().toString(), -1, -1))
                }
            }
            return Err(e)
        }
    }

    decodeObject(buffer: BufferLike): Result<EObject, Error> {
        try {
            this.setBuffer(buffer)
            this.decodeSignature()
            this.decodeVersion()
            return Ok(this.decodeEObject())
        } catch (e) {
            return Err(e)
        }
    }

    async decodeAsync(streamLike: ReadableStreamLike<BufferLike>): Promise<EResource> {
        // convert stream to buffer
        const buffer = await this.getBuffer(streamLike)
        // set decoder buffer
        this.setBuffer(buffer)

        // decode
        this.decodeSignature()
        this.decodeVersion()

        // objects
        const size = this.decodeNumber()
        const objects = []
        for (let i = 0; i < size; i++) {
            objects.push(this.decodeEObject())
        }

        // add objects to resource
        this._resource.eContents().addAll(new ImmutableEList(objects))
        return this._resource
    }

    async decodeObjectAsync(streamLike: ReadableStreamLike<BufferLike>): Promise<EObject> {
        // convert stream to buffer
        const buffer = await this.getBuffer(streamLike)
        // set decoder buffer
        this.setBuffer(buffer)
        // decode
        this.decodeSignature()
        this.decodeVersion()
        return this.decodeEObject()
    }

    private async getBuffer(streamLike: ReadableStreamLike<BufferLike>): Promise<Uint8Array> {
        // retrieve all stream arrays
        const arrays = []
        const iterable = ensureAsyncIterable(streamLike)
        for await (const bufferLike of iterable) {
            arrays.push(ensureUint8Array(bufferLike))
        }

        // concat arrays to buffer
        const bufferLength = arrays.reduce((total, array) => total + array.byteLength, 0)
        const buffer = new Uint8Array(bufferLength)
        let offset = 0
        arrays.forEach((array) => {
            buffer.set(array, offset)
            offset += array.length
        })
        return buffer
    }

    private setBuffer(buffer: ArrayLike<number> | BufferSource): void {
        this._decoder = new Decoder(buffer)
    }

    private decodeSignature() {
        const signature = this.decodeBytes()
        if (!arraysAreEqual(signature, binarySignature)) {
            throw Error("Invalid signature for a binary EMF serialization")
        }
    }

    private decodeVersion() {
        const version = this.decodeNumber()
        if (version != binaryVersion) {
            throw Error("Invalid version for a binary EMF serialization")
        }
    }

    private decodeEObject(): EObject {
        const id = this.decodeNumber()
        if (id == -1) {
            return null
        } else if (this._objects.length <= id) {
            const eClassData = this.decodeClass()
            const eObject = eClassData.eFactory.create(eClassData.eClass) as EObjectInternal
            let eResult: EObject = eObject
            let featureID = this.decodeNumber() - 1

            if (featureID == -3) {
                // proxy object
                const eProxyURI = this.decodeURI()
                eObject.eSetProxyURI(eProxyURI)
                if (this._isResolveProxies) {
                    eResult = EcoreUtils.resolveInResource(eObject, this._resource)
                    this._objects.push(eResult)
                } else {
                    this._objects.push(eObject)
                }
                featureID = this.decodeNumber() - 1
            } else {
                // standard object
                this._objects.push(eObject)
            }

            if (featureID == -2) {
                // object id attribute
                const objectID = this.decodeAny()
                const objectIDManager = this._resource.getObjectIDManager()
                if (objectIDManager) {
                    objectIDManager.setID(eObject, objectID)
                }
                featureID = this.decodeNumber() - 1
            }
            for (; featureID != -1; featureID = this.decodeNumber() - 1) {
                let eFeatureData = eClassData.featureData[featureID]
                if (!eFeatureData) {
                    eFeatureData = this.newFeatureData(eClassData, featureID)
                    eClassData.featureData[featureID] = eFeatureData
                }
                this.decodeFeatureValue(eObject, eFeatureData)
            }
            return eResult
        } else {
            return this._objects[id]
        }
    }

    private decodeEObjects(list: EList<EObject>) {
        let size = this.decodeNumber()
        const objects = []
        for (let i = 0; i < size; i++) {
            objects.push(this.decodeEObject())
        }

        // If the list is empty, we need to add all the objects,
        // otherwise, the reference is bidirectional and the list is at least partially populated.
        const existingSize = list.size()
        if (existingSize == 0) {
            list.addAll(new ImmutableEList<EObject>(objects))
        } else {
            const indices = new Array(existingSize)
            const existingObjects = [...list.toArray()]
            let duplicateCount = 0
            LOOP: for (let i = 0; i < size; i++) {
                const o = objects[i]
                let count = duplicateCount
                for (let j = 0; j < existingSize; j++) {
                    const existing = existingObjects[j]
                    if (existing == o) {
                        if (duplicateCount != count) {
                            list.moveTo(count, duplicateCount)
                        }
                        indices[duplicateCount] = i
                        duplicateCount++
                        existingObjects[j] = null
                        continue LOOP
                    } else if (existing) {
                        count++
                    }
                }
                objects[i - duplicateCount] = o
            }

            size -= existingSize
            list.addAll(new ImmutableEList<EObject>(objects))
            for (let i = 0; i < existingSize; i++) {
                const newPosition = indices[i]
                const oldPosition = size + i
                if (newPosition != oldPosition) {
                    list.moveTo(oldPosition, newPosition)
                }
            }
        }
    }

    private decodeClass(): ClassData {
        const ePackageData = this.decodePackage()
        const id = this.decodeNumber()
        let eClassData = ePackageData.eClassData[id]
        if (!eClassData) {
            eClassData = this.newClassData(ePackageData)
            ePackageData.eClassData[id] = eClassData
        }
        return eClassData
    }

    private decodePackage(): PackageData {
        const id = this.decodeNumber()
        if (this._packageData.length <= id) {
            // decode package parameters
            const nsURI = this.decodeString()
            const uri = this.decodeURI()

            // retrieve package
            const eResourceSet = this._resource.eResourceSet()
            const packageRegistry = eResourceSet ? eResourceSet.getPackageRegistry() : getPackageRegistry()
            let ePackage = packageRegistry.getPackage(nsURI)
            if (!ePackage) {
                const eObject = eResourceSet.getEObject(uri, true)
                if (isEPackage(eObject)) {
                    ePackage = eObject
                }
            }

            // create new package data
            const ePackageData = this.newPackageData(ePackage)
            this._packageData.push(ePackageData)
            return ePackageData
        } else {
            return this._packageData[id]
        }
    }

    private decodeFeatureValue(eObject: EObjectInternal, featureData: FeatureData) {
        switch (featureData.featureKind) {
            case BinaryFeatureKind.bfkObjectContainer:
            case BinaryFeatureKind.bfkObjectContainerProxy:
            case BinaryFeatureKind.bfkObject:
            case BinaryFeatureKind.bfkObjectProxy:
            case BinaryFeatureKind.bfkObjectContainment:
            case BinaryFeatureKind.bfkObjectContainmentProxy:
                eObject.eSetFromID(featureData.featureID, this.decodeEObject())
                break
            case BinaryFeatureKind.bfkObjectList:
            case BinaryFeatureKind.bfkObjectListProxy:
            case BinaryFeatureKind.bfkObjectContainmentList:
            case BinaryFeatureKind.bfkObjectContainmentListProxy: {
                const l = eObject.eGetFromID(featureData.featureID, false, false) as EList<any>
                this.decodeEObjects(l)
                break
            }
            case BinaryFeatureKind.bfkData: {
                const valueStr = this.decodeString()
                const value = featureData.eFactory.createFromString(featureData.eDataType, valueStr)
                eObject.eSetFromID(featureData.featureID, value)
                break
            }
            case BinaryFeatureKind.bfkDataList: {
                const size = this.decodeNumber()
                const values = []
                for (let i = 0; i < size; i++) {
                    const valueStr = this.decodeString()
                    const value = featureData.eFactory.createFromString(featureData.eDataType, valueStr)
                    values.push(value)
                }
                const l = eObject.eGetResolve(featureData.eFeature, false) as EList<any>
                l.addAll(new ImmutableEList<any>(values))
                break
            }
            case BinaryFeatureKind.bfkEnum: {
                const id = this.decodeNumber()
                let valueStr: string
                if (this._enumLiterals.length <= id) {
                    valueStr = this.decodeString()
                    this._enumLiterals.push(valueStr)
                } else {
                    valueStr = this._enumLiterals[id]
                }
                const value = featureData.eFactory.createFromString(featureData.eDataType, valueStr)
                eObject.eSetFromID(featureData.featureID, value)
                break
            }

            case BinaryFeatureKind.bfkDate:
                eObject.eSetFromID(featureData.featureID, this.decodeDate())
                break
            case BinaryFeatureKind.bfkNumber:
                eObject.eSetFromID(featureData.featureID, this.decodeNumber())
                break
            case BinaryFeatureKind.bfkBool:
                eObject.eSetFromID(featureData.featureID, this.decodeBoolean())
                break
            case BinaryFeatureKind.bfkString:
                eObject.eSetFromID(featureData.featureID, this.decodeString())
                break
            case BinaryFeatureKind.bfkByteArray:
                eObject.eSetFromID(featureData.featureID, this.decodeBytes())
                break
        }
    }

    private newClassData(ePackageData: PackageData): ClassData {
        const className = this.decodeString()
        const ePackage = ePackageData.ePackage
        const eClassifier = ePackage.getEClassifier(className)
        if (isEClass(eClassifier)) {
            const classData = new ClassData()
            classData.eClass = eClassifier
            classData.eFactory = ePackage.getEFactoryInstance()
            classData.featureData = new Array(eClassifier.getFeatureCount())
            return classData
        }
        throw new Error(`Unable to find class ${className} in package  ${ePackage.getNsURI()}`)
    }

    private newPackageData(ePackage: EPackage): PackageData {
        const packageData = new PackageData()
        packageData.ePackage = ePackage
        packageData.eClassData = new Array(ePackage.getEClassifiers().size())
        return packageData
    }

    private newFeatureData(eClassData: ClassData, featureID: number): FeatureData {
        const eFeatureName = this.decodeString()
        const eFeature = eClassData.eClass.getEStructuralFeatureFromName(eFeatureName)
        if (!eFeature) throw new Error(`Unable to find feature ${eFeatureName} in ${eClassData.eClass.getName()} EClass`)
        const featureData = new FeatureData()
        featureData.eFeature = eFeature
        featureData.featureID = featureID
        featureData.featureKind = getBinaryCodecFeatureKind(eFeature)
        if (isEAttribute(eFeature)) {
            featureData.eDataType = eFeature.getEAttributeType()
            featureData.eFactory = featureData.eDataType.getEPackage().getEFactoryInstance()
        }
        return featureData
    }

    private decodeURI(): URI {
        const id = this.decodeNumber()
        if (id == -1) return null
        else {
            let uri: URI
            if (this._uris.length <= id) {
                // build uri
                const uriStr = this.decodeString()
                if (uriStr == "") {
                    uri = this._baseURI
                } else {
                    uri = this.resolveURI(new URI(uriStr))
                }
                // add it to the uri array
                this._uris.push(uri)
            } else {
                uri = this._uris[id]
            }
            return new URI(uri.toString() + "#" + this.decodeString())
        }
    }

    private resolveURI(uri: URI): URI {
        return this._baseURI ? this._baseURI.resolve(uri) : uri
    }

    private decodeAny(): any {
        return this._decoder.decode()
    }

    private decodeBoolean(): boolean {
        return this._decoder.decodeBoolean()
    }

    private decodeNumber(): number {
        return this._decoder.decodeNumber()
    }

    private decodeString(): string {
        return this._decoder.decodeString()
    }

    private decodeBytes(): Uint8Array {
        return this._decoder.decodeBinary()
    }

    private decodeDate(): Date {
        return this._decoder.decode() as Date
    }
}
