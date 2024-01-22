import { URI } from "./URI";

describe("URI", () => {
    test("constructor", () => {
        let uri = new URI("file:///path#fragment");
        expect(uri.scheme).toBe("file");
        expect(uri.host).toBe("");
        expect(uri.port).toBe("");
        expect(uri.path).toBe("/path");
        expect(uri.fragment).toBe("fragment");
        expect(uri.toString()).toBe("file:/path#fragment");
    });

    test("constructor-host", () => {
        let uri = new URI("http://user@host:10/path#fragment");
        expect(uri.scheme).toBe("http");
        expect(uri.user).toBe("user");
        expect(uri.host).toBe("host");
        expect(uri.port).toBe("10");
        expect(uri.path).toBe("/path");
        expect(uri.fragment).toBe("fragment");
        expect(uri.toString()).toBe("http://user@host:10/path#fragment");
    });

    test("constructor-relative", () => {
        let uri = new URI("path#fragment");
        expect(uri.scheme).toBe("");
        expect(uri.user).toBe("");
        expect(uri.host).toBe("");
        expect(uri.port).toBe("");
        expect(uri.path).toBe("path");
        expect(uri.fragment).toBe("fragment");
        expect(uri.toString()).toBe("path#fragment");
    });

    test("normalize", () => {
        expect(new URI("http://host:10020").normalize()).toEqual(new URI("http://host:10020"));
        expect(new URI("http://host:10020/path").normalize()).toEqual(new URI("http://host:10020/path"));
        expect(new URI("http://host:10020/./path").normalize()).toEqual(new URI("http://host:10020/path"));
        expect(new URI("http://host:10020/path/../path2").normalize()).toEqual(new URI("http://host:10020/path2"));
        expect(new URI("http://host:10020/path/./path2").normalize()).toEqual(new URI("http://host:10020/path/path2"));
    });

    test("authority", () => {
        expect(new URI("file:///file.text").authority()).toEqual("");
        expect(new URI("file:/file.text").authority()).toEqual("");
        expect(new URI("http://host/file.text").authority()).toEqual("host");
        expect(new URI("http://host:10/file.text").authority()).toEqual("host:10");
        expect(new URI("http://userinfo@host:10/file.text").authority()).toEqual("userinfo@host:10");
    });

    test("relativize", () => {
        expect(new URI("http://host:10020/path/").relativize(new URI("http://host:10020/path/path2"))).toEqual(
            new URI("path2"),
        );
        expect(new URI("testdata/path2").relativize(new URI("testdata/path1"))).toEqual(new URI("path1"));
    });

    test("resolve", () => {
        expect(new URI("http://host:10020/path/").resolve(new URI("http://host:10020/path2/"))).toEqual(
            new URI("http://host:10020/path2/"),
        );
        expect(new URI("http://host:10020/path/").resolve(new URI("../path2"))).toEqual(
            new URI("http://host:10020/path2"),
        );
        expect(new URI("http://host:10020/path/").resolve(new URI("/path2"))).toEqual(
            new URI("http://host:10020/path2"),
        );
        expect(new URI("http://host:10020/path/").resolve(new URI("./path2"))).toEqual(
            new URI("http://host:10020/path/path2"),
        );
        expect(new URI("path/path2").resolve(new URI("path3"))).toEqual(new URI("path/path3"));
    });
});
