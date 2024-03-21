export type URIParts = Partial<
    Readonly<{
        scheme: string
        user: string
        host: string
        port: string
        path: string
        query: string
        fragment: string
    }>
>

var uriRegExp = new RegExp(
    "(([a-zA-Z][a-zA-Z0-9+.-]*):)?" + // scheme:
        "([^?#]*)" + // authority and path
        "(?:\\?([^#]*))?" + // ?query
        "(?:#(.*))?",
) // #fragment
var authorityAndPathRegExp = new RegExp("^//([^/]*)(/.*)?$")
var authorityRegExp = new RegExp(
    "(?:([^@:]*)(?::([^@]*))?@)?" + // username, password
        "(\\[[^\\]]*\\]|[^\\[:]*)" + // host (IP-literal (e.g. '['+IPv6+']',dotted-IPv4, or named host)
        "(?::(\\d*))?",
) // port)

export function uriToFilePath(uri: URI): string {
    let path = uri.normalize().path
    if (process.platform == "win32" && path[0] == "/") {
        path = path.slice(1)
    }
    return path
}

function parseURI(u: string): URIParts {
    let uri = u.replace(/\\/g, "/")
    let uriMatchs = uriRegExp.exec(uri)
    if (!uriMatchs) {
        throw new Error(`invalid uri: ${uri}`)
    }
    let scheme = uriMatchs[2] ?? ""
    let path = ""
    let host = ""
    let port = ""
    let user = ""
    let authorityAndPath = uriMatchs[3] ?? ""
    let authorityAndPathMatches = authorityAndPathRegExp.exec(authorityAndPath)
    if (!authorityAndPathMatches) {
        path = authorityAndPath
    } else {
        let authority = authorityAndPathMatches[1]
        let authorityMatches = authorityRegExp.exec(authority)
        if (!authorityMatches) {
            throw new Error(`invalid authority: ${authority}`)
        }
        if (authorityMatches[1]) {
            user = authorityMatches[1]
            if (authorityMatches[2]) {
                user += authorityMatches[2]
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
    }
}

function serializeURI(parts: URIParts): string {
    if (!parts) {
        return ""
    }
    let uri = ""
    if (parts.scheme) {
        uri += parts.scheme + "://"
    }
    if (parts.user || parts.host || parts.port) {
        if (parts.user) {
            uri += parts.user + "@"
        }
        if (parts.host) {
            uri += parts.host
        } else {
            throw new Error("host must be defined")
        }
        if (parts.port) {
            uri += ":" + parts.port
        }
    }
    if (parts.path) {
        let path = parts.path
        // if the URI is not opaque and the path is not already prefixed
        // with a '/', add one.
        if (parts.host && parts.path && parts.path.charAt(0) != "/") {
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
    private static emptyURI = new URI()

    readonly scheme: string
    readonly user: string
    readonly host: string
    readonly port: string
    readonly path: string
    readonly query: string
    readonly fragment: string
    readonly rawURI: string

    constructor(input?: URIParts | string) {
        var parts: URIParts
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
        this.rawURI = serializeURI(parts)
    }

    toString(): string {
        return this.rawURI
    }

    isOpaque(): boolean {
        return !this.path
    }

    isAbsolute(): boolean {
        return !this.scheme
    }

    isEmpty(): boolean {
        return this == URI.emptyURI
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
        let np = normalize(this.path)
        if (np == this.path) {
            return this
        }
        return new URI({
            scheme: this.scheme,
            user: this.user,
            host: this.host,
            port: this.port,
            path: np,
            query: this.query,
            fragment: this.fragment,
        })
    }

    resolve(ref: URI): URI {
        // check if opaque first
        if (ref.isOpaque() || this.isOpaque()) {
            return ref
        }

        let refAuthority = ref.authority()
        // Reference to current document (lone fragment)
        if (!ref.scheme && !refAuthority && !ref.path && !ref.fragment && !ref.query) {
            if (!this.fragment || ref.fragment == this.fragment) {
                return this
            }
            return new URI({ fragment: ref.fragment })
        }

        // ref is absolute
        if (ref.scheme) {
            return ref
        }

        // no authority
        if (!refAuthority) {
            let path = ref.path
            if (!path || path[0] != "/") {
                path = resolvePath(this.path, ref.path, this.isAbsolute())
            }
            return new URI({
                scheme: this.scheme,
                user: this.user,
                host: this.host,
                port: this.port,
                path: path,
                query: ref.query,
                fragment: ref.fragment,
            })
        } else {
            return new URI({
                scheme: this.scheme,
                user: ref.user,
                host: ref.host,
                port: ref.port,
                path: ref.path,
                query: ref.query,
                fragment: ref.fragment,
            })
        }
    }

    relativize(ref: URI): URI {
        // check if opaque
        if (ref.isOpaque() || this.isOpaque()) {
            return ref
        }

        if (this.scheme != this.scheme || this.authority() != ref.authority()) {
            return ref
        }

        let bp = normalize(this.path)
        let cp = normalize(ref.path)
        if (bp != cp) {
            let i = bp.lastIndexOf("/")
            if (i != -1) {
                bp = bp.substring(0, i + 1)
            }

            if (!cp.startsWith(bp)) {
                return ref
            }
        }
        return new URI({ path: cp.substring(bp.length), query: ref.query, fragment: ref.fragment })
    }

    trimFragment(): URI {
        return new URI({
            scheme: this.scheme,
            user: this.user,
            host: this.host,
            port: this.port,
            path: this.path,
            query: this.query,
        })
    }

    trimQuery(): URI {
        return new URI({
            scheme: this.scheme,
            user: this.user,
            host: this.host,
            port: this.port,
            path: this.path,
            fragment: this.fragment,
        })
    }
}

function normalize(path: string): string {
    let buffer = Buffer.from(path)

    // Does this path need normalization?
    let ns = needsNormalization(buffer) // Number of segments
    if (ns < 0) {
        // Nope -- just return it
        return path
    }

    let segs = new Array<number>(ns)
    split(buffer, segs)

    // Remove dots
    removeDots(buffer, segs)

    // Prevent scheme-name confusion
    maybeAddLeadingDot(buffer, segs)

    // Join the remaining segments and return the result
    let newSize = join(buffer, segs)
    let newBuffer = buffer.subarray(0, newSize)
    return newBuffer.toString()
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
function needsNormalization(path: Buffer): number {
    let normal = true
    let ns = 0 // Number of segments
    let end = path.length - 1 // Index of last char in path
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
        if (
            path[p] == DOT &&
            (p == end || path[p + 1] == SLASH || (path[p + 1] == DOT && (p + 1 == end || path[p + 2] == SLASH)))
        ) {
            normal = false
        }
        ns++

        // Find beginning of next segment
        while (p <= end) {
            let c = path[p]
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
function split(path: Buffer, segs: Array<number>) {
    let end = path.length - 1 // Index of last char in path
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
            let c = path[p]
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
function removeDots(path: Buffer, segs: Array<number>) {
    let ns = segs.length
    let end = path.length - 1
    for (let i = 0; i < ns; i++) {
        let dots = 0 // Number of dots found (0, 1, or 2)

        // Find next occurrence of "." or ".."
        for (let ok = true; ok; ok = i < ns) {
            let p = segs[i]
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
            var j: number
            for (j = i - 1; j >= 0; j--) {
                if (segs[j] != -1) {
                    break
                }
            }

            if (j >= 0) {
                let q = segs[j]
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
function maybeAddLeadingDot(path: Buffer, segs: Array<number>) {
    if (path[0] == 0) {
        // The path is absolute
        return
    }

    let ns = segs.length
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
function join(path: Buffer, segs: ArrayLike<number>): number {
    let ns = segs.length // Number of segments
    let end = path.length - 1 // Index of last char in path
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
    let i = base.lastIndexOf("/")
    let cn = child.length
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
