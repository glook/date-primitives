// Created by: Andrey Polyakov (andrey@polyakov.im)

// Calendar primitives: Root/RangeCalendar.Root own the state; the grid and the cells
// read the context. A cell hangs state data attributes for the skin to style;
// hover and focus-visible come to the skin from native :hover/:focus-visible.
import {isSameDay} from '@internationalized/date';
import {useButton} from '@react-aria/button';
import {
    useCalendar,
    useCalendarCell,
    useCalendarGrid,
    useRangeCalendar,
} from '@react-aria/calendar';
import {useLocale} from '@react-aria/i18n';
import {mergeProps} from '@react-aria/utils';
import {useCalendarState, useRangeCalendarState} from '@react-stately/calendar';

import type {
    AriaCalendarProps,
    AriaRangeCalendarProps,
    CalendarAria,
} from '@react-aria/calendar';
import type {DateValue} from '@react-aria/datepicker';
import type {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import type {CalendarDate} from '@internationalized/date';

import React from 'react';

import {createGregorianCalendar} from './create-calendar';
import type {CreateCalendar} from './create-calendar';

interface CalendarContextValue {
    calendar: CalendarAria;
    state: CalendarState | RangeCalendarState;
    /** Calendar root element - for focus checks inside skins. */
    rootRef: React.RefObject<HTMLDivElement>;
}

const CalendarContext = React.createContext<CalendarContextValue | null>(null);

export const useCalendarContext = (): CalendarContextValue => {
    const context = React.useContext(CalendarContext);
    if (context == null) {
        throw new Error(
            'useCalendarContext must be called inside Calendar.Root or RangeCalendar.Root',
        );
    }
    return context;
};

export interface CalendarRootProps extends AriaCalendarProps<DateValue> {
    className?: string;
    children?: React.ReactNode;
    createCalendar?: CreateCalendar;
}

const Root = (props: CalendarRootProps): React.ReactElement => {
    const {
        className,
        children,
        createCalendar = createGregorianCalendar,
        ...calendarProps
    } = props;
    const {locale} = useLocale();
    const rootRef = React.useRef<HTMLDivElement>(null);
    const state = useCalendarState({...calendarProps, locale, createCalendar});
    const calendar = useCalendar(calendarProps, state);

    return (
        <CalendarContext.Provider value={{calendar, state, rootRef}}>
            <div
                {...calendar.calendarProps}
                ref={rootRef}
                className={className}
            >
                {children}
            </div>
        </CalendarContext.Provider>
    );
};

export interface RangeCalendarRootProps extends AriaRangeCalendarProps<DateValue> {
    className?: string;
    children?: React.ReactNode;
    createCalendar?: CreateCalendar;
}

const RangeRoot = (props: RangeCalendarRootProps): React.ReactElement => {
    const {
        className,
        children,
        createCalendar = createGregorianCalendar,
        ...calendarProps
    } = props;
    const {locale} = useLocale();
    const rootRef = React.useRef<HTMLDivElement>(null);
    const state = useRangeCalendarState({
        ...calendarProps,
        locale,
        createCalendar,
    });
    const calendar = useRangeCalendar(calendarProps, state, rootRef);

    // Focus falling into body (relatedTarget=null: nav button disabling, cell
    // unmounting while paging) is not the user leaving. Without the filter the engine
    // would commit the anchor mid-selection (commitBehavior=select on blur).
    const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
        if (event.relatedTarget == null) {
            return;
        }
        calendar.calendarProps.onBlur?.(event);
    };

    return (
        <CalendarContext.Provider value={{calendar, state, rootRef}}>
            <div
                {...calendar.calendarProps}
                onBlur={handleBlur}
                ref={rootRef}
                className={className}
            >
                {children}
            </div>
        </CalendarContext.Provider>
    );
};

const Heading = (
    props: React.ComponentPropsWithoutRef<'h2'>,
): React.ReactElement => {
    const {calendar} = useCalendarContext();
    return <h2 {...props}>{calendar.title}</h2>;
};

