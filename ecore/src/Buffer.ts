
export type ReadableStreamLike<T> = AsyncIterable<T> | ReadableStream<T>;

export type BufferLike = ArrayLike<number> | Uint8Array | ArrayBufferView | ArrayBuffer
