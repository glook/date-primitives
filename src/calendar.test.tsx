// Created by: Andrey Polyakov (andrey@polyakov.im)
import {expect, jest, test} from '@jest/globals';
import {CalendarDate} from '@internationalized/date';
import {I18nProvider} from '@react-aria/i18n';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
                <Calendar.NavButton slot={'next'} aria-label={'Next month'} />
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

// Regression: the production bug "the range commits itself while paging through
// months" (see the commit history) - the cause is that focus falling into body
// (nav button disabling, cell unmounting) is indistinguishable by standard
// means from an ordinary focus move out of the calendar. The filter in
// RangeCalendar.Root (event.relatedTarget == null -> ignored) is the only
// guard, and this test covers both branches.
test('range: focus falling into body does not commit an unfinished range, an ordinary blur does', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
        <I18nProvider locale={'fr-FR'}>
            <div>
                <RangeCalendar.Root
                    aria-label={'Period'}
                    defaultFocusedValue={new CalendarDate(2026, 7, 15)}
                    onChange={onChange}
                >
                    <Calendar.Grid weekdayStyle={'short'} />
                </RangeCalendar.Root>
                <button type={'button'}>outside calendar</button>
            </div>
        </I18nProvider>,
    );

    // The "10" cell inside the visible month - not to be confused with the same-named cell
    // from an adjacent month in the grid padding (outside-month).
    const day10 = screen
        .getAllByText('10')
        .find((cell) => cell.getAttribute('data-outside-month') == null);
    if (day10 == null) {
        throw new Error('the "10" cell was not found in the visible month');
    }

    await user.click(day10);
    expect(onChange).not.toHaveBeenCalled();

    const root = screen.getByRole('application');

    // Focus falling into body: preact/compat translates onBlur into a native bubbling
    // focusout (see node_modules/preact/compat/src/render.js), so
    // fireEvent.focusOut on the root is the exact equivalent of real focus loss.
    fireEvent.focusOut(root, {relatedTarget: null});
    expect(onChange).not.toHaveBeenCalled();

    const outsideButton = screen.getByRole('button', {
        name: 'outside calendar',
    });
    fireEvent.focusOut(root, {relatedTarget: outsideButton});
    expect(onChange).toHaveBeenCalledTimes(1);
});

const renderTwoMonths = (): ReturnType<typeof render> =>
    render(
        <I18nProvider locale={'fr-FR'}>
            <Calendar.Root
                aria-label={'Calendar'}
                visibleDuration={{months: 2}}
                pageBehavior={'single'}
                defaultFocusedValue={new CalendarDate(2026, 7, 15)}
            >
                <Calendar.NavButton
                    slot={'previous'}
                    aria-label={'Previous month'}
                />
                <Calendar.Heading offset={{months: 0}} />
                <Calendar.Heading offset={{months: 1}} />
                <Calendar.NavButton slot={'next'} aria-label={'Next month'} />
                <Calendar.Grid weekdayStyle={'short'} offset={{months: 0}} />
                <Calendar.Grid weekdayStyle={'short'} offset={{months: 1}} />
            </Calendar.Root>
        </I18nProvider>,
    );

test('two visible months: a grid and a heading per month', () => {
    renderTwoMonths();
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    const headings = screen.getAllByRole('heading').map((h) => h.textContent);
    expect(headings[0]).toMatch(/juillet 2026/i);
    expect(headings[1]).toMatch(/août 2026/i);
});

test('two visible months: a neighbour month tail is data-outside-month in its grid', () => {
    renderTwoMonths();
    const [july, august] = screen.getAllByRole('grid');
    // 1 July 2026 is Wednesday: the Monday and Tuesday before it belong to June
    const julyOutside = july.querySelectorAll('[data-outside-month="true"]');
    expect(julyOutside.length).toBeGreaterThanOrEqual(2);
    expect(julyOutside[0].textContent).toBe('29');
    // August 2026 starts on Saturday: 27-31 July lead the grid, all outside
    const augustOutside = august.querySelectorAll(
        '[data-outside-month="true"]',
    );
    expect(augustOutside[0].textContent).toBe('27');
    // a day lives in exactly one grid as an in-month cell
    const inMonth = (grid: HTMLElement): string[] =>
        Array.from(
            grid.querySelectorAll('td > div:not([data-outside-month="true"])'),
        ).map((cell) => cell.textContent ?? '');
    expect(inMonth(july)).toHaveLength(31);
    expect(inMonth(august)).toHaveLength(31);
});

test('two visible months: next pages by one month', async () => {
    renderTwoMonths();
    await userEvent.click(screen.getByRole('button', {name: 'Next month'}));
    const headings = screen.getAllByRole('heading').map((h) => h.textContent);
    expect(headings[0]).toMatch(/août 2026/i);
    expect(headings[1]).toMatch(/septembre 2026/i);
});
