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

// Pin test for the DOM contract: the skin (date-picker.module.scss) targets
// the segment aria-disabled, not a data-disabled of its own - react-aria does
// not set it. useSpinButton provides that attribute natively; the regression is losing
// the disabled visual style, without a single TS/lint failure.
test('a disabled field marks every segment aria-disabled', () => {
    renderField({isDisabled: true});
    const segments = screen.getAllByRole('spinbutton');
    expect(segments.length).toBeGreaterThan(0);
    segments.forEach((segment) => {
        expect(segment.getAttribute('aria-disabled')).toBe('true');
    });
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

test('a user onFocus on Segment does not overwrite the react-aria handlers', async () => {
    const onFocus = jest.fn();
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
        <I18nProvider locale={'fr-FR'}>
            <DateField.Root aria-label={'Date'} onChange={onChange}>
                <DateField.Segments>
                    {(segment) => (
                        <DateField.Segment
                            segment={segment}
                            onFocus={onFocus}
                        />
                    )}
                </DateField.Segments>
            </DateField.Root>
        </I18nProvider>,
    );

    await user.click(screen.getAllByRole('spinbutton')[0]);
    expect(onFocus).toHaveBeenCalled();

    await user.keyboard('15072026');
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2026, 7, 15));
});

// A spread on top (`{...segmentProps} {...spanProps}`) would pass the previous test: the span
// would in both cases get only the user onFocus, while the DOM focus event itself
// still fires. The real regression shows up in digit accumulation: the internal
// onFocus resets the react-aria buffer when a segment is refocused - without mergeProps
// the user onFocus fully replaces the internal one, the buffer is not reset, and
// the previously typed digit "sticks" to the new one.
test('refocusing a segment with a user onFocus resets the react-aria input buffer', async () => {
    const onFocus = jest.fn();
    const user = userEvent.setup();
    render(
        <I18nProvider locale={'fr-FR'}>
            <DateField.Root aria-label={'Date'}>
                <DateField.Segments>
                    {(segment) =>
                        segment.type === 'day' ? (
                            <DateField.Segment
                                segment={segment}
                                onFocus={onFocus}
                            />
                        ) : (
                            <DateField.Segment segment={segment} />
                        )
                    }
                </DateField.Segments>
            </DateField.Root>
        </I18nProvider>,
    );

    const segments = screen.getAllByRole('spinbutton');
    const day = segments[0];
    await user.click(day);
    await user.keyboard('1');
    await user.click(segments[1]);
    await user.click(day);
    await user.keyboard('2');

    expect(onFocus).toHaveBeenCalled();
    expect(day.textContent).toBe('02');
});
