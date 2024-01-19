import {URI} from "./URI"

describe('URI', () => {
    test('constructor', () => {
        let uri = new URI("file:///path#fragment")
        expect(uri.protocol).toBe("file:")
        expect(uri.host).toBe("")
        expect(uri.port).toBe("")
        expect(uri.pathname).toBe("/path")
        expect(uri.hash).toBe("#fragment")
    });

    test('normalize', () => {
        expect( new URI("http://host:10020").normalize() ).toEqual(new URI("http://host:10020"))
        expect( new URI("http://host:10020/path").normalize() ).toEqual(new URI("http://host:10020/path"))
        expect( new URI("http://host:10020/./path").normalize() ).toEqual(new URI("http://host:10020/path"))
        expect( new URI("http://host:10020/path/../path2").normalize() ).toEqual(new URI("http://host:10020/path2"))
        expect( new URI("http://host:10020/path/./path2").normalize() ).toEqual(new URI("http://host:10020/path/path2"))
    });

    test('authority', () => {
        expect(new URI("file:///file.text").authority()).toEqual("")
        expect(new URI("file:/file.text").authority()).toEqual("")
        expect(new URI("http://host/file.text").authority()).toEqual("host")
        expect(new URI("http://host:10/file.text").authority()).toEqual("host:10")
        expect(new URI("http://userinfo@host:10/file.text").authority()).toEqual("userinfo@host:10")
    });

    test('relativize', () => {
        expect(new URI("http://host:10020/path/").relativize(new URI("http://host:10020/path/path2"))).toEqual(new URI("path2"))
        expect(new URI("testdata/path2").relativize(new URI("testdata/path1"))).toEqual(new URI("path1"))
    });

});