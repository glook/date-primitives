// Created by: Andrey Polyakov (andrey@polyakov.im)

import {useButton} from '@react-aria/button';

import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';

import './demo.css';
import {DemoCalendarBody} from './demo-calendar';
import {Calendar, DateField, DatePicker, useDatePickerContext} from './index';

/**
 * Everything below the root is the consumer's markup: the root renders no DOM
 * at all (ADR-0004). It hands back `groupProps` + `groupRef` (the segment focus
 * manager is built on that element), `fieldProps`, `buttonProps`, `dialogProps`
 * and `calendarProps`.
 *
 * The popup is a plain conditional `<div>` - the package deliberately ships no
 * overlay, and no positioning library is needed to demonstrate the contract.
 */
const PickerBody = (): React.ReactElement => {
    const {picker, state, groupRef} = useDatePickerContext();
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    // buttonProps from react-aria are not DOM props (they carry onPress), so a
    // real button still goes through useButton - the package ships no button.
    const {buttonProps} = useButton(picker.buttonProps, triggerRef);

    return (
        <div className={'DemoPickerWrap'}>
            <div {...picker.groupProps} ref={groupRef} className={'DemoGroup'}>
                <DateField.Root {...picker.fieldProps} className={'DemoField'}>
                    <DateField.Segments>
                        {(segment) => (
                            <DateField.Segment
                                segment={segment}
                                className={'DemoSegment'}
                            />
                        )}
                    </DateField.Segments>
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
                    <Calendar.Root
                        {...picker.calendarProps}
                        className={'DemoCalendar'}
                    >
                        <DemoCalendarBody />
                    </Calendar.Root>
                </div>
            ) : null}
        </div>
    );
};

interface DemoProps {
    isDisabled?: boolean;
}

const DatePickerDemo = (props: DemoProps): React.ReactElement => (
    <div className={'DemoRoot'}>
        <DatePicker.Root aria-label={'Delivery date'} {...props}>
            <PickerBody />
        </DatePicker.Root>
    </div>
);

const meta: Meta<typeof DatePickerDemo> = {
    title: 'DatePicker',
    component: DatePickerDemo,
    args: {isDisabled: false},
};

export default meta;
type Story = StoryObj<typeof DatePickerDemo>;

export const Default: Story = {};

export const Disabled: Story = {args: {isDisabled: true}};
