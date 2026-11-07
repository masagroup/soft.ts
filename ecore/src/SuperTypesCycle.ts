// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { EClass, EObject, isEClass, isEObjectList } from "./internal.js"

const VISITING = 1 // a super type of the class being visited
const VISITED = 2

// checkSuperTypes returns an error if the super types of a class among objects lead to a cycle, null
// otherwise: a class among its own super types, directly or not, is invalid. The decoders check
// the classes they decode with it. The super types are read without resolving their proxies, each
// class is visited once, and the walk is iterative: a long chain of super types does not overflow
// the stack.
export function checkSuperTypes(objects: Iterable<EObject>): Error | null {
    let states: Map<EClass, number> = null
    const stack: { eClass: EClass; superTypes: any[]; next: number }[] = []
    const push = (eClass: EClass) => {
        states.set(eClass, VISITING)
        const superTypes = eClass.getESuperTypes()
        const unresolved = isEObjectList(superTypes) ? superTypes.getUnResolvedList() : superTypes
        stack.push({ eClass: eClass, superTypes: unresolved.toArray(), next: 0 })
    }
    for (const object of objects) {
        if (!isEClass(object)) {
            continue
        }
        if (!states) {
            states = new Map<EClass, number>()
        }
        if (states.has(object)) {
            continue
        }
        push(object)
        while (stack.length > 0) {
            const top = stack[stack.length - 1]
            if (top.next == top.superTypes.length) {
                states.set(top.eClass, VISITED)
                stack.pop()
                continue
            }
            const superType = top.superTypes[top.next++]
            if (!isEClass(superType)) {
                continue
            }
            const state = states.get(superType)
            if (state == VISITING) {
                return new Error("invalid class '" + superType.getName() + "': a cycle of super types")
            } else if (state === undefined) {
                push(superType)
            }
        }
    }
    return null
}
