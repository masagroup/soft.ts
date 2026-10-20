// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import { describe, expect, test } from "vitest"
import { InheritanceConstants, getInheritanceFactory, getInheritancePackage } from "./internal.js"

// Node and Leaf have Named as first super type: the link feature of Linkable has id 0 in Linkable
// but 1 in Node, the parent feature of Child has id 0 in Child but 1 in Leaf
describe("single valued opposites across multiple inheritance", () => {
    const f = getInheritanceFactory()

    test("feature ids", () => {
        const p = getInheritancePackage()
        expect(InheritanceConstants.LINKABLE__LINK).toBe(0)
        expect(InheritanceConstants.NODE__LINK).toBe(1)
        expect(p.getNode().getFeatureID(p.getLinkable_Link())).toBe(InheritanceConstants.NODE__LINK)
        expect(p.getLeaf().getFeatureID(p.getChild_Parent())).toBe(InheritanceConstants.LEAF__PARENT)
    })

    test("anchor.linked <-> node.link", () => {
        const anchor = f.createAnchor()
        const node = f.createNode()
        node.setName("node")
        anchor.setLinked(node)
        expect(node.getLink()).toBe(anchor)
        expect(node.getName()).toBe("node")

        anchor.setLinked(null)
        expect(node.getLink()).toBeNull()

        node.setLink(anchor)
        expect(anchor.getLinked()).toBe(node)
    })

    test("anchor.linked moves to another node", () => {
        const anchor = f.createAnchor()
        const node1 = f.createNode()
        const node2 = f.createNode()
        anchor.setLinked(node1)
        anchor.setLinked(node2)
        expect(node1.getLink()).toBeNull()
        expect(node2.getLink()).toBe(anchor)
    })

    test("node.link moves to another anchor", () => {
        // the old node of the anchor is removed by eBasicInverseAdd of AnchorImpl
        const anchor = f.createAnchor()
        const node1 = f.createNode()
        const node2 = f.createNode()
        anchor.setLinked(node1)
        node2.setLink(anchor)
        expect(anchor.getLinked()).toBe(node2)
        expect(node1.getLink()).toBeNull()
    })

    test("anchor.unSetLinked", () => {
        const anchor = f.createAnchor()
        const node = f.createNode()
        anchor.setLinked(node)
        anchor.unSetLinked()
        expect(anchor.eIsSet(getInheritancePackage().getAnchor_Linked())).toBeFalsy()
        expect(node.getLink()).toBeNull()
    })

    test("parent.child <-> leaf.parent", () => {
        const parent = f.createParent()
        const leaf = f.createLeaf()
        parent.setChild(leaf)
        expect(leaf.getParent()).toBe(parent)
        expect(leaf.eContainer()).toBe(parent)

        const other = f.createParent()
        leaf.setParent(other)
        expect(parent.getChild()).toBeNull()
        expect(other.getChild()).toBe(leaf)

        other.setChild(null)
        expect(leaf.getParent()).toBeNull()
        expect(leaf.eContainer()).toBeNull()
    })
})
