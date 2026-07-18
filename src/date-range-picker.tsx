// Created by: Andrey Polyakov (andrey@polyakov.im)

// Range root: startFieldProps/endFieldProps feed two DateField.Root instances,
// groupProps + groupRef - a shared focus manager (auto-advance, arrow keys,
// cross-field movement). Renders no DOM.
import {useDateRangePicker} from '@react-aria/datepicker';
import {useDateRangePickerState} from '@react-stately/datepicker';

import type {
    AriaDateRangePickerProps,
    DateRangePickerAria,
    DateValue,
} from '@react-aria/datepicker';
import type {DateRangePickerState} from '@react-stately/datepicker';

import React from 'react';

interface DateRangePickerContextValue {
    picker: DateRangePickerAria;
    state: DateRangePickerState;
    /** See the comment in date-picker.tsx - goes on the element with groupProps. */
    groupRef: React.RefObject<HTMLDivElement>;
}

const DateRangePickerContext =
    React.createContext<DateRangePickerContextValue | null>(null);

export const useDateRangePickerContext = (): DateRangePickerContextValue => {
    const context = React.useContext(DateRangePickerContext);
    if (context == null) {
        throw new Error(
            'useDateRangePickerContext must be called inside DateRangePicker.Root',
        );
    }
    return context;
};

export interface DateRangePickerRootProps extends AriaDateRangePickerProps<DateValue> {
    children?: React.ReactNode;
}

const Root = (props: DateRangePickerRootProps): React.ReactElement => {
    const {children, ...pickerProps} = props;
    const groupRef = React.useRef<HTMLDivElement>(null);
    const state = useDateRangePickerState(pickerProps);
    const picker = useDateRangePicker(pickerProps, state, groupRef);

    return (
        <DateRangePickerContext.Provider value={{picker, state, groupRef}}>
            {children}
        </DateRangePickerContext.Provider>
    );
};

export const DateRangePicker = {Root};
