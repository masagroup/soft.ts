// *****************************************************************************
// Copyright(c) 2021 MASA Group
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// *****************************************************************************

import * as stream from "stream";

class XMLStringSegment {
    buffer: string = "";
    lineWidth: number = 0;
}

export class XMLString {
    segments: XMLStringSegment[];
    currentSegment: XMLStringSegment = null;
    firstElementMark: XMLStringSegment = null;
    lineWidth: number = Number.MAX_SAFE_INTEGER;
    depth: number = 0;
    indentation: string = "    ";
    indents: string[] = [""];
    lastElementIsStart: boolean = false;
    elementNames: string[] = [];

    constructor() {
        this.currentSegment = new XMLStringSegment();
        this.segments = [this.currentSegment];
    }

    toString(): string {
        let result = "";
        for (const segment of this.segments) {
            result += segment.buffer;
        }
        return result;
    }

    write(w: stream.Writable) {
        for (const segment of this.segments) {
            w.write(segment.buffer);
        }
    }

    add(s: string) {
        if (this.lineWidth != Number.MAX_SAFE_INTEGER) {
            this.currentSegment.lineWidth += s.length;
        }
        this.currentSegment.buffer += s;
    }

    addLine() {
        this.add("\n");
        this.currentSegment.lineWidth = 0;
    }

    startElement(name: string) {
        if (this.lastElementIsStart) {
            this.closeStartElement();
        }
        this.elementNames.push(name);
        if (name.length > 0) {
            this.depth++;
            this.add(this.getElementIndent());
            this.add("<");
            this.add(name);
            this.lastElementIsStart = true;
            if (this.firstElementMark == null) {
                this.firstElementMark = this.mark();
            }
        }
    }

    closeStartElement() {
        this.add(">");
        this.addLine();
        this.lastElementIsStart = false;
    }

    endElement() {
        if (this.lastElementIsStart) {
            this.endEmptyElement();
        } else {
            let name = this.removeLast();
            if (name != "") {
                this.add(this.getElementIndentWithExtra(1));
                this.add("</");
                this.add(name);
                this.add(">");
                this.addLine();
            }
        }
    }

    endEmptyElement() {
        this.removeLast();
        this.add("/>");
        this.addLine();
        this.lastElementIsStart = false;
    }

    removeLast(): string {
        let result = this.elementNames.pop();
        if (result != "") {
            this.depth--;
        }
        return result;
    }

    addAttribute(name: string, value: string) {
        this.startAttribute(name);
        this.addAttributeContent(value);
        this.endAttribute();
    }

    startAttribute(name: string) {
        if (this.currentSegment.lineWidth > this.lineWidth) {
            this.addLine();
            this.add(this.getAttributeIndent());
        } else {
            this.add(" ");
        }
        this.add(name);
        this.add('="');
    }

    addAttributeContent(content: string) {
        this.add(content);
    }

    endAttribute() {
        this.add('"');
    }

    addNil(name: string) {
        if (this.lastElementIsStart) {
            this.closeStartElement();
        }

        this.depth++;
        this.add(this.getElementIndent());
        this.add("<");
        this.add(name);
        if (this.currentSegment.lineWidth > this.lineWidth) {
            this.addLine();
            this.add(this.getAttributeIndent());
        } else {
            this.add(" ");
        }
        this.add('xsi:nil="true"/>');
        this.depth--;
        this.addLine();
        this.lastElementIsStart = false;
    }

    addContent(name: string, content: string) {
        if (this.lastElementIsStart) {
            this.closeStartElement();
        }
        this.depth++;
        this.add(this.getElementIndent());
        this.add("<");
        this.add(name);
        this.add(">");
        this.add(content);
        this.add("</");
        this.depth--;
        this.add(name);
        this.add(">");
        this.addLine();
        this.lastElementIsStart = false;
    }

    getElementIndent(): string {
        return this.getElementIndentWithExtra(0);
    }

    getElementIndentWithExtra(extra: number): string {
        let nesting = this.depth + extra - 1;
        for (let i = this.indents.length - 1; i < nesting; i++) {
            this.indents.push(this.indents[i] + "  ");
        }
        return this.indents[nesting];
    }

    getAttributeIndent(): string {
        let nesting = this.depth + 1;
        for (let i = this.indents.length - 1; i < nesting; i++) {
            this.indents.push(this.indents[i] + "  ");
        }
        return this.indents[nesting];
    }

    mark(): XMLStringSegment {
        let r = this.currentSegment;
        this.currentSegment = new XMLStringSegment();
        this.segments.push(this.currentSegment);
        return r;
    }

    resetToFirstElementMark() {
        this.resetToMark(this.firstElementMark);
    }

    resetToMark(segment: XMLStringSegment) {
        if (segment) {
            this.currentSegment = segment;
        }
    }
}
