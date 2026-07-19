// Created by: Andrey Polyakov (andrey@polyakov.im)
import {expect, test} from '@jest/globals';

import type {DateSegment} from '@react-stately/datepicker';

import {getDateFieldFillState} from './field-fill';

// Segments are built by hand on purpose: the rule has to hold across locales,
// granularities and calendar systems, and driving each of those through a render
// would cost an I18nProvider plus keyboard input per case.
const filled = (
    type: DateSegment['type'],
    text: string,
    placeholder: string,
): DateSegment => ({
    type,
    text,
    placeholder,
    isPlaceholder: false,
    isEditable: true,
});

const empty = (
    type: DateSegment['type'],
    placeholder: string,
): DateSegment => ({
    type,
    text: placeholder,
    placeholder,
    isPlaceholder: true,
    isEditable: true,
});

const literal = (text: string): DateSegment => ({
    type: 'literal',
    text,
    placeholder: '',
    isPlaceholder: false,
    isEditable: false,
});

test('empty field: nothing typed', () => {
    expect(
        getDateFieldFillState([
            empty('day', 'дд'),
            literal('.'),
            empty('month', 'мм'),
            literal('.'),
            empty('year', 'гггг'),
        ]),
    ).toEqual({isComplete: false, isEmpty: true});
});

test('partially typed date is neither complete nor empty', () => {
    expect(
        getDateFieldFillState([
            filled('day', '15', 'дд'),
            empty('month', 'мм'),
            empty('year', 'гггг'),
        ]),
    ).toEqual({isComplete: false, isEmpty: false});
});

test('complete date', () => {
    expect(
        getDateFieldFillState([
            filled('day', '15', 'дд'),
            filled('month', '07', 'мм'),
            filled('year', '2026', 'гггг'),
        ]),
    ).toEqual({isComplete: true, isEmpty: false});
});

test('half-typed year is not complete', () => {
    for (const year of ['2', '20', '202']) {
        expect(
            getDateFieldFillState([
                filled('day', '15', 'дд'),
                filled('month', '07', 'мм'),
                filled('year', year, 'гггг'),
            ]).isComplete,
        ).toBe(false);
    }
});

// de-DE formats as d.M.y - a single-digit day renders as "5" against a
// two-character placeholder. Comparing lengths would call this incomplete forever.
test('day without a leading zero is complete (de-DE)', () => {
    expect(
        getDateFieldFillState([
            filled('day', '5', 'tt'),
            filled('month', '7', 'mm'),
            filled('year', '2026', 'jjjj'),
        ]),
    ).toEqual({isComplete: true, isEmpty: false});
});

// en-US at minute granularity: "8:45 AM" - the hour has no leading zero either,
// and shouldForceLeadingZeros lets the consumer flip that at will.
test('date and time with an unpadded hour is complete (en-US)', () => {
    expect(
        getDateFieldFillState([
            filled('month', '2', 'mm'),
            filled('day', '3', 'dd'),
            filled('year', '2025', 'yyyy'),
            literal(', '),
            filled('hour', '8', 'hh'),
            literal(':'),
            filled('minute', '45', 'mm'),
            filled('dayPeriod', 'AM', 'AM'),
        ]),
    ).toEqual({isComplete: true, isEmpty: false});
});

test('an unfilled time segment keeps the field incomplete', () => {
    expect(
        getDateFieldFillState([
            filled('day', '15', 'дд'),
            filled('month', '07', 'мм'),
            filled('year', '2026', 'гггг'),
            filled('hour', '8', 'чч'),
            empty('minute', 'мм'),
        ]),
    ).toEqual({isComplete: false, isEmpty: false});
});

// Japanese calendar: 令和7年 - the year is relative to the era and genuinely
// short, so the four-digit rule must not apply.
test('short year is complete when an era segment is present', () => {
    expect(
        getDateFieldFillState([
            filled('era', '令和', '令和'),
            filled('year', '7', '年'),
            filled('month', '07', 'mm'),
            filled('day', '15', 'dd'),
        ]),
    ).toEqual({isComplete: true, isEmpty: false});
});

test('an unfilled era keeps the field incomplete', () => {
    expect(
        getDateFieldFillState([
            empty('era', '令和'),
            filled('year', '7', '年'),
            filled('month', '07', 'mm'),
            filled('day', '15', 'dd'),
        ]),
    ).toEqual({isComplete: false, isEmpty: false});
});

// Arabic-Indic digits: the year is full width, just not in ASCII.
test('non-ASCII digits count towards the year width', () => {
    expect(
        getDateFieldFillState([
            filled('day', '١٥', 'يوم'),
            filled('month', '٠٧', 'شهر'),
            filled('year', '٢٠٢٦', 'سنة'),
        ]),
    ).toEqual({isComplete: true, isEmpty: false});
});

test('non-editable segments are ignored', () => {
    expect(getDateFieldFillState([literal('.'), literal('/')])).toEqual({
        isComplete: true,
        isEmpty: true,
    });
});
