// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

export class XMLNamespaces {
    private _namespaces: { prefix: string; uri: string }[] = []
    private _namespacesSize: number = 0
    private _currentContext: number = -1
    private _contexts: number[] = []

    pushContext(): void {
        this._currentContext++
        if (this._currentContext >= this._contexts.length) {
            this._contexts.push(this._namespacesSize)
        } else {
            this._contexts[this._currentContext] = this._namespacesSize
        }
    }

    popContext(): { prefix: string; uri: string }[] {
        let oldPrefixSize = this._namespacesSize
        this._namespacesSize = this._contexts[this._currentContext]
        this._currentContext--
        return this._namespaces.slice(this._namespacesSize, oldPrefixSize)
    }

    declarePrefix(prefix: string, uri: string): boolean {
        for (let i = this._namespacesSize; i > this._contexts[this._currentContext]; i--) {
            let p = this._namespaces[i - 1]
            if (p.prefix == prefix) {
                p.uri = uri
                return true
            }
        }
        this._namespacesSize++
        if (this._namespacesSize > this._namespaces.length) {
            this._namespaces.push({ prefix: prefix, uri: uri })
        } else {
            this._namespaces[this._namespacesSize] = {
                prefix: prefix,
                uri: uri,
            }
        }
        return false
    }

    getPrefix(uri: string): string {
        for (let i = this._namespacesSize; i > 0; i--) {
            let p = this._namespaces[i - 1]
            if (p.uri == uri) {
                return p.prefix
            }
        }
        return null
    }

    getURI(prefix: string): string {
        for (let i = this._namespacesSize; i > 0; i--) {
            let p = this._namespaces[i - 1]
            if (p.prefix == prefix) {
                return p.uri
            }
        }
        return null
    }
}
