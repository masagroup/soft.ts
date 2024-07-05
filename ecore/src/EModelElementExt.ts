// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EAnnotation, EModelElementImpl, ENamedElement, EObject, EObjectList, EStructuralFeature } from "./internal.js"

function isEAnnotation(eObject: EObject): eObject is EAnnotation {
    return "details" in eObject
}

function isENamedElement(eObject: EObject): eObject is ENamedElement {
    return "name" in eObject
}

export class EModelElementExt extends EModelElementImpl {
    constructor() {
        super()
    }

    getEAnnotation(source: string): EAnnotation {
        if (this._eAnnotations) {
            for (const annotation of this._eAnnotations) {
                if (annotation.source == source) {
                    return annotation
                }
            }
        }
        return null
    }

    eObjectForFragmentSegment(uriFragmentSegment: string): EObject {
        if (uriFragmentSegment && uriFragmentSegment.length > 0) {
            // Is the first character a special character, i.e., something other than '@'?
            let firstCharacter = uriFragmentSegment.charAt(0)
            if (firstCharacter != "@") {
                // Is it the start of a source URI of an annotation?
                if (firstCharacter == "%") {
                    // Find the closing '%' and make sure it's not just the opening '%'
                    let index = uriFragmentSegment.lastIndexOf("%")
                    let hasCount = false
                    if (index != 0) {
                        hasCount = uriFragmentSegment[index + 1] == "."
                        if (index == uriFragmentSegment.length - 1 || hasCount) {
                            // Decode all encoded characters.
                            let source = ""
                            let encodedSource = uriFragmentSegment.slice(1, index)
                            if (encodedSource != "%") {
                                source = decodeURI(encodedSource)
                            }

                            // Check for a count, i.e., a '.' followed by a number.
                            let count = 0
                            if (hasCount) {
                                let i = parseInt(uriFragmentSegment.slice(index + 2))
                                if (!isNaN(i)) {
                                    count = i
                                }
                            }

                            // Look for the annotation with the matching source.
                            for (const eObject of this.eContents()) {
                                if (isEAnnotation(eObject)) {
                                    let otherSource = eObject.source
                                    if (eObject.source == source) {
                                        if (count == 0) {
                                            return eObject
                                        }
                                        count--
                                    }
                                }
                            }
                            return null
                        }
                    }
                }

                // Look for trailing count.
                let index = uriFragmentSegment.lastIndexOf(".")
                let name = index != -1 ? uriFragmentSegment.slice(0, index) : uriFragmentSegment
                let count = 0
                if (index != -1) {
                    let i = parseInt(uriFragmentSegment.slice(index + 1))
                    if (isNaN(i)) {
                        name = uriFragmentSegment
                    } else {
                        count = i
                    }
                }

                if (name == "%") {
                    name = ""
                } else {
                    name = encodeURI(name)
                }

                for (const eObject of this.eContents()) {
                    if (isENamedElement(eObject)) {
                        if (eObject.name == name) {
                            if (count == 0) {
                                return eObject
                            }
                            count--
                        }
                    }
                }
                return null
            }
        }
        return super.eObjectForFragmentSegment(uriFragmentSegment)
    }

    eURIFragmentSegment(feature: EStructuralFeature, o: EObject): string {
        if (isENamedElement(o)) {
            let count = 0
            let name = o.name
            for (const otherObject of (this.eContents() as EObjectList<EObject>).getUnResolvedList()) {
                if (otherObject == o) {
                    break
                }
                if (isENamedElement(otherObject) && otherObject.name == name) {
                    count++
                }
            }
            if (name.length == 0) {
                name = "%"
            } else {
                name = encodeURI(name)
            }
            if (count > 0) {
                return name + "." + count.toString()
            }
            return name
        }
        if (isEAnnotation(o)) {
            let count = 0
            for (const otherObject of this.eContents()) {
                if (otherObject == o) {
                    break
                }
                if (isEAnnotation(otherObject) && otherObject.source == o.source) {
                    count++
                }
            }

            let result = "%"
            if (!o.source || o.source.length == 0) {
                result += "%"
            } else {
                result += encodeURI(o.source)
            }
            result += "%"
            if (count > 0) {
                result += "." + count.toString()
            }
            return result
        }
        return super.eURIFragmentSegment(feature, o)
    }
}
