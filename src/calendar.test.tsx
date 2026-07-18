// Created by: Andrey Polyakov (andrey@polyakov.im)
import {expect, test} from '@jest/globals';
import {CalendarDate} from '@internationalized/date';
import {I18nProvider} from '@react-aria/i18n';
import {render, screen} from '@testing-library/react';

import React from 'react';

import {Calendar, RangeCalendar} from './calendar';

const renderCalendar = (
    props: Partial<React.ComponentProps<typeof Calendar.Root>> = {},
): ReturnType<typeof render> =>
    render(
        <I18nProvider locale={'fr-FR'}>
            <Calendar.Root aria-label={'Calendar'} {...props}>
                <Calendar.NavButton
                    slot={'previous'}
                    aria-label={'Previous month'}
                />
                <Calendar.Heading />
                <Calendar.NavButton
                    slot={'next'}
                    aria-label={'Next month'}
                />
                <Calendar.Grid weekdayStyle={'short'} />
            </Calendar.Root>
        </I18nProvider>,
    );

test('renders a grid with a month heading and cells', () => {
    renderCalendar({defaultValue: new CalendarDate(2026, 7, 15)});
    expect(screen.getByRole('grid')).toBeTruthy();
    expect(screen.getByRole('heading').textContent).toMatch(/juillet 2026/i);
});

test('the selected cell is marked data-selected', () => {
    renderCalendar({defaultValue: new CalendarDate(2026, 7, 15)});
    const selected = document.querySelector('[data-selected="true"]');
    expect(selected?.textContent).toBe('15');
});

test('the prev nav button is disabled at the minValue bound', () => {
    renderCalendar({
        defaultValue: new CalendarDate(2026, 7, 15),
        minValue: new CalendarDate(2026, 7, 1),
    });
    const prev = screen.getByRole('button', {name: 'Previous month'});
    expect(prev.hasAttribute('disabled')).toBe(true);
});

test('range: selection edges are marked data-selection-start/end', () => {
    render(
        <I18nProvider locale={'fr-FR'}>
            <RangeCalendar.Root
                aria-label={'Period'}
                defaultValue={{
                    start: new CalendarDate(2026, 7, 10),
                    end: new CalendarDate(2026, 7, 20),
                }}
            >
                <Calendar.Grid weekdayStyle={'short'} />
            </RangeCalendar.Root>
        </I18nProvider>,
    );
    expect(
        document.querySelector('[data-selection-start="true"]')?.textContent,
    ).toBe('10');
    expect(
        document.querySelector('[data-selection-end="true"]')?.textContent,
    ).toBe('20');
});
