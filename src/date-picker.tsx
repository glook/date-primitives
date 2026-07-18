// Created by: Andrey Polyakov (andrey@polyakov.im)

// Picker root: owns the state and the aria wiring, renders no DOM - groupProps,
// fieldProps, buttonProps, dialogProps and calendarProps are laid out by the consumer.
import {useDatePicker} from '@react-aria/datepicker';
import {useDatePickerState} from '@react-stately/datepicker';

import type {
    AriaDatePickerProps,
    DatePickerAria,
    DateValue,
} from '@react-aria/datepicker';
import type {DatePickerState} from '@react-stately/datepicker';

import React from 'react';

interface DatePickerContextValue {
    picker: DatePickerAria;
    state: DatePickerState;
    /** Group ref: aria builds the segment focus manager on it. The consumer
     * must attach it to the element carrying {...picker.groupProps}. */
    groupRef: React.RefObject<HTMLDivElement>;
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(
    null,
);

export const useDatePickerContext = (): DatePickerContextValue => {
    const context = React.useContext(DatePickerContext);
    if (context == null) {
        throw new Error(
            'useDatePickerContext must be called inside DatePicker.Root',
        );
    }
    return context;
};

export interface DatePickerRootProps extends AriaDatePickerProps<DateValue> {
    children?: React.ReactNode;
}

const Root = (props: DatePickerRootProps): React.ReactElement => {
    const {children, ...pickerProps} = props;
    const groupRef = React.useRef<HTMLDivElement>(null);
    const state = useDatePickerState(pickerProps);
    const picker = useDatePicker(pickerProps, state, groupRef);

    return (
        <DatePickerContext.Provider value={{picker, state, groupRef}}>
            {children}
        </DatePickerContext.Provider>
    );
};

export const DatePicker = {Root};
