// Created by: Andrey Polyakov (andrey@polyakov.im)
import {expect, test} from '@jest/globals';
import {GregorianCalendar} from '@internationalized/date';

import {createGregorianCalendar} from './create-calendar';

test('returns GregorianCalendar for gregory', () => {
    expect(createGregorianCalendar('gregory')).toBeInstanceOf(
        GregorianCalendar,
    );
});

test('throws a clear error for another calendar system', () => {
    expect(() => createGregorianCalendar('buddhist')).toThrow(/buddhist/);
});
