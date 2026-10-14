// *****************************************************************************
// Copyright(c) 2026 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

// Removes the import specifiers that oxlint reports as imported but never used.
// It only edits import declarations, unlike oxlint --fix which also removes
// unused local variables.
//
// Usage: node scripts/remove-unused-imports.mjs [path...]   (default: src)

import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"

const paths = process.argv.length > 2 ? process.argv.slice(2) : ["src"]

// oxlint is resolved from this script so that the examples can use ecore's one
const oxlint = join(dirname(createRequire(import.meta.url).resolve("oxlint/package.json")), "bin", "oxlint")

function lint() {
    const dir = mkdtempSync(join(tmpdir(), "unused-imports-"))
    try {
        const config = join(dir, "oxlintrc.json")
        writeFileSync(
            config,
            JSON.stringify({
                plugins: ["typescript"],
                categories: { correctness: "off" },
                rules: { "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }] }
            })
        )
        const result = spawnSync(process.execPath, [oxlint, "-c", config, "-f", "json", ...paths], {
            encoding: "utf8",
            maxBuffer: 64 * 1024 * 1024
        })
        if (result.error) throw result.error
        return JSON.parse(result.stdout)
    } finally {
        rmSync(dir, { recursive: true, force: true })
    }
}

// file -> unused import names with their character offsets
const unused = new Map()
for (const d of lint().diagnostics) {
    if (!/is imported but never used/.test(d.message)) continue
    const name = /'([^']+)'/.exec(d.message)[1]
    const file = resolve(d.filename)
    if (!unused.has(file)) unused.set(file, [])
    for (const l of d.labels) unused.get(file).push({ name, ...l.span })
}

const importRe = /^import\s+(?!type\b)([\s\S]*?)\s+from\s+("[^"]+"|'[^']+')[ \t]*;?[ \t]*\r?\n/gm

let count = 0
for (const [file, spans] of unused) {
    const text = readFileSync(file, "utf8")
    const bytes = Buffer.from(text, "utf8")
    // oxlint spans are byte offsets
    const names = spans.map((s) => {
        if (bytes.subarray(s.offset, s.offset + s.length).toString("utf8") !== s.name) {
            throw new Error(`${file}: '${s.name}' not found at byte offset ${s.offset}`)
        }
        return { name: s.name, offset: bytes.subarray(0, s.offset).toString("utf8").length }
    })
    const out = text.replace(importRe, (decl, clause, source, offset) => {
        const end = offset + decl.length
        const drop = new Set(names.filter((n) => n.offset >= offset && n.offset < end).map((n) => n.name))
        if (drop.size === 0) return decl
        const m = /^(?:([\w$]+)\s*,?\s*)?(?:\{([\s\S]*)\}|(\*\s+as\s+[\w$]+))?$/.exec(clause.trim())
        if (!m) throw new Error(`${file}: unsupported import clause '${clause}'`)
        const [, def, named, ns] = m
        const localName = (s) => s.split(/\s+/).pop()
        const keepDefault = def && !drop.has(def) ? def : null
        const keepNs = ns && !drop.has(localName(ns)) ? ns : null
        const specifiers = (named ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        const keepNamed = specifiers.filter((s) => !drop.has(localName(s)))
        count += (def && !keepDefault ? 1 : 0) + (ns && !keepNs ? 1 : 0) + specifiers.length - keepNamed.length
        const parts = [keepDefault, keepNs, keepNamed.length > 0 ? `{ ${keepNamed.join(", ")} }` : null].filter(Boolean)
        return parts.length > 0 ? `import ${parts.join(", ")} from ${source}\n` : ""
    })
    if (out !== text) writeFileSync(file, out)
}
console.log(`removed ${count} unused imports in ${unused.size} files`)
