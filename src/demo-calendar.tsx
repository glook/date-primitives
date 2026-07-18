// Created by: Andrey Polyakov (andrey@polyakov.im)

// Shared calendar body for the stories: header with nav buttons plus the grid. It lives
// on its own so four stories do not drift apart in markup; it stays out of the bundle -
// the build entry is src/index.ts only.
import React from 'react';

import {Calendar} from './index';

export const DemoCalendarBody = (): React.ReactElement => (
    <React.Fragment>
        <div className={'DemoCalendarHeader'}>
            <Calendar.NavButton slot={'previous'} className={'DemoNav'}>
                {'‹'}
            </Calendar.NavButton>
            <Calendar.Heading className={'DemoHeading'} />
            <Calendar.NavButton slot={'next'} className={'DemoNav'}>
                {'›'}
            </Calendar.NavButton>
        </div>
        <Calendar.Grid
            className={'DemoGrid'}
            headerCellClassName={'DemoWeekday'}
            renderCell={(date) => (
                <Calendar.Cell date={date} className={'DemoCell'} />
            )}
        />
    </React.Fragment>
);
