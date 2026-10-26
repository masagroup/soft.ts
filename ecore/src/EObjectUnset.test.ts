// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import {
    AbstractEAdapter,
    BasicEDataTypeList,
    DynamicEObjectImpl,
    EAttribute,
    EClass,
    EDataType,
    EList,
    ENotification,
    EObject,
    EReference,
    EStoreEObjectImpl,
    EStoreList,
    EventType,
    getEcoreFactory,
    getEcorePackage,
    ImmutableEList,
    UNBOUNDED_MULTIPLICITY
} from "./internal.js"

// the eIsSet and eUnset of the dynamic features, as EMF, for the in-memory object (which keeps NIL)
// and a store-backed object without store

interface UnsetTestObject extends EObject {
    setEClass(clz: EClass): void
}

interface UnsetTestKind {
    name: string
    create: () => UnsetTestObject
    // keepsNil is true when the object tells a feature set to null from an unset one
    keepsNil: boolean
}

const unsetTestKinds: UnsetTestKind[] = [
    { name: "Dynamic", create: () => new DynamicEObjectImpl(), keepsNil: true },
    { name: "EStore", create: () => new EStoreEObjectImpl(), keepsNil: false }
]

// UnsetTestModel is a class C, with a single-valued attribute of each kind, a many-valued unsettable
// attribute, an unsettable reference, a containment and a bidirectional reference (to the friendOf
// of a class Child)
class UnsetTestModel {
    c: EClass
    child: EClass
    attribute: EAttribute
    unsettableAttribute: EAttribute
    intAttribute: EAttribute
    // a date has no default value: it can be set to null
    unsettableDate: EAttribute
    unsettableMany: EAttribute
    unsettableReference: EReference
    contents: EReference
    friends: EReference
    friendOf: EReference

    constructor() {
        const factory = getEcoreFactory()
        this.c = factory.createEClass()
        this.c.setName("C")
        this.child = factory.createEClass()
        this.child.setName("Child")

        const newAttribute = (name: string, eType: EDataType): EAttribute => {
            const a = factory.createEAttribute()
            a.setName(name)
            a.setEType(eType)
            return a
        }
        this.attribute = newAttribute("attribute", getEcorePackage().getEString())
        this.attribute.setDefaultValueLiteral("default")
        this.unsettableAttribute = newAttribute("unsettableAttribute", getEcorePackage().getEString())
        this.unsettableAttribute.setDefaultValueLiteral("default")
        this.unsettableAttribute.setUnsettable(true)
        this.intAttribute = newAttribute("intAttribute", getEcorePackage().getEInt())
        this.unsettableDate = newAttribute("unsettableDate", getEcorePackage().getEDate())
        this.unsettableDate.setUnsettable(true)
        this.unsettableMany = newAttribute("unsettableMany", getEcorePackage().getEString())
        this.unsettableMany.setUpperBound(UNBOUNDED_MULTIPLICITY)
        this.unsettableMany.setUnsettable(true)

        const newReference = (name: string, eType: EClass, many: boolean): EReference => {
            const r = factory.createEReference()
            r.setName(name)
            r.setEType(eType)
            if (many) {
                r.setUpperBound(UNBOUNDED_MULTIPLICITY)
            }
            return r
        }
        this.unsettableReference = newReference("unsettableReference", this.child, false)
        this.unsettableReference.setUnsettable(true)
        this.contents = newReference("contents", this.child, true)
        this.contents.setContainment(true)
        this.friends = newReference("friends", this.child, true)
        this.friendOf = newReference("friendOf", this.c, true)
        this.friends.setEOpposite(this.friendOf)
        this.friendOf.setEOpposite(this.friends)

        this.c
            .getEStructuralFeatures()
            .addAll(
                new ImmutableEList([
                    this.attribute,
                    this.unsettableAttribute,
                    this.intAttribute,
                    this.unsettableDate,
                    this.unsettableMany,
                    this.unsettableReference,
                    this.contents,
                    this.friends
                ])
            )
        this.child.getEStructuralFeatures().add(this.friendOf)
    }
}

