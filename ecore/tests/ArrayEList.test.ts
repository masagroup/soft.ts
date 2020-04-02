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

test('Empty', () => {
    {
        var a = new ArrayEList<number>();
        expect(a.isEmpty()).toBeTruthy();
    }
    {
        var a = new ArrayEList<number>([1, 2, 3, 4]);
        expect(a.isEmpty()).toBeFalsy();
    }
});

test('Add',()=>{
    var a = new ArrayEList<number>();
    expect(a.add(0)).toBeTruthy();
    expect(a.add(1)).toBeTruthy();
    expect(a.toArray()).toEqual([0,1]);
});

test('Add_Unique',()=>{
    var a = new ArrayEList<number>([],true);
    expect(a.add(0)).toBeTruthy();
    expect(a.add(0)).toBeFalsy();
    expect(a.toArray()).toEqual([0]);
});

test('Insert',()=>{
    {
        var a = new ArrayEList<number>();
        expect(a.insert(0,0)).toBeTruthy();
        expect(a.toArray()).toEqual([0]);
    }
    {
        var a = new ArrayEList<number>([1]);
        expect(a.insert(0,0)).toBeTruthy();
        expect(a.toArray()).toEqual([0,1]);
    }
    {
        var a = new ArrayEList<number>([1]);
        expect(a.insert(1,0)).toBeTruthy();
        expect(a.toArray()).toEqual([1,0]);
    }
});

test('Insert_InvalidIndex',()=>{
    var a = new ArrayEList<number>();
    expect(() => {a.insert(1,0)}).toThrowError(RangeError);
});

test('Insert_Unique',()=>{
    var a = new ArrayEList<number>([0,1,2],true);
    expect(a.insert(0,2)).toBeFalsy();
});


