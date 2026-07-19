// Created by: Andrey Polyakov (andrey@polyakov.im)

// Public API of the package. sideEffects: false - tree-shaking by name.
export {createGregorianCalendar} from './create-calendar';
export type {CreateCalendar} from './create-calendar';

export {DateField, useDateFieldContext} from './date-field';
export type {DateFieldRootProps, DateFieldSegmentProps} from './date-field';

export {getDateFieldFillState} from './field-fill';
export type {DateFieldFillState} from './field-fill';

export {Calendar, RangeCalendar, useCalendarContext} from './calendar';
export type {
    CalendarRootProps,
    RangeCalendarRootProps,
    CalendarGridProps,
    CalendarCellProps,
    CalendarNavButtonProps,
} from './calendar';

export {DatePicker, useDatePickerContext} from './date-picker';
export type {DatePickerRootProps} from './date-picker';

export {DateRangePicker, useDateRangePickerContext} from './date-range-picker';
export type {DateRangePickerRootProps} from './date-range-picker';

// Locale is the consumer's concern: the package does not hardcode it.
export {I18nProvider, useLocale} from '@react-aria/i18n';

export type {DateValue} from '@react-aria/datepicker';
export type {DateFieldState, DateSegment} from '@react-stately/datepicker';
export type {CalendarState, RangeCalendarState} from '@react-stately/calendar';
