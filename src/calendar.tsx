// Created by: Andrey Polyakov (andrey@polyakov.im)

// Calendar primitives: Root/RangeCalendar.Root own the state; the grid and the cells
// read the context. A cell hangs state data attributes for the skin to style;
// hover and focus-visible come to the skin from native :hover/:focus-visible.
import {endOfMonth, isSameDay, isSameMonth} from '@internationalized/date';
import {useButton} from '@react-aria/button';
import {
    useCalendar,
    useCalendarCell,
    useCalendarGrid,
    useRangeCalendar,
} from '@react-aria/calendar';
import {useDateFormatter, useLocale} from '@react-aria/i18n';
import {mergeProps} from '@react-aria/utils';
import {useCalendarState, useRangeCalendarState} from '@react-stately/calendar';

import type {
    AriaCalendarProps,
    AriaRangeCalendarProps,
    CalendarAria,
} from '@react-aria/calendar';
import type {DateValue} from '@react-aria/datepicker';
import type {
    CalendarState,
    PageBehavior,
    RangeCalendarState,
} from '@react-stately/calendar';
import type {CalendarDate, DateDuration} from '@internationalized/date';

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

// First date of the grid a cell belongs to, set only for grids with an offset: lets the
// cell tell its own month from a neighbour month's tail when several grids share one
// calendar state. A single grid keeps the neighbour days selectable.
const GridStartContext = React.createContext<CalendarDate | null>(null);

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
    /** How many months the state shows; render one Calendar.Grid per month with `offset`. */
    visibleDuration?: DateDuration;
    /** 'single' pages by one month even when several are visible. */
    pageBehavior?: PageBehavior;
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
    // Non-null assertion: the ref attaches to the div below in the same render,
    // consumers only read .current post-mount. Keeps the return type a plain
    // RefObject<HTMLDivElement> across @types/react 17/18/19 - without it,
    // @types/react 19's useRef(null) overload resolves to RefObject<T | null>.
    const rootRef = React.useRef<HTMLDivElement>(null!);
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
    /** See CalendarRootProps. */
    visibleDuration?: DateDuration;
    /** See CalendarRootProps. */
    pageBehavior?: PageBehavior;
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
    // See the non-null assertion comment in Root above.
    const rootRef = React.useRef<HTMLDivElement>(null!);
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

export interface CalendarHeadingProps extends React.ComponentPropsWithoutRef<'h2'> {
    /** Month of a multi-grid calendar this heading names, relative to the visible start. */
    offset?: DateDuration;
}

const Heading = (props: CalendarHeadingProps): React.ReactElement => {
    const {offset, ...restProps} = props;
    const {calendar, state} = useCalendarContext();
    const formatter = useDateFormatter({
        month: 'long',
        year: 'numeric',
        calendar: state.visibleRange.start.calendar.identifier,
        timeZone: state.timeZone,
    });
    const title =
        offset == null
            ? calendar.title
            : formatter.format(
                  state.visibleRange.start.add(offset).toDate(state.timeZone),
              );
    return <h2 {...restProps}>{title}</h2>;
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
    /** Month of this grid relative to the visible start; set it on every grid when several are shown. */
    offset?: DateDuration;
    /** Cell renderer; defaults to <Calendar.Cell date={date} />. */
    renderCell?: (date: CalendarDate) => React.ReactElement;
}

const Grid = (props: CalendarGridProps): React.ReactElement => {
    const {
        className,
        headerCellClassName,
        bodyClassName,
        weekdayStyle,
        offset,
        renderCell,
    } = props;
    const {state} = useCalendarContext();
    const startDate =
        offset == null
            ? state.visibleRange.start
            : state.visibleRange.start.add(offset);
    const endDate =
        offset == null ? state.visibleRange.end : endOfMonth(startDate);
    const {gridProps, headerProps, weekDays, weeksInMonth} = useCalendarGrid(
        {weekdayStyle, startDate, endDate},
        state,
    );

    return (
        <GridStartContext.Provider value={offset == null ? null : startDate}>
            <table {...gridProps} className={className}>
                <thead {...headerProps}>
                    <tr>
                        {weekDays.map((day, index) => (
                            <th
                                key={String(index)}
                                className={headerCellClassName}
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={bodyClassName}>
                    {Array.from({length: weeksInMonth}, (unused, weekIndex) => (
                        <tr key={String(weekIndex)}>
                            {state
                                .getDatesInWeek(weekIndex, startDate)
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
        </GridStartContext.Provider>
    );
};

export interface CalendarCellProps {
    date: CalendarDate;
    className?: string;
}

const Cell = (props: CalendarCellProps): React.ReactElement => {
    const {date, className} = props;
    const {state} = useCalendarContext();
    const gridStart = React.useContext(GridStartContext);
    const isOutsideMonth = gridStart != null && !isSameMonth(date, gridStart);
    const ref = React.useRef<HTMLDivElement>(null!);
    const {
        cellProps,
        buttonProps,
        formattedDate,
        isSelected,
        isDisabled,
        isUnavailable,
        isOutsideVisibleRange,
    } = useCalendarCell({date, isOutsideMonth}, state, ref);

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
                data-outside-month={
                    isOutsideMonth || isOutsideVisibleRange || undefined
                }
            >
                {formattedDate}
            </div>
        </td>
    );
};

export const Calendar = {Root, Heading, NavButton, Grid, Cell};
export const RangeCalendar = {Root: RangeRoot};
