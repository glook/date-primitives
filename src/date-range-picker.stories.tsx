// Created by: Andrey Polyakov (andrey@polyakov.im)

import {useButton} from '@react-aria/button';

import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';

import './demo.css';
import {DemoCalendarBody} from './demo-calendar';
import {
    DateField,
    DateRangePicker,
    RangeCalendar,
    useDateRangePickerContext,
} from './index';

const Segments = (): React.ReactElement => (
    <DateField.Segments>
        {(segment) => (
            <DateField.Segment segment={segment} className={'DemoSegment'} />
        )}
    </DateField.Segments>
);

/**
 * Two `DateField.Root`s fed by `startFieldProps` / `endFieldProps`, sharing one
 * focus manager through `groupProps` + `groupRef` - that is what carries arrow
 * navigation and auto-advance across the two fields.
 */
const RangePickerBody = (): React.ReactElement => {
    const {picker, state, groupRef} = useDateRangePickerContext();
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const {buttonProps} = useButton(picker.buttonProps, triggerRef);

    return (
        <div className={'DemoPickerWrap'}>
            <div {...picker.groupProps} ref={groupRef} className={'DemoGroup'}>
                <DateField.Root
                    {...picker.startFieldProps}
                    className={'DemoField'}
                >
                    <Segments />
                </DateField.Root>
                <span className={'DemoRangeSeparator'}>{'–'}</span>
                <DateField.Root
                    {...picker.endFieldProps}
                    className={'DemoField'}
                >
                    <Segments />
                </DateField.Root>
                <button
                    {...buttonProps}
                    ref={triggerRef}
                    type={'button'}
                    className={'DemoTrigger'}
                >
                    {'▾'}
                </button>
            </div>
            {state.isOpen ? (
                <div {...picker.dialogProps} className={'DemoPopover'}>
                    <RangeCalendar.Root
                        {...picker.calendarProps}
                        className={'DemoCalendar'}
                    >
                        <DemoCalendarBody />
                    </RangeCalendar.Root>
                </div>
            ) : null}
        </div>
    );
};

interface DemoProps {
    shouldCloseOnSelect?: boolean;
}

const DateRangePickerDemo = (props: DemoProps): React.ReactElement => (
    <div className={'DemoRoot'}>
        <DateRangePicker.Root aria-label={'Stay dates'} {...props}>
            <RangePickerBody />
        </DateRangePicker.Root>
    </div>
);

const meta: Meta<typeof DateRangePickerDemo> = {
    title: 'DateRangePicker',
    component: DateRangePickerDemo,
    args: {shouldCloseOnSelect: true},
};

export default meta;
type Story = StoryObj<typeof DateRangePickerDemo>;

export const Default: Story = {};

/** Keeps the popup open after the range is completed. */
export const StaysOpenOnSelect: Story = {args: {shouldCloseOnSelect: false}};
