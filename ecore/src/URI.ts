import { utf8Count, utf8Decode, utf8Encode } from "./utils/UTF8.js"

export type URIParts = Partial<
    Readonly<{
        scheme: string
        user: string
        host: string
        port: string
        path: string
        query: string
        fragment: string
        // the uri has an authority, even an empty one as in file:///path
        hasAuthority: boolean
    }>
>

const uriRegExp = new RegExp(
    "(([a-zA-Z][a-zA-Z0-9+.-]*):)?" + // scheme:
        "([^?#]*)" + // authority and path
        "(?:\\?([^#]*))?" + // ?query
        "(?:#(.*))?"
) // #fragment
const authorityAndPathRegExp = new RegExp("^//([^/]*)(/.*)?$")
const authorityRegExp = new RegExp(
    "(?:([^@:]*)(?::([^@]*))?@)?" + // username, password
        "(\\[[^\\]]*\\]|[^\\[:]*)" + // host (IP-literal (e.g. '['+IPv6+']',dotted-IPv4, or named host)
        "(?::(\\d*))?"
) // port)

// a windows absolute path: a drive letter followed by a separator
const windowsDriveRegExp = /^[a-zA-Z]:\//
// the path of a file uri of a windows absolute path: /C:/...
const windowsDrivePathRegExp = /^\/[a-zA-Z]:\//

function percentDecode(s: string): string {
    if (s.indexOf("%") == -1) {
        return s
    }
    try {
        return decodeURIComponent(s)
    } catch {
        // not a valid percent-encoded sequence: keep it as it is
        return s
    }
}

