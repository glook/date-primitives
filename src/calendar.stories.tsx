// Created by: Andrey Polyakov (andrey@polyakov.im)

import {getLocalTimeZone, isWeekend, today} from '@internationalized/date';

import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';

import './demo.css';
import {DemoCalendarBody} from './demo-calendar';
import {Calendar} from './index';

import type {DateValue} from './index';

interface DemoProps {
    minValue?: DateValue;
    maxValue?: DateValue;
    isDateUnavailable?: (date: DateValue) => boolean;
}

/**
 * Single-date calendar. Cells expose `data-selected`, `data-disabled`,
 * `data-unavailable` and `data-outside-month`; nav buttons are real `<button>`
 * elements, so their disabled state is the native `:disabled`.
 */
const CalendarDemo = (props: DemoProps): React.ReactElement => (
    <div className={'DemoRoot'}>
        <Calendar.Root
            aria-label={'Event date'}
            className={'DemoCalendar'}
            {...props}
        >
            <DemoCalendarBody />
        </Calendar.Root>
    </div>
);

const meta: Meta<typeof CalendarDemo> = {
    title: 'Calendar',
    component: CalendarDemo,
};

export default meta;
type Story = StoryObj<typeof CalendarDemo>;

export const Default: Story = {};

/** Nav buttons disable themselves once the visible month hits a bound. */
export const Bounded: Story = {
    args: {
        minValue: today(getLocalTimeZone()).subtract({days: 3}),
        maxValue: today(getLocalTimeZone()).add({days: 12}),
    },
};

/** Unavailable days stay focusable but reject selection. */
export const WithUnavailableDates: Story = {
    args: {
        isDateUnavailable: (date) => isWeekend(date, 'en-US'),
    },
};