// UnsetTestAdapter records the notifications of its target
class UnsetTestAdapter extends AbstractEAdapter {
    notifications: ENotification[] = []

    notifyChanged(notification: ENotification): void {
        this.notifications.push(notification)
    }

    last(): ENotification {
        return this.notifications[this.notifications.length - 1]
    }
}

describe.each(unsetTestKinds)("EObject unset $name", (kind) => {
    const setup = () => {
        const m = new UnsetTestModel()
        const create = (clz: EClass) => {
            const o = kind.create()
            o.setEClass(clz)
            return o
        }
        return { m, newC: () => create(m.c), newChild: () => create(m.child) }
    }

    test("many containment", () => {
        const { m, newC, newChild } = setup()
        const o = newC()
        const child = newChild()
        const list = o.eGet(m.contents) as EList<EObject>
        list.add(child)
        expect(child.eContainer()).toBe(o)
        expect(o.eIsSet(m.contents)).toBeTruthy()

        o.eUnset(m.contents)
        expect(o.eIsSet(m.contents)).toBeFalsy()
        expect(child.eContainer()).toBeNull()
        // the list is kept, cleared
        expect(list.size()).toBe(0)
        expect(o.eGet(m.contents)).toBe(list)
    })

    test("many bidirectional", () => {
        const { m, newC, newChild } = setup()
        const o = newC()
        const child = newChild()
        ;(o.eGet(m.friends) as EList<EObject>).add(child)
        expect((child.eGet(m.friendOf) as EList<EObject>).size()).toBe(1)

        o.eUnset(m.friends)
        expect(o.eIsSet(m.friends)).toBeFalsy()
        expect((child.eGet(m.friendOf) as EList<EObject>).size()).toBe(0)
    })

    test("many unsettable", () => {
        const { m, newC } = setup()
        const o = newC()
        // read: not set
        const list = o.eGet(m.unsettableMany) as EList<string>
        expect(o.eIsSet(m.unsettableMany)).toBeFalsy()

        // changed, even to empty: set
        list.add("a")
        list.clear()
        expect(o.eIsSet(m.unsettableMany)).toBeTruthy()

        // unset: not set, the list notifies UNSET
        const adapter = new UnsetTestAdapter()
        o.eAdapters().add(adapter)
        o.eUnset(m.unsettableMany)
        expect(o.eIsSet(m.unsettableMany)).toBeFalsy()
        expect(adapter.last().getEventType()).toBe(EventType.UNSET)
        expect(adapter.last().getFeature()).toBe(m.unsettableMany)
        expect(adapter.last().getOldValue()).toBe(true)
        expect(adapter.last().getNewValue()).toBe(false)

        // set again by a change
        list.add("b")
        expect(o.eIsSet(m.unsettableMany)).toBeTruthy()
    })

    test("set null", () => {
        const { m, newC, newChild } = setup()
        // an unsettable attribute whose type has no default value set to null is set when the
        // object keeps NIL, else unset
        let o = newC()
        o.eSet(m.unsettableDate, null)
        expect(o.eIsSet(m.unsettableDate)).toBe(kind.keepsNil)
        expect(o.eGet(m.unsettableDate)).toBeNull()
        o.eUnset(m.unsettableDate)
        expect(o.eIsSet(m.unsettableDate)).toBeFalsy()

        // a string has no default value, as in Java: a string attribute with a default value set to
        // null, unsettable or not, is set to null when the object keeps NIL, else unset
        for (const attribute of [m.unsettableAttribute, m.attribute]) {
            const o = newC()
            o.eSet(attribute, "a")
            o.eSet(attribute, null)
            expect(o.eIsSet(attribute)).toBe(kind.keepsNil)
            expect(o.eGet(attribute)).toBe(kind.keepsNil ? null : "default")
            o.eUnset(attribute)
            expect(o.eIsSet(attribute)).toBeFalsy()
            expect(o.eGet(attribute)).toBe("default")
        }

        // an unsettable reference set to null
        o = newC()
        o.eSet(m.unsettableReference, null)
        expect(o.eIsSet(m.unsettableReference)).toBe(kind.keepsNil)
        expect(o.eGet(m.unsettableReference)).toBeNull()
        const child = newChild()
        o.eSet(m.unsettableReference, child)
        expect(o.eGet(m.unsettableReference)).toBe(child)
        o.eSet(m.unsettableReference, null)
        expect(o.eIsSet(m.unsettableReference)).toBe(kind.keepsNil)
        o.eUnset(m.unsettableReference)
        expect(o.eIsSet(m.unsettableReference)).toBeFalsy()

        // an attribute whose type has a default value set to null is unset
        o = newC()
        o.eSet(m.intAttribute, 2)
        o.eSet(m.intAttribute, null)
        expect(o.eIsSet(m.intAttribute)).toBeFalsy()
        expect(o.eGet(m.intAttribute)).toBe(0)
    })

    test("notifications", () => {
        const { m, newC } = setup()
        const o = newC()
        const adapter = new UnsetTestAdapter()
        o.eAdapters().add(adapter)

        // an attribute is unset to its default value: SET, UNSET when unsettable
        o.eSet(m.attribute, "a")
        o.eUnset(m.attribute)
        expect(adapter.last().getEventType()).toBe(EventType.SET)
        expect(adapter.last().getOldValue()).toBe("a")
        expect(adapter.last().getNewValue()).toBe("default")

        o.eSet(m.unsettableAttribute, "a")
        o.eUnset(m.unsettableAttribute)
        expect(adapter.last().getEventType()).toBe(EventType.UNSET)
        expect(adapter.last().getOldValue()).toBe("a")
        expect(adapter.last().getNewValue()).toBe("default")

        // the old value of an unset attribute is its default value
        o.eSet(m.attribute, "b")
        expect(adapter.last().getEventType()).toBe(EventType.SET)
        expect(adapter.last().getOldValue()).toBe("default")
        expect(adapter.last().getNewValue()).toBe("b")

        // an attribute whose type has a default value set to null notifies the default value
        o.eSet(m.intAttribute, 2)
        o.eSet(m.intAttribute, null)
        expect(adapter.last().getOldValue()).toBe(2)
        expect(adapter.last().getNewValue()).toBe(0)

        // a reference unset without value still notifies
        const count = adapter.notifications.length
        o.eUnset(m.unsettableReference)
        expect(adapter.notifications.length).toBe(count + 1)
        expect(adapter.last().getEventType()).toBe(EventType.UNSET)
    })
})

describe("unsettable lists", () => {
    test("BasicEDataTypeList", () => {
        // not unsettable: set when not empty
        let l = new BasicEDataTypeList<number>(null, 1, true, false)
        expect(l.isSet()).toBeFalsy()
        l.add(1)
        expect(l.isSet()).toBeTruthy()
        l.unset()
        expect(l.isSet()).toBeFalsy()
        expect(l.isEmpty()).toBeTruthy()

        // unsettable: set from its first change
        l = new BasicEDataTypeList<number>(null, 1, true, true)
        expect(l.isSet()).toBeFalsy()
        l.clear()
        expect(l.isSet()).toBeTruthy()
        l.unset()
        expect(l.isSet()).toBeFalsy()
    })

    test("EStoreList without store", () => {
        const m = new UnsetTestModel()
        const owner = new DynamicEObjectImpl()
        owner.setEClass(m.c)
        const l = new EStoreList<string>(owner, m.unsettableMany, null)
        expect(l.isSet()).toBeFalsy()
        l.clear()
        expect(l.isSet()).toBeTruthy()
        l.unset()
        expect(l.isSet()).toBeFalsy()
    })
})
