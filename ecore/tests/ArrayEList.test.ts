import { ArrayEList } from '../src/ArrayEList'

test('Get', () => {
    var a = new ArrayEList<number>([1, 2, 3, 4]);
    expect(a.get(0)).toBe(1);
    expect(a.get(1)).toBe(2);
    expect(a.get(2)).toBe(3);
    expect(a.get(3)).toBe(4);
});

test('Size', () => {
    {
        var a = new ArrayEList<number>();
        expect(a.size()).toBe(0);
    }
    {
        var a = new ArrayEList<number>([1, 2, 3, 4]);
        expect(a.size()).toBe(4);
    }
});

