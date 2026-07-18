// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {Preview} from '@storybook/react';

import React from 'react';

import {I18nProvider} from '../src';

// The locale is pinned: without I18nProvider react-aria would take the browser language,
// and month names on github.io would differ between the author and the reader.
const preview: Preview = {
    parameters: {
        controls: {expanded: true},
        options: {
            storySort: {
                order: [
                    'DateField',
                    'Calendar',
                    'RangeCalendar',
                    'DatePicker',
                    'DateRangePicker',
                ],
            },
        },
    },
    decorators: [
        (Story) => (
            <I18nProvider locale={'en-US'}>
                <Story />
            </I18nProvider>
        ),
    ],
};

export default preview;
