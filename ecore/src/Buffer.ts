
// The living standard of whatwg streams says
// ReadableStream is also AsyncIterable, but
// no browser implements it.
export type ReadableStreamLike<T> = AsyncIterable<T> | ReadableStream<T>;

export type BufferLike = ArrayLike<number> | Uint8Array | ArrayBufferView | ArrayBuffer
