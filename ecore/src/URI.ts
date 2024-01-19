


export class URI extends URL {


    isOpaque(): boolean {
        return !this.pathname
    }

    isAbsolute() : boolean {
        return !this.protocol
    }

    authority(): string {
        if (!this.host) {
            return ""
        }
        let hostIndex = this.href.indexOf(this.host)
        let first = this.username ? this.href.indexOf(this.username) : hostIndex
        let last = hostIndex + this.host.length
        return this.href.slice(first, last)
    }

    normalize(): URI {
        if (this.isOpaque()) {
            return this
        }

        let np = normalize(this.pathname)
        if (np == this.pathname) {
            return this
        }

        let result = new URI(this)
        result.pathname = np
        return result
    }


    resolve(ref: URI): URI {
        // check if opaque first
        if (ref.isOpaque() || this.isOpaque()) {
            return ref
        }

        let refAuthority = ref.authority()
        // Reference to current document (lone fragment)
        if (!ref.protocol && !refAuthority && !ref.pathname && !ref.hash && !ref.search) {
            if (!this.hash || ref.hash == this.hash) {
                return this
            }

            let result = new URI(this)
            result.hash = ref.hash
            return result
        }

        // ref is absolute
        if (ref.protocol) {
            return ref
        }

        // no authority
        if (!refAuthority) {
            let pathname = ref.pathname
            if (!pathname || pathname[0] != '/') {
                pathname = resolvePath(this.pathname, ref.pathname, this.isAbsolute())
            }
            let result = new URI(this)
            result.pathname = pathname
            result.search = ref.search
            result.hash = ref.hash
            return result
        } else {
            let result = new URI(ref)
            result.protocol = this.protocol
            return result
        }
    }

    relativize(ref :URI) : URI {
        // check if opaque
        if (ref.isOpaque() || this.isOpaque()) {
            return ref
        }
    
        if (this.protocol != this.protocol || this.authority() != ref.authority()) {
            return ref
        }
    
        let bp = normalize(this.pathname)
        let cp = normalize(ref.pathname)
        if (bp != cp) {
            let i = bp.lastIndexOf("/")
            if (i != -1) {
                bp = bp.substring(0,i+1)
            }

            if (!cp.startsWith(bp)) {
                return ref
            }
        }
        let result = new URI("http://empty.text")
        result.protocol = ""
        result.host = ""
        result.pathname = cp.substring(0, bp.length)
        result.search = ref.search
        result.hash = ref.hash
        return result
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
    let ns = 0                  // Number of segments
    let end = path.length - 1   // Index of last char in path
    let p = 0                   // Index of next char in path

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
        if ((path[p] == DOT) && ((p == end) || ((path[p + 1] == SLASH) || ((path[p + 1] == DOT) && ((p + 1 == end) || (path[p + 2] == SLASH)))))) {
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
    let p = 0               // Index of next char in path
    let i = 0               // Index of current segment

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
                } else if ((path[p + 1] == DOT) && ((p + 1 == end) || (path[p + 2] == 0))) {
                    dots = 2
                    break
                }
            }
            i++
        }

        if ((i > ns) || (dots == 0)) {
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
                if (!((path[q] == DOT) && (path[q + 1] == DOT) && (path[q + 2] == 0))) {
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
    let ns = segs.length      // Number of segments
    let end = path.length - 1 // Index of last char in path
    let p = 0               // Index of next path char to write
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

function resolvePath(base : string, child : string, isAbsolute : boolean) : string {
	let i = base.lastIndexOf('/')
	let cn = child.length
	var path : string
	if (cn == 0) {
		if (i >= 0) {
			path = base.substring(0,i+1)
		}
	} else {
		if (i >= 0) {
			path = path + base.substring(0,i+1)
		}
		path = path + child
	}
	return normalize(path)
}