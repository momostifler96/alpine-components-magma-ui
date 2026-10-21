# Date/time picker card

Read `docs/date-time-picker.md` for the full markup. This card is the quick
contract: modes, values, options and the pieces agents most often forget.

## Modes and value shapes

| `mode` | Selection | `value` |
| --- | --- | --- |
| `date` | One day | `'YYYY-MM-DD'` |
| `datetime` | Date and time | `'YYYY-MM-DDTHH:mm:ss'` |
| `multiple` | Several days | `['YYYY-MM-DD', …]` |
| `range` | Start and end | `{ start, end }` |
| `time` | One slot | `'HH:mm'` |
| `month` | One month | `'YYYY-MM'` |
| `year` | One year | `'YYYY'` |
| `week` | ISO week | `'YYYY-Www'` |

Values are local calendar dates, not timezone conversions. Week keys are ISO
week numbers.

## Markup contract

- Root: `.magma-datepicker` with `x-data="magmaDateTimePicker({...})"`.
- Trigger: `x-ref="trigger"`, `@click="toggle()"`, `@click.outside="close()"`
  on the root panel wrapper.
- Panel: `.magma-datepicker__panel`, `x-ref="panel"`, `:style="menuStyle"`,
  `x-show="open"`, `x-cloak`, `tabindex="-1"`, `role="dialog"`,
  `@keydown="onKeydown($event)"`.
- Each picker has its own Alpine scope, so the same literal `x-ref` names can
  be reused across separate picker instances.
- Month/year switcher: `hasViewSwitcher` is true for `date`, `datetime`,
  `multiple`, `range`, `week`; `monthTitle`, `viewYear`, `showMonths(year?)`
  and `showYears(year?)`.
- Time widget in `datetime`:
  `.magma-datepicker__time-widget` with three
  `.magma-datepicker__time-input` fields and `:` separators.
  Wire `@input="onTimePartInput(part, value)"`,
  `@blur="normalizeTimePart(part)"`,
  `@keydown.enter.prevent="normalizeTimePart(part)"`,
  `@keydown.up.prevent="stepTimePart(part, 1)"`,
  `@keydown.down.prevent="stepTimePart(part, -1)"`.
  Keep `inputmode="numeric"`, `maxlength="2"`, `pattern="[0-9]*"`.
- Footer: Today, optional Now (`datetime`), Clear and optional Done
  (`datetime`). Done calls `close()`.

## Options

| Option | Default | Notes |
| --- | --- | --- |
| `mode` | `'date'` | One of the eight modes. |
| `value` | mode-specific | Initial value with the shape above. |
| `locale` | browser | Month, weekday and trigger labels. |
| `weekStartsOn` | `1` | `1` Monday, `0` Sunday. Week mode is always ISO Monday. |
| `min` / `max` | `null` | ISO date bounds. |
| `disabledDates` | `[]` | ISO dates. |
| `disabled` | `null` | `(iso) => boolean`. |
| `timeStep` | `15` | Minutes between time slots in `time` mode. |
| `closeOnSelect` | `!['multiple','datetime']` | Datetime ignores it; range closes once both ends exist. |
| `placeholder` | mode-specific | Trigger placeholder. |
| `todayLabel` / `nowLabel` / `doneLabel` / `clearLabel` | `'Today'` / `'Now'` / `'Done'` / `'Clear'` | Footer labels. |
| `hourLabel` / `minuteLabel` / `secondLabel` | English labels | Time field ARIA labels. |
| `panelWidth` | `344`, range `680` | Number or CSS width. |
| `floating` | `true` | Fixed-position panel. Ignored by inline. |
| `inline` | `false` | Renders in page: no trigger, overlay or dialog; `open` is always true and `close()` is a no-op. |
| `shortcuts` | range presets | Array; `false` hides the range rail. |
| `shortcutsLabel` | `'Shortcuts'` | ARIA label of the rail. |
| `format` | – | `(value, mode, picker) => string` for the trigger label. |

