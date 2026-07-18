// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';

import './demo.css';
import {DemoCalendarBody} from './demo-calendar';
import {RangeCalendar} from './index';

/**
 * Range calendar. The parts (heading, nav buttons, grid, cells) are the same
 * `Calendar.*` components - they read the context this root provides. Range
 * edges are marked with `data-selection-start` / `data-selection-end`.
 *
 * The root also drops `blur` events with a null `relatedTarget` (ADR-0003):
 * paging the month unmounts the focused cell, and without the filter the engine
 * would commit a half-picked range. Try picking a start date and then clicking
 * the next-month button - the range stays open.
 */
const RangeCalendarDemo = (): React.ReactElement => (
    <div className={'DemoRoot'}>
        <RangeCalendar.Root
            aria-label={'Stay dates'}
            className={'DemoCalendar'}
        >
            <DemoCalendarBody />
        </RangeCalendar.Root>
    </div>
);

const meta: Meta<typeof RangeCalendarDemo> = {
    title: 'RangeCalendar',
    component: RangeCalendarDemo,
};

export default meta;
type Story = StoryObj<typeof RangeCalendarDemo>;

export const Default: Story = {};
