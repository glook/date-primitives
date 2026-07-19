// Created by: Andrey Polyakov (andrey@polyakov.im)

// Whether the user has finished typing a segmented date. react-stately models
// this internally (IncompleteDate.isComplete/isCleared) but does not expose it:
// state.value is not a substitute, because in a controlled field the engine may
// return a best guess with the missing part defaulted while the segment is still
// a placeholder on screen.
import type {DateSegment} from '@react-stately/datepicker';

export interface DateFieldFillState {
    /** Every editable segment is filled in - the value can be committed. */
    isComplete: boolean;
    /** Every editable segment is still a placeholder - nothing was typed. */
    isEmpty: boolean;
}

// react-stately pins the year segment to 1..9999 for every calendar system,
// so full width is always 4 digits.
const YEAR_DIGITS = 4;

// Locale numbering systems are not always ASCII (ar-EG renders ٢٠٢٦), hence the
// Unicode digit class instead of \d.
const countDigits = (text: string): number =>
    (text.match(/\p{Nd}/gu) ?? []).length;

const isFilled = (segment: DateSegment, hasEra: boolean): boolean => {
    if (segment.isPlaceholder) {
        return false;
    }
    // Year is the only segment where a half-typed value is still a valid number:
    // year 2 exists, so "has a value" cannot mean "done". Every other segment is
    // settled the moment it holds a value - comparing text length instead would
    // break wherever the locale skips leading zeros (de-DE day, en-US hour) or
    // the segment is not numeric at all (dayPeriod, era). In era calendars the
    // year is relative and genuinely short, so the rule is off there.
    if (segment.type === 'year' && !hasEra) {
        return countDigits(segment.text) >= YEAR_DIGITS;
    }
    return true;
};

/**
 * Fill state of a segmented date field. Feed it `state.segments` from
 * `useDateFieldContext()`; non-editable segments (literals, time zone) are
 * ignored.
 */
export const getDateFieldFillState = (
    segments: DateSegment[],
): DateFieldFillState => {
    const editable = segments.filter((segment) => segment.isEditable);
    const hasEra = editable.some((segment) => segment.type === 'era');

    return {
        isComplete: editable.every((segment) => isFilled(segment, hasEra)),
        isEmpty: editable.every((segment) => segment.isPlaceholder),
    };
};
