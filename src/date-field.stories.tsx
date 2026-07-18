// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';

import './demo.css';
import {DateField} from './index';

interface DemoProps {
    isDisabled?: boolean;
}

/**
 * A segmented date input. Segments carry `data-segment` (year, month, day,
 * literal) and `data-placeholder`; the disabled state arrives as the native
 * `aria-disabled` set by useSpinButton, not as `data-disabled`.
 */
const DateFieldDemo = (props: DemoProps): React.ReactElement => (
    <div className={'DemoRoot'}>
        <DateField.Root
            aria-label={'Meeting date'}
            isDisabled={props.isDisabled}
            className={'DemoField'}
        >
            <DateField.Segments>
                {(segment) => (
                    <DateField.Segment
                        segment={segment}
                        className={'DemoSegment'}
                    />
                )}
            </DateField.Segments>
        </DateField.Root>
    </div>
);

const meta: Meta<typeof DateFieldDemo> = {
    title: 'DateField',
    component: DateFieldDemo,
    args: {isDisabled: false},
};

export default meta;
type Story = StoryObj<typeof DateFieldDemo>;

export const Default: Story = {};

export const Disabled: Story = {args: {isDisabled: true}};
