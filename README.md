# @glook/date-primitives

Headless date and calendar primitives over react-aria hooks
(`@react-aria/datepicker`, `@react-aria/calendar`). No styles, no strings and
no popup - only structure, ARIA and data attributes of state.

- **Bundle**: the default `createCalendar` covers the Gregorian calendar only.
  For another system pass your own `createCalendar` to the Root (the weight of
  that implementation lands in your bundle, not in the package).
- **Locale**: taken from `I18nProvider` (`@react-aria/i18n`). Trim the aria
  string dictionaries at build time with `@react-aria/optimize-locales-plugin`.
- **State for styling**: `data-segment`, `data-placeholder` on segments;
  `data-selected`, `data-selection-start/end`, `data-disabled`,
  `data-unavailable`, `data-outside-month` on cells. Hover and focus are the
  native `:hover` / `:focus-visible`.

For now the package lives inside the opspost-lk monorepo
(`modules/date-primitives`); publishing to npm comes later. The API precedent is
`@glook/downshift-primitives`.
