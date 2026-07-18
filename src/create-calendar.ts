// Created by: Andrey Polyakov (andrey@polyakov.im)

// Default calendar factory: Gregorian only. The other systems from
// @internationalized/date (Buddhist, Hijri and so on) stay out of the bundle.
// A consumer on another system passes its own createCalendar to the Root.
import {GregorianCalendar} from '@internationalized/date';

import type {Calendar} from '@internationalized/date';

export type CreateCalendar = (identifier: string) => Calendar;

export const createGregorianCalendar: CreateCalendar = (identifier) => {
    if (identifier === 'gregory') {
        return new GregorianCalendar();
    }
    throw new Error(
        `@glook/date-primitives: calendar "${identifier}" is not supported by the default factory - pass your own createCalendar`,
    );
};
