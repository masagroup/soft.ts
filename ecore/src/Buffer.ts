// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

// The living standard of whatwg streams says
// ReadableStream is also AsyncIterable, but
// no browser implements it.
export type ReadableStreamLike<T> = AsyncIterable<T> | ReadableStream<T>

export type BufferLike = ArrayLike<number> | Uint8Array | ArrayBufferView | ArrayBuffer
