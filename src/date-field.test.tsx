// Created by: Andrey Polyakov (andrey@polyakov.im)
import {expect, jest, test} from '@jest/globals';
import {CalendarDate} from '@internationalized/date';
import {I18nProvider} from '@react-aria/i18n';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import {DateField} from './date-field';

const renderField = (
    props: Partial<React.ComponentProps<typeof DateField.Root>> = {},
): ReturnType<typeof render> =>
    render(
        <I18nProvider locale={'fr-FR'}>
            <DateField.Root aria-label={'Date'} {...props}>
                <DateField.Segments>
                    {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Segments>
            </DateField.Root>
        </I18nProvider>,
    );

test('renders three editable segments (dd.MM.yyyy for fr-FR)', () => {
    renderField();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
});

test('empty segments are marked data-placeholder', () => {
    renderField();
    const segments = screen.getAllByRole('spinbutton');
    segments.forEach((segment) => {
        expect(segment.getAttribute('data-placeholder')).toBe('true');
    });
});

test('typing segment by segment assembles a date and calls onChange', async () => {
    const onChange = jest.fn();
    renderField({onChange});
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('spinbutton')[0]);
    await user.keyboard('15072026');
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2026, 7, 15));
});

test('a value is laid out across the segments', () => {
    renderField({value: new CalendarDate(2026, 7, 15)});
    const texts = screen
        .getAllByRole('spinbutton')
        .map((segment) => segment.textContent);
    expect(texts).toEqual(['15', '07', '2026']);
});