## Range mode

- `calendarMonths` returns two consecutive month blocks
  (`{ key, year, month, title, days }`).
- Render each block as `.magma-datepicker__month` inside
  `.magma-datepicker__months`; render `month.days`.
- Put the calendar area in `.magma-datepicker__range`; the rail is
  `.magma-datepicker__shortcuts` and buttons are
  `.magma-datepicker__shortcut` (`is-active` when its range equals the value).
- Each month title should be a button calling `showMonths(month.year)` so the
  month grid opens for the correct year. The demo hides the header title group
  in range `days` view and relies on these month-title buttons.
- Outside-month days are hidden automatically inside
  `.magma-datepicker__range` (`visibility: hidden`), so the two grids do not
  show duplicate range shading.
- Submit/apply a shortcut with `applyShortcut(shortcut)`. It clamps to
  `min`/`max`, updates the view to the start month, commits and closes like a
  completed range. Passing `shortcuts` replaces the default list; it is not
  merged.

Default shortcuts:

| Label | `period` | `amount` |
| --- | --- | --- |
| Today | `today` | – |
| Yesterday | `yesterday` | – |
| Last 7 days | `last-days` | `7` |
| This week | `this-week` | – |
| This month | `this-month` | – |
| Last 3 months | `last-months` | `3` |
| This year | `this-year` | – |

Custom entries support:

```js
{ label: 'Ce mois', period: 'this-month' }
{ label: '3 derniers mois', period: 'last-months', amount: 3 }
{ label: 'T1 2026', range: { start: '2026-01-01', end: '2026-03-31' } }
{ label: 'Custom', getRange: () => ({ start: '2026-02-10', end: '2026-02-12' }) }
```

Supported periods: `today`, `yesterday`, `last-day`, `this-week`,
`last-week`, `this-month`, `last-month`, `this-year`, `last-year`,
`last-days`, `last-weeks`, `last-months`, `last-years`.

## Datetime mode

- One panel: month/year switcher, day grid, then the bordered `HH:MM:SS`
  widget. The widget stays visible while the date changes.
- Numeric fields are digit-only and clamp to `0–23` / `0–59`; blur and Enter
  normalize to two digits.
- ArrowUp/ArrowDown step by one and wrap (`23→00`, `59→00`). The panel keydown
  handler ignores events coming from inputs, so arrows do not move the
  calendar selection.
- The panel stays open after edits; Done, Escape or outside click closes it.
- Inline (`inline: true`) commits while editing and has nothing to close: omit
  the trigger, dialog role and Done button. No change event is emitted for the
  initial config `value`.
- `locale` localizes month/weekday names and the trigger display. Labels such
  as `todayLabel`, `nowLabel`, `clearLabel`, `doneLabel`, time field labels,
  placeholder, shortcuts label and default shortcut labels stay English unless
  passed explicitly. `panelLabel` is fixed per mode.

## State, methods and events

| Member | Role |
| --- | --- |
| `open` | Panel state; always true when inline. |
| `show()` / `close(options?)` / `toggle()` | Panel control. |
| `selectDate(iso)` | Day selection; behavior depends on mode. |
| `selectMonth(index)` / `selectYear(year)` | Select in month/year mode, otherwise navigate. |
| `selectTime(value)` / `setTimePart(part, value)` | Time selection. |
| `stepTimePart(part, direction)` | Arrow stepping for time fields. |
| `selectToday()` / `selectNow()` / `clear()` | Footer actions. |
| `applyShortcut(shortcut)` | Applies a range shortcut. |
| `calendarDays` / `calendarMonths` / `weeks` / `months` / `years` / `timeOptions` | Render collections. |
| `shortcuts` | Resolved shortcut entries with `range` and `active`. |
| `displayValue` / `hasValue` / `selectedCount` | Trigger display helpers. |

Event: `magma-datepicker:change` `{ value, mode }`. Week mode adds
`{ start, end }`. Arrays and range objects are shallow copies.