// escapes the characters of a file path that can't appear as they are in a uri path
function percentEncodePath(p: string): string {
    return encodeURI(p).replace(/[?#]/g, (c) => encodeURIComponent(c))
}

export function uriToFilePath(uri: URI): string {
    const normalized = uri.normalize()
    let path = percentDecode(normalized.path)
    if (windowsDrivePathRegExp.test(path)) {
        // file:///C:/dir/file -> C:/dir/file
        path = path.slice(1)
    } else if (normalized.host) {
        // file://server/share/file -> //server/share/file
        path = "//" + normalized.host + path
    }
    return path
}

function parseURI(u: string): URIParts {
    const uri = u.replace(/\\/g, "/")
    if (windowsDriveRegExp.test(uri)) {
        // a windows absolute path, not a single letter scheme
        return { path: uri }
    }
    const uriMatchs = uriRegExp.exec(uri)
    if (!uriMatchs) {
        throw new Error(`invalid uri: ${uri}`)
    }
    const scheme = uriMatchs[2] ?? ""
    let path = ""
    let host = ""
    let port = ""
    let user = ""
    let hasAuthority = false
    const authorityAndPath = uriMatchs[3] ?? ""
    const authorityAndPathMatches = authorityAndPathRegExp.exec(authorityAndPath)
    if (!authorityAndPathMatches) {
        path = authorityAndPath
    } else {
        hasAuthority = true
        const authority = authorityAndPathMatches[1]
        const authorityMatches = authorityRegExp.exec(authority)
        if (!authorityMatches) {
            throw new Error(`invalid authority: ${authority}`)
        }
        if (authorityMatches[1]) {
            user = authorityMatches[1]
            if (authorityMatches[2]) {
                user += ":" + authorityMatches[2]
            }
        }
        host = authorityMatches[3] ?? ""
        port = authorityMatches[4] ?? ""
        path = authorityAndPathMatches[2] ?? ""
    }
    return {
        scheme: scheme,
        user: user,
        host: host,
        port: port,
        path: path,
        query: uriMatchs[4] ?? "",
        fragment: uriMatchs[5] ?? "",
        hasAuthority: hasAuthority
    }
}

function serializeURI(parts: URIParts): string {
    if (!parts) {
        return ""
    }
    let uri = ""
    if (parts.scheme) {
        uri += parts.scheme + ":"
    }
    // an empty authority is kept: file:///path is not file:/path
    const hasAuthority = parts.user || parts.host || parts.port || parts.hasAuthority
    if (hasAuthority) {
        uri += "//"
        if (parts.user) {
            uri += parts.user + "@"
        }
        if (parts.host) {
            uri += parts.host
        } else if (parts.user || parts.port) {
            throw new Error("host must be defined")
        }
        if (parts.port) {
            uri += ":" + parts.port
        }
    }
    if (parts.path) {
        const path = parts.path
        // if the URI is not opaque and the path is not already prefixed
        // with a '/', add one.
        if (hasAuthority && path.charAt(0) != "/") {
            uri += "/"
        }
        uri += path
    }
    if (parts.query) {
        uri += "?" + parts.query
    }
    if (parts.fragment) {
        uri += "#" + parts.fragment
    }

    return uri
}

export class URI {
    readonly scheme: string
    readonly user: string
    readonly host: string
    readonly port: string
    readonly path: string
    readonly query: string
    readonly fragment: string
    readonly hasAuthority: boolean
    readonly rawURI: string

    constructor(input?: URIParts | string) {
        let parts: URIParts
        if (typeof input === "string") {
            parts = parseURI(input)
        } else {
            parts = input
        }
        this.scheme = parts?.scheme ?? ""
        this.user = parts?.user ?? ""
        this.host = parts?.host ?? ""
        this.port = parts?.port ?? ""
        this.path = parts?.path ?? ""
        this.query = parts?.query ?? ""
        this.fragment = parts?.fragment ?? ""
        this.hasAuthority = Boolean(parts?.hasAuthority || this.user || this.host || this.port)
        this.rawURI = input ? (typeof input === "string" ? input : serializeURI(parts)) : ""
    }

    toString(): string {
        return this.rawURI
    }

    isOpaque(): boolean {
        return this.path == ""
    }

    isAbsolute(): boolean {
        return this.scheme != ""
    }

    isEmpty(): boolean {
        return this.rawURI == ""
    }

    equals(other: URI): boolean {
        return this.rawURI === other.rawURI
    }

    authority(): string {
        if (!this.host) {
            return ""
        }
        let authority = ""
        if (this.user) {
            authority = this.user + "@"
        }
        authority += this.host
        if (this.port) {
            authority += ":" + this.port
        }
        return authority
    }

    normalize(): URI {
        if (this.isOpaque()) {
            return this
        }
        const np = normalize(this.path)
        if (np == this.path) {
            return this
        }
        return new URI({ ...this.parts(), path: np })
    }

    resolve(ref: URI): URI {
        // Reference to current document (lone fragment): the base with the fragment of ref
        if (!ref.scheme && !ref.hasAuthority && !ref.path && !ref.query && ref.fragment) {
            if (ref.fragment == this.fragment) {
                return this
            }
            return new URI({ ...this.parts(), fragment: ref.fragment })
        }

        // check if opaque
        if (ref.isOpaque() || this.isOpaque()) {
            return ref
        }

        // ref is absolute
        if (ref.scheme) {
            return ref
        }

        // no authority
        if (!ref.hasAuthority) {
            let path = ref.path
            if (!path || path[0] != "/") {
                path = resolvePath(this.path, ref.path, this.isAbsolute())
            }
            return new URI({ ...this.parts(), path: path, query: ref.query, fragment: ref.fragment })
        } else {
            return new URI({ ...ref.parts(), scheme: this.scheme })
        }
    }

    relativize(ref: URI): URI {
        // check if opaque
        if (ref.isOpaque() || this.isOpaque()) {
            return ref
        }

        if (this.scheme != ref.scheme || this.authority() != ref.authority()) {
            return ref
        }

        let bp = normalize(this.path)
        const cp = normalize(ref.path)
        if (bp != cp) {
            // the directory of the base: empty when the base path has no "/"
            bp = bp.substring(0, bp.lastIndexOf("/") + 1)
            if (!cp.startsWith(bp)) {
                return ref
            }
        }
        return new URI({ path: cp.substring(bp.length), query: ref.query, fragment: ref.fragment })
    }

    replacePrefix(oldPrefix: URI, newPrefix: URI): URI {
        if (this.scheme != oldPrefix.scheme || this.user != oldPrefix.user || this.host != oldPrefix.host || this.port != oldPrefix.port)
            return null

        const oldLen = oldPrefix.path.length
        if (this.path.length >= oldLen && this.path.slice(0, oldLen) == oldPrefix.path) {
            return new URI({
                ...newPrefix.parts(),
                path: newPrefix.path + this.path.slice(oldLen),
                query: this.query,
                fragment: this.fragment
            })
        }
        return null
    }

    trimFragment(): URI {
        return new URI({ ...this.parts(), fragment: "" })
    }

    trimQuery(): URI {
        return new URI({ ...this.parts(), query: "" })
    }

    private parts(): URIParts {
        return {
            scheme: this.scheme,
            user: this.user,
            host: this.host,
            port: this.port,
            path: this.path,
            query: this.query,
            fragment: this.fragment,
            hasAuthority: this.hasAuthority
        }
    }
}

function normalize(path: string): string {
    const bytesLength = utf8Count(path)
    const buffer = new Uint8Array(bytesLength)
    utf8Encode(path, buffer, 0)

    // Does this path need normalization?
    const ns = needsNormalization(buffer) // Number of segments
    if (ns < 0) {
        // Nope -- just return it
        return path
    }

    const segs = new Array<number>(ns)
    split(buffer, segs)

    // Remove dots
    removeDots(buffer, segs)

    // Prevent scheme-name confusion
    maybeAddLeadingDot(buffer, segs)

    // Join the remaining segments and return the result
    const newSize = join(buffer, segs)
    const newBuffer = buffer.subarray(0, newSize)
    return utf8Decode(newBuffer, 0, newBuffer.length)
}

const SLASH = 47
const DOT = 46
const COLON = 58

// The following algorithm for path normalization avoids the creation of a
// string object for each segment, as well as the use of a string buffer to
// compute the final result, by using a single char array and editing it in
// place.  The array is first split into segments, replacing each slash
// with '\0' and creating a segment-index array, each element of which is
// the index of the first char in the corresponding segment.  We then walk
// through both arrays, removing ".", "..", and other segments as necessary
// by setting their entries in the index array to -1.  Finally, the two
// arrays are used to rejoin the segments and compute the final result.
//
// This code is based upon src/solaris/native/java/io/canonicalize_md.c

// Check the given path to see if it might need normalization.  A path
// might need normalization if it contains duplicate slashes, a "."
// segment, or a ".." segment.  Return -1 if no further normalization is
// possible, otherwise return the number of segments found.
//
// This method takes a string argument rather than a char array so that
// this test can be performed without invoking path.toCharArray().
function needsNormalization(path: Uint8Array): number {
    const end = path.length - 1 // Index of last char in path
    let normal = true
    let ns = 0 // Number of segments
    let p = 0 // Index of next char in path

    // Skip initial slashes
    while (p <= end) {
        if (path[p] != SLASH) {
            break
        }
        p++
    }

    if (p > 1) {
        normal = false
    }

    // Scan segments
    while (p <= end) {
        // Looking at "." or ".." ?
        if (path[p] == DOT && (p == end || path[p + 1] == SLASH || (path[p + 1] == DOT && (p + 1 == end || path[p + 2] == SLASH)))) {
            normal = false
        }
        ns++

        // Find beginning of next segment
        while (p <= end) {
            const c = path[p]
            p++
            if (c != SLASH) {
                continue
            }

            // Skip redundant slashes
            while (p <= end) {
                if (path[p] != SLASH) {
                    break
                }
                normal = false
                p++
            }
            break
        }
    }
    return normal ? -1 : ns
}

// Split the given path into segments, replacing slashes with nulls and
// filling in the given segment-index array.
//
// Preconditions:
//   segs.length == Number of segments in path
//

// Postconditions:
//
//	All slashes in path replaced by '\0'
//	segs[i] == Index of first char in segment i (0 <= i < segs.length)
function split(path: Uint8Array, segs: Array<number>) {
    const end = path.length - 1 // Index of last char in path
    let p = 0 // Index of next char in path
    let i = 0 // Index of current segment

    // Skip initial slashes
    while (p <= end) {
        if (path[p] != SLASH) {
            break
        }
        path[p] = 0
        p++
    }

    while (p <= end) {
        // Note start of segment
        segs[i] = p
        p++
        i++
        // Find beginning of next segment
        while (p <= end) {
            const c = path[p]
            p++
            if (c != SLASH) {
                continue
            }

            path[p - 1] = 0

            // Skip redundant slashes
            while (p <= end) {
                if (path[p] != SLASH) {
                    break
                }
                path[p] = 0
                p++
            }
            break
        }
    }
}

// Remove "." segments from the given path, and remove segment pairs
// consisting of a non-".." segment followed by a ".." segment.
function removeDots(path: Uint8Array, segs: Array<number>) {
    const ns = segs.length
    const end = path.length - 1
    for (let i = 0; i < ns; i++) {
        let dots = 0 // Number of dots found (0, 1, or 2)

        // Find next occurrence of "." or ".."
        for (let ok = true; ok; ok = i < ns) {
            const p = segs[i]
            if (path[p] == DOT) {
                if (p == end) {
                    dots = 1
                    break
                } else if (path[p + 1] == 0) {
                    dots = 1
                    break
                } else if (path[p + 1] == DOT && (p + 1 == end || path[p + 2] == 0)) {
                    dots = 2
                    break
                }
            }
            i++
        }

        if (i > ns || dots == 0) {
            break
        }

        if (dots == 1) {
            // Remove this occurrence of "."
            segs[i] = -1
        } else {
            // If there is a preceding non-".." segment, remove both that
            // segment and this occurrence of ".."; otherwise, leave this
            // ".." segment as-is.
            let j: number
            for (j = i - 1; j >= 0; j--) {
                if (segs[j] != -1) {
                    break
                }
            }

            if (j >= 0) {
                const q = segs[j]
                if (!(path[q] == DOT && path[q + 1] == DOT && path[q + 2] == 0)) {
                    segs[i] = -1
                    segs[j] = -1
                }
            }
        }
    }
}

// DEVIATION: If the normalized path is relative, and if the first
// segment could be parsed as a scheme name, then prepend a "." segment
function maybeAddLeadingDot(path: Uint8Array, segs: Array<number>) {
    if (path[0] == 0) {
        // The path is absolute
        return
    }

    const ns = segs.length
    let f = 0 // Index of first segment
    while (f < ns) {
        if (segs[f] >= 0) {
            break
        }
        f++
    }

    if (f >= ns || f == 0) {
        // The path is empty, or else the original first segment survived,
        // in which case we already know that no leading "." is needed
        return
    }
    let p = segs[f]
    while (p < path.length && path[p] != COLON && path[p] != 0) {
        p++
    }

    if (p >= path.length || path[p] == 0) {
        // No colon in first segment, so no "." needed
        return
    }

    // At this point we know that the first segment is unused,
    // hence we can insert a "." segment at that position
    path[0] = DOT
    path[1] = 0
    segs[0] = 0
}

// Join the segments in the given path according to the given segment-index
// array, ignoring those segments whose index entries have been set to -1,
// and inserting slashes as needed.  Return the length of the resulting
// path.
//
// Preconditions:
//
//	segs[i] == -1 implies segment i is to be ignored
//	path computed by split, as above, with '\0' having replaced SLASH
//
// Postconditions:
//
//	path[0] .. path[return value] == Resulting path
function join(path: Uint8Array, segs: ArrayLike<number>): number {
    const ns = segs.length // Number of segments
    const end = path.length - 1 // Index of last char in path
    let p = 0 // Index of next path char to write
    if (path[p] == 0) {
        // Restore initial slash for absolute paths
        path[p] = SLASH
        p++
    }
    for (let i = 0; i < ns; i++) {
        let q = segs[i] // Current segment
        if (q == -1) {
            // Ignore this segment
            continue
        }

        if (p == q) {
            // We're already at this segment, so just skip to its end
            while (p <= end && path[p] != 0) {
                p++
            }

            if (p <= end) {
                // Preserve trailing slash
                path[p] = SLASH
                p++
            }
        } else if (p < q) {
            // Copy q down to p
            while (q <= end && path[q] != 0) {
                path[p] = path[q]
                p++
                q++
            }
            if (q <= end) {
                // Preserve trailing slash
                path[p] = SLASH
                p++
            }
        }
    }
    return p
}

function resolvePath(base: string, child: string, isAbsolute: boolean): string {
    const i = base.lastIndexOf("/")
    const cn = child.length
    let path = ""
    if (cn == 0) {
        if (i >= 0) {
            path = base.substring(0, i + 1)
        }
    } else {
        if (i >= 0) {
            path = path + base.substring(0, i + 1)
        }
        path = path + child
    }
    return normalize(path)
}

// creates the uri of the file path p, absolute or relative, posix or windows:
//   /dir/file            -> file:/dir/file
//   C:\dir\file          -> file:/C:/dir/file
//   \\server\share\file  -> file://server/share/file
//   dir/file             -> dir/file
export function createFileURI(p: string): URI {
    if (p === "") {
        return null
    }
    const s = p.replace(/\\/g, "/")
    if (windowsDriveRegExp.test(s)) {
        return new URI({ scheme: "file", path: "/" + percentEncodePath(s) })
    }
    if (s.startsWith("//")) {
        const i = s.indexOf("/", 2)
        const host = i == -1 ? s.slice(2) : s.slice(2, i)
        const path = i == -1 ? "/" : s.slice(i)
        return new URI({ scheme: "file", host: host, path: percentEncodePath(path) })
    }
    if (s.startsWith("/")) {
        return new URI({ scheme: "file", path: percentEncodePath(s) })
    }
    return new URI({ path: percentEncodePath(s) })
}

export function createMemoryURI(p: string): URI {
    return p === "" ? null : new URI({ scheme: "memory", path: p })
}