export interface CalendarNavButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    slot: 'previous' | 'next';
}

const NavButton = (props: CalendarNavButtonProps): React.ReactElement => {
    const {
        slot,
        children,
        className,
        'aria-label': ariaLabel,
        ...restProps
    } = props;
    const {calendar} = useCalendarContext();
    const ref = React.useRef<HTMLButtonElement>(null);
    const ariaProps =
        slot === 'previous'
            ? calendar.prevButtonProps
            : calendar.nextButtonProps;
    // preventFocusOnPress: a button at the min/max bound is disabled right after
    // the click, and the browser would drop focus into body - so it never takes focus.
    const {buttonProps} = useButton(
        {...ariaProps, preventFocusOnPress: true},
        ref,
    );

    return (
        // mergeProps: user handlers chain onto the aria wiring
        // instead of overwriting it (the same principle as in DateField.Segment).
        <button
            type={'button'}
            {...mergeProps(buttonProps, restProps)}
            aria-label={ariaLabel ?? buttonProps['aria-label']}
            ref={ref}
            className={className}
        >
            {children}
        </button>
    );
};

export interface CalendarGridProps {
    className?: string;
    headerCellClassName?: string;
    bodyClassName?: string;
    weekdayStyle?: 'narrow' | 'short' | 'long';
    /** Cell renderer; defaults to <Calendar.Cell date={date} />. */
    renderCell?: (date: CalendarDate) => React.ReactElement;
}

const Grid = (props: CalendarGridProps): React.ReactElement => {
    const {
        className,
        headerCellClassName,
        bodyClassName,
        weekdayStyle,
        renderCell,
    } = props;
    const {state} = useCalendarContext();
    const {gridProps, headerProps, weekDays, weeksInMonth} = useCalendarGrid(
        {weekdayStyle},
        state,
    );

    return (
        <table {...gridProps} className={className}>
            <thead {...headerProps}>
                <tr>
                    {weekDays.map((day, index) => (
                        <th key={String(index)} className={headerCellClassName}>
                            {day}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className={bodyClassName}>
                {Array.from({length: weeksInMonth}, (unused, weekIndex) => (
                    <tr key={String(weekIndex)}>
                        {state
                            .getDatesInWeek(weekIndex)
                            .map((date, dayIndex) =>
                                date != null ? (
                                    <React.Fragment key={String(dayIndex)}>
                                        {renderCell?.(date) ?? (
                                            <Cell date={date} />
                                        )}
                                    </React.Fragment>
                                ) : (
                                    <td key={String(dayIndex)} />
                                ),
                            )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export interface CalendarCellProps {
    date: CalendarDate;
    className?: string;
}

const Cell = (props: CalendarCellProps): React.ReactElement => {
    const {date, className} = props;
    const {state} = useCalendarContext();
    const ref = React.useRef<HTMLDivElement>(null);
    const {
        cellProps,
        buttonProps,
        formattedDate,
        isSelected,
        isDisabled,
        isUnavailable,
        isOutsideVisibleRange,
    } = useCalendarCell({date}, state, ref);

    const highlightedRange =
        'highlightedRange' in state ? state.highlightedRange : null;
    const isSelectionStart =
        highlightedRange != null && isSameDay(date, highlightedRange.start);
    const isSelectionEnd =
        highlightedRange != null && isSameDay(date, highlightedRange.end);

    return (
        <td {...cellProps}>
            <div
                {...buttonProps}
                ref={ref}
                className={className}
                data-selected={isSelected || undefined}
                data-selection-start={isSelectionStart || undefined}
                data-selection-end={isSelectionEnd || undefined}
                data-disabled={isDisabled || undefined}
                data-unavailable={isUnavailable || undefined}
                data-outside-month={isOutsideVisibleRange || undefined}
            >
                {formattedDate}
            </div>
        </td>
    );
};

export const Calendar = {Root, Heading, NavButton, Grid, Cell};
export const RangeCalendar = {Root: RangeRoot};
