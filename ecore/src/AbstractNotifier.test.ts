// *****************************************************************************
//
// This file is part of a MASA library or program.
// Refer to the included end-user license agreement for restrictions.
//
// Copyright (c) 2020 MASA Group
//
// *****************************************************************************

test('get', () => {
    var a = new ArrayEList<number>([1, 2, 3, 4]);
    expect(a.get(0)).toBe(1);
    expect(a.get(1)).toBe(2);
    expect(a.get(2)).toBe(3);
    expect(a.get(3)).toBe(4);
});

