// Created by: Andrey Polyakov (andrey@polyakov.im)

// react-stately handles 'month' and 'year' at runtime (the field renders only the
// matching segments and the value is the first day of the period), but the public
// Granularity type of react-aria stops at 'day'. The roots widen the prop and hand
// the options to the hooks under the narrow type.
import type {Granularity} from '@react-stately/datepicker';

export type DateGranularity = Granularity | 'month' | 'year';
