# @glook/date-primitives

Headless date and calendar primitives built on [react-aria](https://react-spectrum.adobe.com/react-aria/) hooks (`@react-aria/datepicker`, `@react-aria/calendar`).

No styles, no strings, no popup. You get structure, ARIA wiring and `data-*` state attributes; the markup and the appearance stay yours.

**[Live demo](https://glook.github.io/date-primitives/)** — a Storybook sandbox whose skin is attached entirely through the `data-*` attributes documented below.

```bash
npm install @glook/date-primitives
```

Peer deps: `react ^17.0.2 || ^18 || ^19`. Every major is covered by the CI test matrix.

## Usage

```tsx
import {Calendar, DateField} from '@glook/date-primitives';

<DateField.Root aria-label="Meeting date" className="field">
    <DateField.Segments>
        {(segment) => <DateField.Segment segment={segment} className="segment" />}
    </DateField.Segments>
</DateField.Root>;

<Calendar.Root aria-label="Event date" className="calendar">
    <Calendar.NavButton slot="previous">‹</Calendar.NavButton>
    <Calendar.Heading />
    <Calendar.NavButton slot="next">›</Calendar.NavButton>
    <Calendar.Grid renderCell={(date) => <Calendar.Cell date={date} className="cell" />} />
</Calendar.Root>;
```

`RangeCalendar.Root` swaps single-date selection for a range and reuses the very same parts — `Calendar.Heading`, `Calendar.NavButton`, `Calendar.Grid`, `Calendar.Cell` all read the context the root provides.

## Roots

| Root | Selection | Renders DOM |
| --- | --- | --- |
| `DateField.Root` | one date, segmented input | yes |
| `Calendar.Root` | one date, month grid | yes |
| `RangeCalendar.Root` | a range, month grid | yes |
| `DatePicker.Root` | one date, field + calendar | **no** |
| `DateRangePicker.Root` | a range, two fields + calendar | **no** |

The two picker roots render nothing at all. They own the state and hand it back through context, so the group element, the trigger and the overlay are entirely yours:

```tsx
import {Calendar, DateField, DatePicker, useDatePickerContext} from '@glook/date-primitives';
import {useButton} from '@react-aria/button';

const Body = () => {
    const {picker, state, groupRef} = useDatePickerContext();
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const {buttonProps} = useButton(picker.buttonProps, triggerRef);

    return (
        <div>
            {/* groupRef is required: the segment focus manager is built on this element */}
            <div {...picker.groupProps} ref={groupRef}>
                <DateField.Root {...picker.fieldProps}>
                    <DateField.Segments>
                        {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Segments>
                </DateField.Root>
                <button {...buttonProps} ref={triggerRef} type="button">▾</button>
            </div>
            {state.isOpen && (
                <div {...picker.dialogProps}>
                    <Calendar.Root {...picker.calendarProps}>{/* … */}</Calendar.Root>
                </div>
            )}
        </div>
    );
};

<DatePicker.Root aria-label="Delivery date"><Body /></DatePicker.Root>;
```

Bring your own positioning — floating-ui, Base UI, or a plain absolutely positioned `div`. The Storybook stories use the last one.

## Calendar systems

Every root takes a `createCalendar` prop, defaulting to a factory that knows Gregorian and nothing else. That default is what keeps the bundle small: pulling in the full `@internationalized/date` calendar registry would drag every calendar system into every consumer. Need Hebrew or Japanese? Pass your own factory — its weight lands in your bundle, not in the package.

## Locale

The package never hardcodes a locale. It reads whatever `I18nProvider` from `@react-aria/i18n` provides, re-exported here for convenience:

```tsx
import {I18nProvider} from '@glook/date-primitives';

<I18nProvider locale="en-US">{/* … */}</I18nProvider>;
```

Trim the aria string dictionaries you do not ship with [`@react-aria/optimize-locales-plugin`](https://www.npmjs.com/package/@react-aria/optimize-locales-plugin).

## Styling

There is no CSS. Hook onto the attributes:

| Element | Attributes |
| --- | --- |
| `DateField.Segment` | `data-segment` (the segment type), `data-placeholder` |
| `Calendar.Cell` | `data-selected`, `data-selection-start`, `data-selection-end`, `data-disabled`, `data-unavailable`, `data-outside-month` |
| hover / focus | native `:hover`, `:focus`, `:focus-visible` — nothing is emulated |

**Disabled state is native, not `data-*`.** Segments expose `aria-disabled="true"` (set by `useSpinButton`) and nav buttons expose the native `:disabled` (they are real `<button>` elements). Neither emits `data-disabled` — a skin ported from react-aria-components selectors will silently lose its disabled styling.

```css
.cell[data-selected] { background: #dbeafe; }
.segment[data-placeholder] { color: #9aa5b1; }
.segment[aria-disabled='true'] { color: #cbd2d9; }
.nav:disabled { opacity: 0.4; }
```

## Development

```bash
npm run storybook   # component catalogue, the only way to run things by hand
npm run build       # dist/index.{js,cjs,d.ts}
npm run typecheck
npm test
```

## License

MIT © Andrey Polyakov
