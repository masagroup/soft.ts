import { ArrayEList } from './ArrayEList'

test('get', () => {
    var a = new ArrayEList<number>([1, 2, 3, 4]);
    expect(a.get(0)).toBe(1);
    expect(a.get(1)).toBe(2);
    expect(a.get(2)).toBe(3);
    expect(a.get(3)).toBe(4);
});

test('size', () => {
    {
        var a = new ArrayEList<number>();
        expect(a.size()).toBe(0);
    }
    {
        var a = new ArrayEList<number>([1, 2, 3, 4]);
        expect(a.size()).toBe(4);
    }
});

test('isEmpty', () => {
    {
        var a = new ArrayEList<number>();
        expect(a.isEmpty()).toBeTruthy();
    }
    {
        var a = new ArrayEList<number>([1, 2, 3, 4]);
        expect(a.isEmpty()).toBeFalsy();
    }
});

test('add',()=>{
    var a = new ArrayEList<number>();
    expect(a.add(0)).toBeTruthy();
    expect(a.add(1)).toBeTruthy();
    expect(a.toArray()).toEqual([0,1]);
});

test('add_unique',()=>{
    var a = new ArrayEList<number>([],true);
    expect(a.add(0)).toBeTruthy();
    expect(a.add(0)).toBeFalsy();
    expect(a.toArray()).toEqual([0]);
});


test('addAll',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    var b = new ArrayEList<number>([3,4,5]);
    expect( a.addAll(b)).toBeTruthy();
    expect(a.toArray()).toEqual([0,1,2,3,4,5]);
});

test('addAll_unique',()=>{
    var a = new ArrayEList<number>([0,1,2],true);
    var b = new ArrayEList<number>([1,2,3]);
    expect( a.addAll(b)).toBeTruthy();
    expect(a.toArray()).toEqual([0,1,2,3]);
});

test('insert',()=>{
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

test('insert_invalid_range',()=>{
    var a = new ArrayEList<number>();
    expect(() => {a.insert(1,0)}).toThrowError(RangeError);
});

test('insert_unique',()=>{
    var a = new ArrayEList<number>([0,1,2],true);
    expect(a.insert(0,2)).toBeFalsy();
});

test('insertAll',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    var b = new ArrayEList<number>([3,4,5]);
    expect( a.insertAll(0,b)).toBeTruthy();
    expect(a.toArray()).toEqual([3,4,5,0,1,2]);
});

test('insertAll_unique',()=>{
    var a = new ArrayEList<number>([0,1,2],true);
    var b = new ArrayEList<number>([1,2,3]);
    expect( a.insertAll(0,b)).toBeTruthy();
    expect(a.toArray()).toEqual([3,0,1,2]);
});

test('remove',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    expect(a.remove(1)).toBeTruthy();
    expect(a.toArray()).toEqual([0,2]);
    expect(a.remove(1)).toBeFalsy();
});


test('removeAt',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    expect(a.removeAt(0)).toBe(0);
    expect(a.toArray()).toEqual([1,2]);
});

test('removeAt_invalid_range',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    expect(() => {a.removeAt(3)}).toThrowError(RangeError);
});

test('removeAll',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    var b = new ArrayEList<number>([1,2]);
    expect( a.removeAll(b) ).toBeTruthy();
    expect(a.toArray()).toEqual([0]);
});

test('retainAll',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    var b = new ArrayEList<number>([1,2]);
    expect( a.retainAll(b) ).toBeTruthy();
    expect(a.toArray()).toEqual([1,2]);
});

test('set',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    expect(a.set(0,1)).toBe(0);
    expect(a.toArray()).toEqual([1,1,2]);
});

test('set_invalid_range',()=>{
    var a = new ArrayEList<number>([0,1,2]);
    expect(() => {a.set(3,1)}).toThrowError(RangeError);
});

test('set_invalid_constraint',()=>{
    var a = new ArrayEList<number>([0,1,2],true);
    expect(() => {a.set(0,1)}).toThrow();
});

test('indexOf',() => {
    var a = new ArrayEList<number>([0,1,2]);
    expect(a.indexOf(1)).toBe(1);
    expect(a.indexOf(3)).toBe(-1);
});

test('clear',() => {
    var a = new ArrayEList<number>([0,1,2]);
    expect(a.isEmpty()).toBeFalsy();
    a.clear();
    expect(a.isEmpty()).toBeTruthy();
});

test('contains',() => {
    var a = new ArrayEList<number>([0,1,2]);
    expect(a.contains(1)).toBeTruthy();
    expect(a.contains(3)).toBeFalsy();
});

test('iterator',() => {
    var a = new ArrayEList<number>([3,4,5]);
    var v : number[] = [];
    for (const i of a) {
        v.push(i);
    }
    expect(v).toEqual([3,4,5]);
});

