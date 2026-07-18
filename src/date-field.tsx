// Created by: Andrey Polyakov (andrey@polyakov.im)

// Segmented date field primitive: a {field, state} context over react-aria hooks.
// Policy-free: no styles, no strings - only structure, ARIA and data attributes
// of states for the consumer to style.
import {useDateField, useDateSegment} from '@react-aria/datepicker';
import {useLocale} from '@react-aria/i18n';
import {useDateFieldState} from '@react-stately/datepicker';

import type {
    AriaDateFieldProps,
    DateFieldAria,
    DateValue,
} from '@react-aria/datepicker';
import type {
    DateFieldState,
    DateSegment as DateSegmentState,
} from '@react-stately/datepicker';

import React from 'react';

import {createGregorianCalendar} from './create-calendar';
import type {CreateCalendar} from './create-calendar';

interface DateFieldContextValue {
    field: DateFieldAria;
    state: DateFieldState;
}

const DateFieldContext = React.createContext<DateFieldContextValue | null>(
    null,
);

export const useDateFieldContext = (): DateFieldContextValue => {
    const context = React.useContext(DateFieldContext);
    if (context == null) {
        throw new Error(
            'useDateFieldContext must be called inside DateField.Root',
        );
    }
    return context;
};

export interface DateFieldRootProps extends AriaDateFieldProps<DateValue> {
    className?: string;
    children?: React.ReactNode;
    /** Calendar factory; Gregorian-only by default. */
    createCalendar?: CreateCalendar;
}

const Root = (props: DateFieldRootProps): React.ReactElement => {
    const {
        className,
        children,
        createCalendar = createGregorianCalendar,
        ...fieldProps
    } = props;
    const ref = React.useRef<HTMLDivElement>(null);
    const {locale} = useLocale();
    const state = useDateFieldState({...fieldProps, locale, createCalendar});
    const field = useDateField(fieldProps, state, ref);

    return (
        <DateFieldContext.Provider value={{field, state}}>
            <div {...field.fieldProps} ref={ref} className={className}>
                {children}
            </div>
        </DateFieldContext.Provider>
    );
};

interface DateFieldSegmentsProps {
    children: (segment: DateSegmentState) => React.ReactElement;
}

/** Maps state segments with no DOM wrapper: the consumer owns the markup. */
const Segments = (props: DateFieldSegmentsProps): React.ReactElement => {
    const {state} = useDateFieldContext();
    return (
        <React.Fragment>
            {state.segments.map((segment, index) => (
                <React.Fragment key={String(index)}>
                    {props.children(segment)}
                </React.Fragment>
            ))}
        </React.Fragment>
    );
};

export interface DateFieldSegmentProps extends React.ComponentPropsWithoutRef<'span'> {
    segment: DateSegmentState;
}

const Segment = (props: DateFieldSegmentProps): React.ReactElement => {
    const {segment, ...spanProps} = props;
    const {state} = useDateFieldContext();
    const ref = React.useRef<HTMLSpanElement>(null);
    const {segmentProps} = useDateSegment(segment, state, ref);

    return (
        <span
            {...segmentProps}
            {...spanProps}
            ref={ref}
            data-segment={segment.type}
            data-placeholder={segment.isPlaceholder || undefined}
        >
            {segment.text}
        </span>
    );
};

export const DateField = {Root, Segments, Segment};
